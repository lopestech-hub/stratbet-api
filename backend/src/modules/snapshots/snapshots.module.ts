import { Module } from '@nestjs/common';
import { SnapshotsService } from './snapshots.service';
import { SnapshotsController } from './snapshots.controller';

@Module({
    controllers: [SnapshotsController],
    providers: [SnapshotsService],
    exports: [SnapshotsService], // Exportado para uso no ColetorModule
})
export class SnapshotsModule { }
