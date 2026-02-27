import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';

import { PrismaModule } from './prisma/prisma.module';
import { ColetorModule } from './modules/coletor/coletor.module';
import { JogosModule } from './modules/jogos/jogos.module';
import { SnapshotsModule } from './modules/snapshots/snapshots.module';

@Module({
    imports: [
        // Configuração de variáveis de ambiente (.env) globalmente
        ConfigModule.forRoot({ isGlobal: true }),

        // Agendamento de tarefas (Cron Jobs)
        ScheduleModule.forRoot(),

        // Logger Pino configurado globalmente
        LoggerModule.forRoot({
            pinoHttp: {
                level: process.env.LOG_LEVEL ?? 'info',
                transport:
                    process.env.NODE_ENV !== 'production'
                        ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
                        : undefined,
                // Nunca logar senhas ou tokens em logs HTTP
                redact: ['req.headers.authorization', 'req.body.senha', 'req.body.token'],
            },
        }),

        // Módulo global do Prisma
        PrismaModule,

        // Módulos de funcionalidade
        ColetorModule,
        JogosModule,
        SnapshotsModule,
    ],
})
export class AppModule { }
