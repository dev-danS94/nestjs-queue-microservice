import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ReservationSchedulingService } from './reservation-scheduling.service';
import { ScheduleReservationCancelDto } from '../dto/schedule-reservation-cancel.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationSchedulingService: ReservationSchedulingService,
  ) {}

  /**
   * Agenda la cancelación automática de una reservación.
   * Ruta: POST /reservations/schedule/cancel
   */
  @Post('schedule/cancel')
  async scheduleReservationCancel(
    @Body(new ValidationPipe()) body: ScheduleReservationCancelDto,
  ) {
    console.log(
      `API: Recibida solicitud para cancelar reservación ${body.reservation_id}`,
    );

    await this.reservationSchedulingService.scheduleReservationCancellation(
      body.reservation_id,
      new Date(body.fecha_cancelacion),
    );

    return {
      success: true,
      message: `Reservación ${body.reservation_id} agendada para cancelarse el ${body.fecha_cancelacion}`,
    };
  }
}
