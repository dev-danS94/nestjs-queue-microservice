import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ReservationSchedulingService {
  constructor(
    @InjectQueue('reservation-cancellation') private reservationQueue: Queue,
  ) {}

  /**
   * Agenda la cancelación de una reservación.
   * @param reservationId - El ID de la reservación en MySQL.
   * @param cancelAt - La fecha y hora exactas de cancelación.
   */
  public async scheduleReservationCancellation(
    reservationId: number,
    cancelAt: Date,
  ): Promise<void> {
    const delay = cancelAt.getTime() - new Date().getTime();

    if (delay <= 0) {
      throw new BadRequestException(
        'La fecha de cancelación debe ser posterior a la fecha actual',
      );
    }

    await this.reservationQueue.add(
      'cancel-reservation-job',
      { reservationId },
      {
        delay,
        removeOnComplete: { count: 10 },
        removeOnFail: { count: 10 },
      },
    );

    console.log(
      `Reservación ${reservationId} agendada para cancelarse en ${delay} ms.`,
    );
  }
}
