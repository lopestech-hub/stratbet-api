import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global para disponibilizar o PrismaService em todos os módulos sem reimportar
@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }
