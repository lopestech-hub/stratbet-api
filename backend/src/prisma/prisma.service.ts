import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// Serviço singleton do Prisma para toda a aplicação
@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor(
        @InjectPinoLogger(PrismaService.name)
        private readonly logger: PinoLogger,
    ) {
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'warn' },
            ],
        });
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.info('Prisma conectado ao banco de dados');

        // Loga queries lentas (acima de 500ms)
        (this.$on as any)('query', (e: any) => {
            if (e.duration > 500) {
                this.logger.warn(
                    { query: e.query, duration: e.duration },
                    `Query lenta detectada: ${e.duration}ms`,
                );
            }
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.info('Prisma desconectado do banco de dados');
    }
}
