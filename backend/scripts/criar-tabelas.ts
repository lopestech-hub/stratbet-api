/**
 * Script de migração — Criação das tabelas jogos e snapshots
 * Projeto: stratbet-pi
 * Banco: PostgreSQL na VPS (Coolify)
 * 
 * Execução: npx tsx scripts/criar-tabelas.ts
 * 
 * REGRA: Nunca usar prisma migrate em produção.
 * Sempre usar scripts com $executeRawUnsafe para DDL.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: { url: process.env.DATABASE_URL },
    },
});

async function criarTabelas() {
    console.log('🚀 Iniciando criação das tabelas...');
    console.log(`📡 Banco: ${process.env.DATABASE_URL?.split('@')[1]}`);

    try {
        // =========================================================
        // TABELA: jogos
        // Dados estáticos e pré-live — inserida UMA VEZ por jogo
        // =========================================================
        console.log('\n📋 Criando tabela: jogos...');

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS jogos (
        id                              TEXT        NOT NULL PRIMARY KEY,
        liga                            TEXT        NOT NULL,
        time_casa                       TEXT        NOT NULL,
        time_visitante                  TEXT        NOT NULL,

        -- Links de apostas
        link_betfair                    TEXT,
        link_superbet                   TEXT,
        link_bet365                     TEXT,

        -- Placar HT
        placar_ht_casa                  INTEGER,
        placar_ht_visitante             INTEGER,
        placar_ht_total                 INTEGER,

        -- H2H
        h2h_casa                        DECIMAL(5,2),
        h2h_visitante                   DECIMAL(5,2),
        h2h_total                       DECIMAL(5,2),

        -- Classificação na liga
        classificacao_casa              INTEGER,
        classificacao_visitante         INTEGER,
        classificacao_total             INTEGER,

        -- Pontos por jogo
        ppj_casa                        DECIMAL(4,2),
        ppj_visitante                   DECIMAL(4,2),
        ppj_total                       DECIMAL(4,2),

        -- Vitórias (%)
        vitoria_casa                    DECIMAL(5,2),
        vitoria_visitante               DECIMAL(5,2),
        vitoria_total                   DECIMAL(5,2),

        -- Derrotas (%)
        derrota_casa                    DECIMAL(5,2),
        derrota_visitante               DECIMAL(5,2),
        derrota_total                   DECIMAL(5,2),

        -- Média de gols marcados
        media_gols_marcados_casa        DECIMAL(4,2),
        media_gols_marcados_visitante   DECIMAL(4,2),
        media_gols_marcados_total       DECIMAL(4,2),

        -- Média de gols marcados HT
        media_gols_marcados_ht_casa     DECIMAL(4,2),
        media_gols_marcados_ht_visitante DECIMAL(4,2),
        media_gols_marcados_ht_total    DECIMAL(4,2),

        -- Média de gols sofridos
        media_gols_sofridos_casa        DECIMAL(4,2),
        media_gols_sofridos_visitante   DECIMAL(4,2),
        media_gols_sofridos_total       DECIMAL(4,2),

        -- Média de gols sofridos HT
        medias_gols_sofridos_ht_casa     DECIMAL(4,2),
        medias_gols_sofridos_ht_visitante DECIMAL(4,2),
        medias_gols_sofridos_ht_total   DECIMAL(4,2),

        -- xG pré-jogo
        xg_pre_casa                     DECIMAL(4,2),
        xg_pre_visitante                DECIMAL(4,2),
        xg_pre_total                    DECIMAL(4,2),

        -- xGA pré-jogo
        xga_pre_casa                    DECIMAL(4,2),
        xga_pre_visitante               DECIMAL(4,2),
        xga_pre_total                   DECIMAL(4,2),

        -- Clean Sheet (%)
        clean_sheet_casa                DECIMAL(5,2),
        clean_sheet_visitante           DECIMAL(5,2),
        clean_sheet_total               DECIMAL(5,2),

        -- BTTS (%)
        btts_casa                       DECIMAL(5,2),
        btts_visitante                  DECIMAL(5,2),
        btts_total                      DECIMAL(5,2),

        -- Over 0.5 HT (%)
        over_05_ht_casa                 DECIMAL(5,2),
        over_05_ht_visitante            DECIMAL(5,2),
        over_05_ht_total                DECIMAL(5,2),

        -- Over 1.5 (%)
        over_15_casa                    DECIMAL(5,2),
        over_15_visitante               DECIMAL(5,2),
        over_15_total                   DECIMAL(5,2),

        -- Over 2.5 (%)
        over_25_casa                    DECIMAL(5,2),
        over_25_visitante               DECIMAL(5,2),
        over_25_total                   DECIMAL(5,2),

        -- Over 0.5 marcados (%)
        over_05_marcados_casa           DECIMAL(5,2),
        over_05_marcados_visitante      DECIMAL(5,2),
        over_05_marcados_total          DECIMAL(5,2),

        -- Over 0.5 sofridos (%)
        over_05_sofridos_casa           DECIMAL(5,2),
        over_05_sofridos_visitante      DECIMAL(5,2),
        over_05_sofridos_total          DECIMAL(5,2),

        -- Médias de gols gerais
        media_gols_casa                 DECIMAL(4,2),
        media_gols_visitante            DECIMAL(4,2),
        media_gols_total                DECIMAL(4,2),

        -- Médias de gols HT
        media_gols_ht_casa              DECIMAL(4,2),
        media_gols_ht_visitante         DECIMAL(4,2),
        media_gols_ht_total             DECIMAL(4,2),

        -- Gol após 75' (%)
        gol_75_casa                     DECIMAL(5,2),
        gol_75_visitante                DECIMAL(5,2),
        gol_75_total                    DECIMAL(5,2),

        -- Odds pré-jogo
        odds_casa_pre                   DECIMAL(6,2),
        odds_visitante_pre              DECIMAL(6,2),
        odds_empate_pre                 DECIMAL(6,2),
        odds_btts_sim_pre               DECIMAL(6,2),
        odds_over_05_pre                DECIMAL(6,2),
        odds_over_15_pre                DECIMAL(6,2),
        odds_over_25_pre                DECIMAL(6,2),
        odds_over_35_pre                DECIMAL(6,2),
        odds_over_05_ht_pre             DECIMAL(6,2),

        -- Metadados
        criado_em                       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

        console.log('✅ Tabela jogos criada com sucesso!');

        // =========================================================
        // TABELA: snapshots
        // Dados ao vivo — um registro por minuto por jogo
        // =========================================================
        console.log('\n📋 Criando tabela: snapshots...');

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS snapshots (
        id                              TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        jogo_id                         TEXT        NOT NULL REFERENCES jogos(id),
        periodo                         INTEGER     NOT NULL,
        tempo                           INTEGER     NOT NULL,

        -- Placar ao vivo
        placar_casa                     INTEGER     NOT NULL DEFAULT 0,
        placar_visitante                INTEGER     NOT NULL DEFAULT 0,
        placar_total                    INTEGER     NOT NULL DEFAULT 0,

        -- xG ao vivo
        xg_casa                         DECIMAL(4,2),
        xg_visitante                    DECIMAL(4,2),
        xg_total                        DECIMAL(4,2),

        -- PI1
        pi1_casa                        DECIMAL(6,2),
        pi1_visitante                   DECIMAL(6,2),
        pi1_total                       DECIMAL(6,2),

        -- PI2
        pi2_casa                        DECIMAL(6,2),
        pi2_visitante                   DECIMAL(6,2),
        pi2_total                       DECIMAL(6,2),

        -- PI3
        pi3_casa                        DECIMAL(6,2),
        pi3_visitante                   DECIMAL(6,2),
        pi3_total                       DECIMAL(6,2),

        -- APPM (acumulado)
        appm_casa                       DECIMAL(5,2),
        appm_visitante                  DECIMAL(5,2),
        appm_total                      DECIMAL(5,2),

        -- APPM10 (últimos 10 min)
        appm10_casa                     DECIMAL(5,2),
        appm10_visitante                DECIMAL(5,2),
        appm10_total                    DECIMAL(5,2),

        -- CG (chutes a gol - acumulado)
        cg_casa                         INTEGER,
        cg_visitante                    INTEGER,
        cg_total                        INTEGER,

        -- CG10 (últimos 10 min)
        cg10_casa                       INTEGER,
        cg10_visitante                  INTEGER,
        cg10_total                      INTEGER,

        -- Total de chutes
        total_chutes_casa               INTEGER,
        total_chutes_visitante          INTEGER,
        total_chutes_total              INTEGER,

        -- Chutes ao gol
        chutes_ao_gol_casa              INTEGER,
        chutes_ao_gol_visitante         INTEGER,
        chutes_ao_gol_total             INTEGER,

        -- Chutes fora
        chutes_fora_casa                INTEGER,
        chutes_fora_visitante           INTEGER,
        chutes_fora_total               INTEGER,

        -- Cantos HT
        cantos_ht_casa                  INTEGER,
        cantos_ht_visitante             INTEGER,
        cantos_ht_total                 INTEGER,

        -- Cantos totais
        cantos_casa                     INTEGER,
        cantos_visitante                INTEGER,
        cantos_total                    INTEGER,

        -- Ataques
        ataques_casa                    INTEGER,
        ataques_visitante               INTEGER,
        ataques_total                   INTEGER,

        -- Ataques perigosos
        ataques_perigosos_casa          INTEGER,
        ataques_perigosos_visitante     INTEGER,
        ataques_perigosos_total         INTEGER,

        -- Posse de bola (%)
        posse_casa                      DECIMAL(5,2),
        posse_visitante                 DECIMAL(5,2),
        posse_total                     DECIMAL(5,2),

        -- Cartões amarelos
        cartoes_amarelos_casa           INTEGER,
        cartoes_amarelos_visitante      INTEGER,
        cartoes_amarelos_total          INTEGER,

        -- Cartões vermelhos
        cartoes_vermelhos_casa          INTEGER,
        cartoes_vermelhos_visitante     INTEGER,
        cartoes_vermelhos_total         INTEGER,

        -- Último gol (minuto)
        ultimo_gol_casa                 INTEGER,
        ultimo_gol_visitante            INTEGER,
        ultimo_gol_total                INTEGER,

        -- Tempo desde último gol
        tempo_desde_ultimo_gol_casa     INTEGER,
        tempo_desde_ultimo_gol_visitante INTEGER,
        tempo_desde_ultimo_gol_total    INTEGER,

        -- Odds ao vivo
        odds_casa_live                  DECIMAL(6,2),
        odds_visitante_live             DECIMAL(6,2),
        odds_empate_live                DECIMAL(6,2),
        odds_btts_sim_live              DECIMAL(6,2),
        odds_over_05_live               DECIMAL(6,2),
        odds_over_15_live               DECIMAL(6,2),
        odds_over_25_live               DECIMAL(6,2),
        odds_over_35_live               DECIMAL(6,2),
        odds_over_05_ht_live            DECIMAL(6,2),

        -- CG gol marcados
        cg_gol_marcados_casa            INTEGER,
        cg_gol_marcados_visitante       INTEGER,
        cg_gol_marcados_total           INTEGER,

        -- Primeiro gol (% histórico)
        primeiro_gol_casa               DECIMAL(5,2),
        primeiro_gol_visitante          DECIMAL(5,2),
        primeiro_gol_total              DECIMAL(5,2),

        -- Metadados
        capturado_em                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

        console.log('✅ Tabela snapshots criada com sucesso!');

        // =========================================================
        // ÍNDICES para performance
        // =========================================================
        console.log('\n📋 Criando índices de performance...');

        await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_snapshots_jogo_id
        ON snapshots (jogo_id);
    `);

        await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_snapshots_jogo_periodo_tempo
        ON snapshots (jogo_id, periodo, tempo);
    `);

        await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_snapshots_capturado_em
        ON snapshots (capturado_em);
    `);

        console.log('✅ Índices criados com sucesso!');

        // =========================================================
        // VERIFICAÇÃO FINAL
        // =========================================================
        console.log('\n🔍 Verificando tabelas criadas...');

        const tabelas = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('jogos', 'snapshots')
      ORDER BY tablename;
    `;

        console.log('📊 Tabelas no banco:');
        tabelas.forEach((t) => console.log(`   ✅ ${t.tablename}`));

        if (tabelas.length === 2) {
            console.log('\n🎉 Migração concluída com sucesso!');
            console.log('   Tabelas: jogos, snapshots');
            console.log('   Índices: idx_snapshots_jogo_id, idx_snapshots_jogo_periodo_tempo, idx_snapshots_capturado_em');
        } else {
            console.error('\n❌ Atenção: nem todas as tabelas foram criadas!');
            process.exit(1);
        }

    } catch (erro) {
        console.error('\n❌ Erro durante a migração:', erro);
        process.exit(1);
    } finally {
        // Sempre desconectar o Prisma ao final
        await prisma.$disconnect();
        console.log('\n🔌 Prisma desconectado.');
    }
}

criarTabelas();
