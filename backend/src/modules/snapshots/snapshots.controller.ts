import { Controller, Get, Param } from '@nestjs/common';
import { SnapshotsService } from './snapshots.service';

@Controller('snapshots')
export class SnapshotsController {
    constructor(private readonly snapshotsService: SnapshotsService) { }

    // GET /snapshots/jogo/:jogoId — Lista todos os snapshots de um jogo
    @Get('jogo/:jogoId')
    listarPorJogo(@Param('jogoId') jogoId: string) {
        return this.snapshotsService.listarPorJogo(jogoId);
    }

    // GET /snapshots/jogo/:jogoId/ultimo — Último snapshot de um jogo
    @Get('jogo/:jogoId/ultimo')
    buscarUltimo(@Param('jogoId') jogoId: string) {
        return this.snapshotsService.buscarUltimoSnapshot(jogoId);
    }
}
