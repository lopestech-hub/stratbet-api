import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando migração: Adicionando placar final à tabela jogos...');

    try {
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "jogos" 
      ADD COLUMN IF NOT EXISTS "placar_final_casa" INTEGER,
      ADD COLUMN IF NOT EXISTS "placar_final_visitante" INTEGER;
    `);

        console.log('✅ Colunas de placar final adicionadas com sucesso!');

    } catch (error) {
        console.error('❌ Erro na migração:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
