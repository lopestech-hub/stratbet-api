import { Module } from '@nestjs/common';
import { JogosService } from './jogos.service';
import { JogosController } from './jogos.controller';

@Module({
    controllers: [JogosController],
    providers: [JogosService],
    exports: [JogosService], // Exportado para uso no ColetorModule
})
export class JogosModule { }
