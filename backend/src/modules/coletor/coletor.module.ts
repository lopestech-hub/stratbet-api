import { Module } from '@nestjs/common';
import { ColetorService } from './coletor.service';
import { ColetorController } from './coletor.controller';
import { JogosModule } from '../jogos/jogos.module';
import { SnapshotsModule } from '../snapshots/snapshots.module';

@Module({
    imports: [JogosModule, SnapshotsModule],
    controllers: [ColetorController],
    providers: [ColetorService],
})
export class ColetorModule { }
