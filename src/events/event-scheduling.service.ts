// en src/event-scheduling.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EventSchedulingService {
  constructor(
    @InjectQueue('event-publishing') private eventQueue: Queue,
  ) {}

  /**
   * Agenda la publicación de un evento.
   * @param eventId - El ID del evento en MySQL.
   * @param publishAt - La fecha y hora exactas de publicación.
   */
  public async scheduleEventPublication(eventId: number, publishAt: Date) {
    const delay = publishAt.getTime() - new Date().getTime();

    if (delay <= 0) {
      throw new BadRequestException(
        `La fecha de publicación debe ser posterior a la fecha actual`,
      );
    }

    await this.eventQueue.add(
      'publish-event-job',
      { eventId },
      {
        delay,
        removeOnComplete: { count: 10 },
        removeOnFail: { count: 10 },
      },
    );

    console.log(`Evento ${eventId} agendado para publicarse en ${delay} ms.`);
  }

  /**
   * Agenda la despublicación de un evento.
   * @param eventId - El ID del evento en MySQL.
   * @param unpublishAt - La fecha y hora exactas de despublicación.
   */
  public async scheduleEventUnpublication(eventId: number, unpublishAt: Date) {
    const delay = unpublishAt.getTime() - new Date().getTime();

    if (delay <= 0) {
      throw new BadRequestException(
        `La fecha de despublicación debe ser posterior a la fecha actual`,
      );
    }

    await this.eventQueue.add(
      'unpublish-event-job',
      { eventId },
      {
        delay,
        removeOnComplete: { count: 10 },
        removeOnFail: { count: 10 },
      },
    );

    console.log(`Evento ${eventId} agendado para despublicarse en ${delay} ms.`);
  }
}
