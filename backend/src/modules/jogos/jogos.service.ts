import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JogosService {
    constructor(
        @InjectPinoLogger(JogosService.name)
        private readonly logger: PinoLogger,
        private readonly prisma: PrismaService,
    ) { }

    // Verifica se o jogo já existe; se não, insere pela primeira vez.
    // A API retorna id numérico — armazenamos como string.
    async garantirJogoExiste(jogoId: string, api: any): Promise<void> {
        const existente = await this.prisma.jogos.findUnique({
            where: { id: jogoId },
            select: { id: true },
        });

        if (existente) return; // Jogo já cadastrado, nada a fazer

        this.logger.info(
            { jogo_id: jogoId },
            `Novo jogo detectado: ${api['time-casa']} vs ${api['time-visitante']}`,
        );

        // Mapeamento direto das chaves da API (com hífens) para os campos do banco
        await this.prisma.jogos.create({
            data: {
                id: jogoId,
                liga: api['liga'] ?? 'Desconhecida',
                time_casa: api['time-casa'] ?? 'Time Casa',
                time_visitante: api['time-visitante'] ?? 'Time Visitante',

                // --- Links de apostas ---
                link_betfair: api['link-betfair'] ? String(api['link-betfair']) : null,
                link_superbet: api['link-superbet'] ?? null,
                link_bet365: api['link-bet365'] ?? null,

                // --- Placar HT ---
                placar_ht_casa: api['placar_ht-casa'] ?? null,
                placar_ht_visitante: api['placar_ht-visitante'] ?? null,
                placar_ht_total: api['placar_ht-total'] ?? null,

                // --- H2H ---
                h2h_casa: api['h2h-casa'] ?? null,
                h2h_visitante: api['h2h-visitante'] ?? null,
                h2h_total: api['h2h-total'] ?? null,

                // --- Classificação ---
                classificacao_casa: api['classificacao-casa'] ?? null,
                classificacao_visitante: api['classificacao-visitante'] ?? null,
                classificacao_total: api['classificacao-total'] ?? null,

                // --- PPJ ---
                ppj_casa: api['ppj-casa'] ?? null,
                ppj_visitante: api['ppj-visitante'] ?? null,
                ppj_total: api['ppj-total'] ?? null,

                // --- Vitórias (%) ---
                vitoria_casa: api['vitoria-casa'] ?? null,
                vitoria_visitante: api['vitoria-visitante'] ?? null,
                vitoria_total: api['vitoria-total'] ?? null,

                // --- Derrotas (%) ---
                derrota_casa: api['derrota-casa'] ?? null,
                derrota_visitante: api['derrota-visitante'] ?? null,
                derrota_total: api['derrota-total'] ?? null,

                // --- Média de gols marcados ---
                media_gols_marcados_casa: api['media_gols_marcados-casa'] ?? null,
                media_gols_marcados_visitante: api['media_gols_marcados-visitante'] ?? null,
                media_gols_marcados_total: api['media_gols_marcados-total'] ?? null,

                // --- Média de gols marcados HT ---
                media_gols_marcados_ht_casa: api['media_gols_marcados_ht-casa'] ?? null,
                media_gols_marcados_ht_visitante: api['media_gols_marcados_ht-visitante'] ?? null,
                media_gols_marcados_ht_total: api['media_gols_marcados_ht-total'] ?? null,

                // --- Média de gols sofridos ---
                media_gols_sofridos_casa: api['media_gols_sofridos-casa'] ?? null,
                media_gols_sofridos_visitante: api['media_gols_sofridos-visitante'] ?? null,
                media_gols_sofridos_total: api['media_gols_sofridos-total'] ?? null,

                // --- Média de gols sofridos HT ---
                medias_gols_sofridos_ht_casa: api['medias_gols_sofridos_ht-casa'] ?? null,
                medias_gols_sofridos_ht_visitante: api['medias_gols_sofridos_ht-visitante'] ?? null,
                medias_gols_sofridos_ht_total: api['medias_gols_sofridos_ht-total'] ?? null,

                // --- xG pré-jogo ---
                xg_pre_casa: api['xg_pre-casa'] ?? null,
                xg_pre_visitante: api['xg_pre-visitante'] ?? null,
                xg_pre_total: api['xg_pre-total'] ?? null,

                // --- xGA pré-jogo ---
                xga_pre_casa: api['xga_pre-casa'] ?? null,
                xga_pre_visitante: api['xga_pre-visitante'] ?? null,
                xga_pre_total: api['xga_pre-total'] ?? null,

                // --- Clean Sheet (%) ---
                clean_sheet_casa: api['clean_sheet-casa'] ?? null,
                clean_sheet_visitante: api['clean_sheet-visitante'] ?? null,
                clean_sheet_total: api['clean_sheet-total'] ?? null,

                // --- BTTS (%) ---
                btts_casa: api['btts-casa'] ?? null,
                btts_visitante: api['btts-visitante'] ?? null,
                btts_total: api['btts-total'] ?? null,

                // --- Over 0.5 HT (%) ---
                over_05_ht_casa: api['over_0_5_ht-casa'] ?? null,
                over_05_ht_visitante: api['over_0_5_ht-visitante'] ?? null,
                over_05_ht_total: api['over_0_5_ht-total'] ?? null,

                // --- Over 1.5 (%) ---
                over_15_casa: api['over_1_5-casa'] ?? null,
                over_15_visitante: api['over_1_5-visitante'] ?? null,
                over_15_total: api['over_1_5-total'] ?? null,

                // --- Over 2.5 (%) ---
                over_25_casa: api['over_2_5-casa'] ?? null,
                over_25_visitante: api['over_2_5-visitante'] ?? null,
                over_25_total: api['over_2_5-total'] ?? null,

                // --- Over 0.5 marcados (%) ---
                over_05_marcados_casa: api['over_0_5_marcados-casa'] ?? null,
                over_05_marcados_visitante: api['over_0_5_marcados-visitante'] ?? null,
                over_05_marcados_total: api['over_0_5_marcados-total'] ?? null,

                // --- Over 0.5 sofridos (%) ---
                over_05_sofridos_casa: api['over_0_5_sofridos-casa'] ?? null,
                over_05_sofridos_visitante: api['over_0_5_sofridos-visitante'] ?? null,
                over_05_sofridos_total: api['over_0_5_sofridos-total'] ?? null,

                // --- Médias de gols gerais ---
                media_gols_casa: api['media_gols-casa'] ?? null,
                media_gols_visitante: api['media_gols-visitante'] ?? null,
                media_gols_total: api['media_gols-total'] ?? null,

                // --- Médias de gols HT ---
                media_gols_ht_casa: api['media_gols_ht-casa'] ?? null,
                media_gols_ht_visitante: api['media_gols_ht-visitante'] ?? null,
                media_gols_ht_total: api['media_gols_ht-total'] ?? null,

                // --- Gol após 75' (%) ---
                gol_75_casa: api['gol_75-casa'] ?? null,
                gol_75_visitante: api['gol_75-visitante'] ?? null,
                gol_75_total: api['gol_75-total'] ?? null,

                // --- Odds pré-jogo ---
                odds_casa_pre: api['odds_casa-pre'] ?? null,
                odds_visitante_pre: api['odds_visitante-pre'] ?? null,
                odds_empate_pre: api['odds_empate-pre'] ?? null,
                odds_btts_sim_pre: api['odds_btts_sim-pre'] ?? null,
                odds_over_05_pre: api['odds_over_0_5-pre'] ?? null,
                odds_over_15_pre: api['odds_over_1_5-pre'] ?? null,
                odds_over_25_pre: api['odds_over_2_5-pre'] ?? null,
                odds_over_35_pre: api['odds_over_3_5-pre'] ?? null,
                odds_over_05_ht_pre: api['odds_over_0_5_ht-pre'] ?? null,
            },
        });

        this.logger.info({ jogo_id: jogoId }, 'Jogo inserido com sucesso');
    }

    // Lista todos os jogos registrados
    async listarJogos() {
        return this.prisma.jogos.findMany({
            orderBy: { criado_em: 'desc' },
        });
    }

    // Busca um jogo específico com todos os seus snapshots
    async buscarJogoPorId(jogoId: string) {
        return this.prisma.jogos.findUnique({
            where: { id: jogoId },
            include: {
                snapshots: {
                    orderBy: [{ periodo: 'asc' }, { tempo: 'asc' }],
                },
            },
        });
    }
}
