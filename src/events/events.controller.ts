// en src/events.controller.ts
import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { EventSchedulingService } from './event-scheduling.service';
import { ScheduleEventDto } from '../dto/schedule-event.dto';
import { UnscheduleEventDto } from '../dto/unschedule-event.dto';

@Controller('events') // <-- Esto define la ruta base: /events
export class EventsController {
  // Inyecta el "Productor" de colas
  constructor(
    private readonly eventSchedulingService: EventSchedulingService,
  ) {}

  /**
   * Este es el endpoint que tu backend de Express llamará.
   * Ruta: POST /events/schedule
   */
  @Post('schedule')
  async scheduleEvent(
    // NestJS valida automáticamente el body
    // usando el DTO (Paso 2)
    @Body(new ValidationPipe()) body: ScheduleEventDto,
  ) {
    console.log(
      `API: Recibida solicitud para agendar evento ${body.evento_id}`,
    );

    // Llama al servicio "Productor" para meter el trabajo a Redis
    await this.eventSchedulingService.scheduleEventPublication(
      body.evento_id,
      new Date(body.fecha_publicacion), // Convierte el string de fecha a un objeto Date
    );

    return {
      success: true,
      message: `Evento ${body.evento_id} agendado para ${body.fecha_publicacion}`,
    };
  }

  /**
   * Agenda la despublicación de un evento.
   * Ruta: POST /events/schedule/unpublish
   */
  @Post('schedule/unpublish')
  async scheduleEventUnpublication(
    @Body(new ValidationPipe()) body: UnscheduleEventDto,
  ) {
    console.log(
      `API: Recibida solicitud para despublicar evento ${body.evento_id}`,
    );

    await this.eventSchedulingService.scheduleEventUnpublication(
      body.evento_id,
      new Date(body.fecha_despublicacion),
    );

    return {
      success: true,
      message: `Evento ${body.evento_id} agendado para despublicarse el ${body.fecha_despublicacion}`,
    };
  }
}
