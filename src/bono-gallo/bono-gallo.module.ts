import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BonoGalloSchedulingService } from './bono-gallo-scheduling.service';
import { BonoGalloProcessor } from './bono-gallo.processor';
import { BonoGalloController } from './bono-gallo.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bono-gallo-publishing',
    }),
  ],
  controllers: [BonoGalloController],
  providers: [BonoGalloSchedulingService, BonoGalloProcessor],
  exports: [BonoGalloSchedulingService],
})
export class BonoGalloModule {}
