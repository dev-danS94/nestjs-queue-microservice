import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventSchedulingService } from './event-scheduling.service';
import { EventProcessor } from './event.processor';
import { EventsController } from './events.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'event-publishing',
    }),
  ],
  controllers: [EventsController],
  providers: [EventSchedulingService, EventProcessor],
  exports: [EventSchedulingService],
})
export class EventsModule {}
