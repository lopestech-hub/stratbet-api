import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
        { bufferLogs: true }, // Aguarda o Pino inicializar antes de logar
    );

    // Usa o Pino como logger padrão do NestJS
    app.useLogger(app.get(Logger));

    // Habilita CORS para o frontend
    app.enableCors({
        origin: process.env.FRONTEND_URL ?? '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    });

    // Prefixo global da API
    app.setGlobalPrefix('api');

    const porta = process.env.PORT ?? 3000;
    await app.listen(porta, '0.0.0.0');

    app.get(Logger).log(`🚀 StratBet API rodando na porta ${porta}`);
    app.get(Logger).log(`📡 Coletor de dados ao vivo: ativo (intervalo: ${process.env.INTERVALO_COLETA_MS ?? 30000}ms)`);
}

bootstrap();
