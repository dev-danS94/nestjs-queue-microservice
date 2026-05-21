import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReservationSchedulingService } from './reservation-scheduling.service';
import { ReservationProcessor } from './reservation.processor';
import { ReservationsController } from './reservations.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reservation-cancellation',
    }),
  ],
  controllers: [ReservationsController],
  providers: [ReservationSchedulingService, ReservationProcessor],
  exports: [ReservationSchedulingService],
})
export class ReservationsModule {}
