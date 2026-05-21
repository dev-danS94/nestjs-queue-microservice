import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { BonoGalloSchedulingService } from './bono-gallo-scheduling.service';
import { ScheduleBonoGalloDto } from '../dto/schedule-bono-gallo.dto';
import { UnscheduleBonoGalloDto } from '../dto/unschedule-bono-gallo.dto';

@Controller('bono-gallo')
export class BonoGalloController {
  constructor(
    private readonly bonoGalloSchedulingService: BonoGalloSchedulingService,
  ) {}

  /**
   * Agenda la publicación automática de un BonoGallo.
   * Ruta: POST /bono-gallo/schedule
   */
  @Post('schedule')
  async scheduleBonoGallo(
    @Body(new ValidationPipe()) body: ScheduleBonoGalloDto,
  ) {
    console.log(
      `API: Recibida solicitud para agendar BonoGallo ${body.bono_gallo_id}`,
    );

    await this.bonoGalloSchedulingService.scheduleBonoGalloPublication(
      body.bono_gallo_id,
      new Date(body.fecha_publicacion),
    );

    return {
      success: true,
      message: `BonoGallo ${body.bono_gallo_id} agendado para publicarse el ${body.fecha_publicacion}`,
    };
  }

  /**
   * Agenda la despublicación automática de un BonoGallo.
   * Ruta: POST /bono-gallo/schedule/unpublish
   */
  @Post('schedule/unpublish')
  async unscheduleBonoGallo(
    @Body(new ValidationPipe()) body: UnscheduleBonoGalloDto,
  ) {
    console.log(
      `API: Recibida solicitud para despublicar BonoGallo ${body.bono_gallo_id}`,
    );

    await this.bonoGalloSchedulingService.scheduleBonoGalloUnpublication(
      body.bono_gallo_id,
      new Date(body.fecha_despublicacion),
    );

    return {
      success: true,
      message: `BonoGallo ${body.bono_gallo_id} agendado para despublicarse el ${body.fecha_despublicacion}`,
    };
  }
}
