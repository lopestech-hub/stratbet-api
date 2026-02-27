import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { PrismaService } from '../../prisma/prisma.service';
import { JogosService } from '../jogos/jogos.service';
import { SnapshotsService } from '../snapshots/snapshots.service';
import { EstadoJogo, MapaEstadoJogos } from './coletor.types';

@Injectable()
export class ColetorService {
    // Estado dos jogos mantido em memória
    // { jogo_id: { ultimo_tempo, ultimo_periodo } }
    private estadoJogos: MapaEstadoJogos = new Map();

    constructor(
        @InjectPinoLogger(ColetorService.name)
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly jogosService: JogosService,
        private readonly snapshotsService: SnapshotsService,
    ) { }

    // Roda a cada 30 segundos
    @Cron('*/30 * * * * *')
    async coletarDados(): Promise<void> {
        const inicio = Date.now();
        this.logger.debug('Iniciando coleta de dados ao vivo...');

        try {
            // 1. Busca todos os jogos ao vivo na API externa
            const jogosAoVivo = await this.buscarJogosNaApi();

            if (!jogosAoVivo || jogosAoVivo.length === 0) {
                this.logger.info('Nenhum jogo ao vivo no momento');
                this.estadoJogos.clear(); // Limpa estado pois não há jogos ativos
                return;
            }

            // 2. Set dos IDs ativos nesta rodada (para detectar jogos encerrados)
            const idsAtivos = new Set<string>();

            // 3. Processa cada jogo
            for (const dadosJogo of jogosAoVivo) {
                await this.processarJogo(dadosJogo, idsAtivos);
            }

            // 4. Remove do estado os jogos que não aparecem mais (encerrados)
            this.removerJogosEncerrados(idsAtivos);

            const duracao = Date.now() - inicio;
            this.logger.info(
                { jogos_ativos: jogosAoVivo.length, duracao_ms: duracao },
                `Coleta concluída: ${jogosAoVivo.length} jogo(s) processado(s) em ${duracao}ms`,
            );
        } catch (erro) {
            this.logger.error({ erro }, 'Erro na coleta de dados ao vivo');
        }
    }

    // Processa um único jogo da resposta da API
    private async processarJogo(
        dadosJogo: any,
        idsAtivos: Set<string>,
    ): Promise<void> {
        const jogoId = String(dadosJogo.id);
        const tempoAtual = dadosJogo['tempo'] as number;
        const timeCasa = dadosJogo['time-casa'];
        const timeVisitante = dadosJogo['time-visitante'];
        const placar = `${dadosJogo['placar-casa']}x${dadosJogo['placar-visitante']}`;

        idsAtivos.add(jogoId);

        // Garante que o jogo existe na tabela jogos
        const { isNovoJogo } = await this.jogosService.garantirJogoExiste(jogoId, dadosJogo);
        if (isNovoJogo) {
            this.logger.info({ jogoId, timeCasa, timeVisitante }, `🆕 Novo jogo detectado: ${timeCasa} vs ${timeVisitante}`);
        }

        // Recupera o estado atual em memória
        let estado = this.estadoJogos.get(jogoId);

        if (!estado) {
            estado = await this.recuperarEstadoDoBanco(jogoId);
        }

        // Detecta o período e decide se deve salvar
        const decisao = this.decidirSalvamento(tempoAtual, estado);

        this.logger.debug(
            {
                jogoId,
                confronto: `${timeCasa} vs ${timeVisitante}`,
                placar,
                tempo: tempoAtual,
                motivo: decisao.motivo
            },
            `Analisando jogo: ${timeCasa} [${placar}] ${tempoAtual}'`
        );

        if (!decisao.deveSalvar) return;

        // Log detalhado do salvamento
        const acao = decisao.motivo === 'atualizacao_minuto' ? '🔄 Atualizando' : '💾 Salvando novo';
        this.logger.info(
            {
                jogo_id: jogoId,
                confronto: `${timeCasa} vs ${timeVisitante}`,
                placar,
                tempo: tempoAtual,
                periodo: decisao.periodo,
                motivo: decisao.motivo,
            },
            `${acao} snapshot: ${timeCasa} vs ${timeVisitante} | ${decisao.periodo}T | ${tempoAtual}' [${placar}]`,
        );

        // Salva o snapshot
        await this.snapshotsService.salvarSnapshot({
            jogo_id: jogoId,
            periodo: decisao.periodo,
            tempo: tempoAtual,
            dados: dadosJogo,
        });

        // Atualiza o estado em memória
        this.estadoJogos.set(jogoId, {
            ultimo_tempo: tempoAtual,
            ultimo_periodo: decisao.periodo,
        });
    }

