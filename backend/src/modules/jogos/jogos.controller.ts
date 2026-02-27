import { Controller, Get, Param } from '@nestjs/common';
import { JogosService } from './jogos.service';

@Controller('jogos')
export class JogosController {
    constructor(private readonly jogosService: JogosService) { }

    // GET /jogos — Lista todos os jogos registrados
    @Get()
    listarJogos() {
        return this.jogosService.listarJogos();
    }

    // GET /jogos/:id — Busca um jogo específico e seus snapshots
    @Get(':id')
    buscarJogo(@Param('id') id: string) {
        return this.jogosService.buscarJogoPorId(id);
    }
}
