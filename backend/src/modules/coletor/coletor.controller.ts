import { Controller, Get } from '@nestjs/common';
import { ColetorService } from './coletor.service';

// Controller para monitorar o estado do coletor via HTTP
@Controller('coletor')
export class ColetorController {
    constructor(private readonly coletorService: ColetorService) { }

    // GET /coletor/status — retorna o estado atual dos jogos em memória
    @Get('status')
    obterStatus() {
        return {
            status: 'ativo',
            estado_jogos: this.coletorService.obterEstadoAtual(),
        };
    }
}
