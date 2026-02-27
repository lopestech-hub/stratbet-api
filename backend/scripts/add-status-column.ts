import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando migração: Adicionando coluna status à tabela jogos...');

    try {
        // Adiciona a coluna se ela não existir
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "jogos" 
      ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'AO_VIVO';
    `);

        console.log('✅ Coluna "status" adicionada com sucesso!');

        // Atualiza jogos existentes (caso haja algum sem status)
        const result = await prisma.$executeRawUnsafe(`
      UPDATE "jogos" SET "status" = 'AO_VIVO' WHERE "status" IS NULL;
    `);

        console.log(`✅ ${result} registros antigos atualizados para 'AO_VIVO'.`);

    } catch (error) {
        console.error('❌ Erro na migração:', error);
    } finally {
        await prisma.$disconnect();
        console.log('👋 Prisma desconectado.');
    }
}

main();