    // Lógica central de controle de período e decisão de salvamento
    private decidirSalvamento(
        tempoAtual: number,
        estado: EstadoJogo | undefined,
    ): { deveSalvar: boolean; periodo: number; motivo: string } {
        // Primeiro snapshot deste jogo — salva e define como período 1
        if (!estado) {
            return { deveSalvar: true, periodo: 1, motivo: 'primeiro_snapshot' };
        }

        // Minuto regrediu → mudança de período (1T para 2T, etc.)
        if (tempoAtual < estado.ultimo_tempo) {
            return {
                deveSalvar: true,
                periodo: estado.ultimo_periodo + 1,
                motivo: 'novo_periodo',
            };
        }

        // Minuto avançou → novo dado, salvar
        if (tempoAtual > estado.ultimo_tempo) {
            return {
                deveSalvar: true,
                periodo: estado.ultimo_periodo,
                motivo: 'minuto_novo',
            };
        }

        // Minuto idêntico ao último salvo → Autoriza salvamento para atualização (Upsert)
        return { deveSalvar: true, periodo: estado.ultimo_periodo, motivo: 'atualizacao_minuto' };
    }

    // Recupera o estado do banco caso o servidor tenha reiniciado (estado em memória perdido)
    private async recuperarEstadoDoBanco(
        jogoId: string,
    ): Promise<EstadoJogo | undefined> {
        try {
            const ultimoSnapshot = await this.prisma.snapshots.findFirst({
                where: { jogo_id: jogoId },
                orderBy: { capturado_em: 'desc' },
                select: { tempo: true, periodo: true },
            });

            if (!ultimoSnapshot) return undefined;

            this.logger.debug(
                { jogo_id: jogoId, ...ultimoSnapshot },
                'Estado recuperado do banco após reinício',
            );

            return {
                ultimo_tempo: ultimoSnapshot.tempo,
                ultimo_periodo: ultimoSnapshot.periodo,
            };
        } catch (erro) {
            this.logger.warn({ erro, jogo_id: jogoId }, 'Falha ao recuperar estado do banco');
            return undefined;
        }
    }

    // Remove do mapa em memória os jogos que não aparecem mais na API (encerrados)
    private async removerJogosEncerrados(idsAtivos: Set<string>): Promise<void> {
        for (const [jogoId] of this.estadoJogos) {
            if (!idsAtivos.has(jogoId)) {
                // Remove da memória
                this.estadoJogos.delete(jogoId);

                // Marca como FINALIZADO no banco de dados
                try {
                    await this.prisma.jogos.update({
                        where: { id: jogoId },
                        data: { status: 'FINALIZADO' }
                    });
                    this.logger.info({ jogo_id: jogoId }, '🏁 Jogo encerrado — status atualizado para FINALIZADO');
                } catch (erro) {
                    this.logger.error({ erro, jogo_id: jogoId }, 'Erro ao marcar jogo como FINALIZADO');
                }
            }
        }
    }

    // Busca os dados da API externa de futebol ao vivo
    private async buscarJogosNaApi(): Promise<any[]> {
        const url = this.configService.get<string>('API_FUTEBOL_URL');
        const token = this.configService.get<string>('API_FUTEBOL_TOKEN');

        if (!url) {
            this.logger.warn('API_FUTEBOL_URL não configurada');
            return [];
        }

        const resposta = await axios.get(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            timeout: 15000, // 15 segundos de timeout (coleta a cada 30s)
        });

        return resposta.data;
    }

    // Retorna o estado atual em memória (útil para debug/monitoramento)
    obterEstadoAtual(): Record<string, EstadoJogo> {
        return Object.fromEntries(this.estadoJogos);
    }
}
