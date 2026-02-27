import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SnapshotsService {
    constructor(
        @InjectPinoLogger(SnapshotsService.name)
        private readonly logger: PinoLogger,
        private readonly prisma: PrismaService,
    ) { }

    // Salva um snapshot ao vivo do jogo.
    // Chamado apenas quando há mudança de minuto ou novo período detectado.
    // Recebe { jogo_id, periodo, tempo, dados: <objeto flat da API> }
    async salvarSnapshot(entrada: {
        jogo_id: string;
        periodo: number;
        tempo: number;
        dados: any; // Objeto flat retornado pela API (chaves com hífens)
    }) {
        const { jogo_id, periodo, tempo, dados: api } = entrada;

        // Nota: a API retorna odds_over_2_5_live com underscore (incoerência na fonte)
        const snapshot = await this.prisma.snapshots.create({
            data: {
                jogo_id,
                periodo,
                tempo,

                // --- Placar ao vivo ---
                placar_casa: api['placar-casa'] ?? 0,
                placar_visitante: api['placar-visitante'] ?? 0,
                placar_total: api['placar-total'] ?? 0,

                // --- xG ao vivo ---
                xg_casa: api['xg-casa'] ?? null,
                xg_visitante: api['xg-visitante'] ?? null,
                xg_total: api['xg-total'] ?? null,

                // --- PI1 ---
                pi1_casa: api['pi1-casa'] ?? null,
                pi1_visitante: api['pi1-visitante'] ?? null,
                pi1_total: api['pi1-total'] ?? null,

                // --- PI2 ---
                pi2_casa: api['pi2-casa'] ?? null,
                pi2_visitante: api['pi2-visitante'] ?? null,
                pi2_total: api['pi2-total'] ?? null,

                // --- PI3 ---
                pi3_casa: api['pi3-casa'] ?? null,
                pi3_visitante: api['pi3-visitante'] ?? null,
                pi3_total: api['pi3-total'] ?? null,

                // --- APPM (ações por minuto - acumulado) ---
                appm_casa: api['appm-casa'] ?? null,
                appm_visitante: api['appm-visitante'] ?? null,
                appm_total: api['appm-total'] ?? null,

                // --- APPM10 (ações por minuto - últimos 10 min) ---
                appm10_casa: api['appm10-casa'] ?? null,
                appm10_visitante: api['appm10-visitante'] ?? null,
                appm10_total: api['appm10-total'] ?? null,

                // --- CG (chutes a gol - acumulado) ---
                cg_casa: api['cg-casa'] ?? null,
                cg_visitante: api['cg-visitante'] ?? null,
                cg_total: api['cg-total'] ?? null,

                // --- CG10 (chutes a gol - últimos 10 min) ---
                cg10_casa: api['cg10-casa'] ?? null,
                cg10_visitante: api['cg10-visitante'] ?? null,
                cg10_total: api['cg10-total'] ?? null,

                // --- Total de chutes (API usa "total_de_chutes") ---
                total_chutes_casa: api['total_de_chutes-casa'] ?? null,
                total_chutes_visitante: api['total_de_chutes-visitante'] ?? null,
                total_chutes_total: api['total_de_chutes-total'] ?? null,

                // --- Chutes ao gol ---
                chutes_ao_gol_casa: api['chutes_ao_gol-casa'] ?? null,
                chutes_ao_gol_visitante: api['chutes_ao_gol-visitante'] ?? null,
                chutes_ao_gol_total: api['chutes_ao_gol-total'] ?? null,

                // --- Chutes fora (API usa "chutes_fora_do_gol") ---
                chutes_fora_casa: api['chutes_fora_do_gol-casa'] ?? null,
                chutes_fora_visitante: api['chutes_fora_do_gol-visitante'] ?? null,
                chutes_fora_total: api['chutes_fora_do_gol-total'] ?? null,

                // --- Cantos HT ---
                cantos_ht_casa: api['cantos_ht-casa'] ?? null,
                cantos_ht_visitante: api['cantos_ht-visitante'] ?? null,
                cantos_ht_total: api['cantos_ht-total'] ?? null,

                // --- Cantos totais ---
                cantos_casa: api['cantos-casa'] ?? null,
                cantos_visitante: api['cantos-visitante'] ?? null,
                cantos_total: api['cantos-total'] ?? null,

                // --- Ataques ---
                ataques_casa: api['ataques-casa'] ?? null,
                ataques_visitante: api['ataques-visitante'] ?? null,
                ataques_total: api['ataques-total'] ?? null,

                // --- Ataques perigosos ---
                ataques_perigosos_casa: api['ataques_perigosos-casa'] ?? null,
                ataques_perigosos_visitante: api['ataques_perigosos-visitante'] ?? null,
                ataques_perigosos_total: api['ataques_perigosos-total'] ?? null,

                // --- Posse de bola (API usa "posse_de_bola") ---
                posse_casa: api['posse_de_bola-casa'] ?? null,
                posse_visitante: api['posse_de_bola-visitante'] ?? null,
                posse_total: api['posse_de_bola-total'] ?? null,

                // --- Cartões amarelos ---
                cartoes_amarelos_casa: api['cartoes_amarelos-casa'] ?? null,
                cartoes_amarelos_visitante: api['cartoes_amarelos-visitante'] ?? null,
                cartoes_amarelos_total: api['cartoes_amarelos-total'] ?? null,

                // --- Cartões vermelhos ---
                cartoes_vermelhos_casa: api['cartoes_vermelhos-casa'] ?? null,
                cartoes_vermelhos_visitante: api['cartoes_vermelhos-visitante'] ?? null,
                cartoes_vermelhos_total: api['cartoes_vermelhos-total'] ?? null,

                // --- Último gol (minuto) ---
                ultimo_gol_casa: api['ultimo_gol-casa'] ?? null,
                ultimo_gol_visitante: api['ultimo_gol-visitante'] ?? null,
                ultimo_gol_total: api['ultimo_gol-total'] ?? null,

                // --- Tempo desde último gol (API usa "tempo_desde_o_ultimo_gol") ---
                tempo_desde_ultimo_gol_casa: api['tempo_desde_o_ultimo_gol-casa'] ?? null,
                tempo_desde_ultimo_gol_visitante: api['tempo_desde_o_ultimo_gol-visitante'] ?? null,
                tempo_desde_ultimo_gol_total: api['tempo_desde_o_ultimo_gol-total'] ?? null,

                // --- Odds ao vivo ---
                odds_casa_live: api['odds_casa-live'] ?? null,
                odds_visitante_live: api['odds_visitante-live'] ?? null,
                odds_empate_live: api['odds_empate-live'] ?? null,
                odds_btts_sim_live: api['odds_btts_sim-live'] ?? null,
                odds_over_05_live: api['odds_over_0_5-live'] ?? null,
                odds_over_15_live: api['odds_over_1_5-live'] ?? null,
                // Atenção: a API retorna 'odds_over_2_5_live' com underscore (inconsistência na fonte)
                odds_over_25_live: api['odds_over_2_5_live'] ?? api['odds_over_2_5-live'] ?? null,
                odds_over_35_live: api['odds_over_3_5-live'] ?? null,
                odds_over_05_ht_live: api['odds_over_0_5_ht-live'] ?? null,

                // --- CG gol marcados ---
                cg_gol_marcados_casa: api['cg_gol_marcados-casa'] ?? null,
                cg_gol_marcados_visitante: api['cg_gol_marcados-visitante'] ?? null,
                cg_gol_marcados_total: api['cg_gol_marcados-total'] ?? null,

                // --- Primeiro gol (%) — histórico repetido a cada ciclo pela API ---
                primeiro_gol_casa: api['1_gol-casa'] ?? null,
                primeiro_gol_visitante: api['1_gol-visitante'] ?? null,
                primeiro_gol_total: api['1_gol-total'] ?? null,
            },
        });

        return snapshot;
    }

    // Busca o histórico de snapshots de um jogo ordenado cronologicamente
    async listarPorJogo(jogoId: string) {
        return this.prisma.snapshots.findMany({
            where: { jogo_id: jogoId },
            orderBy: [{ periodo: 'asc' }, { tempo: 'asc' }],
        });
    }

    // Busca o último snapshot registrado para um jogo
    async buscarUltimoSnapshot(jogoId: string) {
        return this.prisma.snapshots.findFirst({
            where: { jogo_id: jogoId },
            orderBy: { capturado_em: 'desc' },
        });
    }
}
