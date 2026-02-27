/**
 * Script para adicionar restrição UNIQUE à tabela snapshots
 * Execução: npx tsx scripts/add-unique-snapshots.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: { url: process.env.DATABASE_URL },
    },
});

async function addUnique() {
    console.log('🚀 Adicionando restrição UNIQUE à tabela snapshots...');

    try {
        // Adiciona a restrição UNIQUE composta
        await prisma.$executeRawUnsafe(`
      ALTER TABLE snapshots 
      ADD CONSTRAINT snapshots_jogo_id_periodo_tempo_key 
      UNIQUE (jogo_id, periodo, tempo);
    `);

        console.log('✅ Restrição UNIQUE adicionada com sucesso!');
    } catch (erro: any) {
        if (erro.message.includes('already exists')) {
            console.log('ℹ️ A restrição UNIQUE já existe.');
        } else {
            console.error('❌ Erro ao adicionar restrição UNIQUE:', erro);
        }
    } finally {
        await prisma.$disconnect();
    }
}

addUnique();
