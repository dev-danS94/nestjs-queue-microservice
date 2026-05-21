import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BonoGalloSchedulingService {
  constructor(
    @InjectQueue('bono-gallo-publishing') private bonoGalloQueue: Queue,
  ) {}

  /**
   * Agenda la publicación de un BonoGallo.
   * @param bonoGalloId - El ID del BonoGallo en MySQL.
   * @param publishAt - La fecha y hora exactas de publicación.
   */
  public async scheduleBonoGalloPublication(
    bonoGalloId: number,
    publishAt: Date,
  ): Promise<void> {
    const delay = publishAt.getTime() - new Date().getTime();

    if (delay <= 0) {
      throw new BadRequestException(
        'La fecha de publicación debe ser posterior a la fecha actual',
      );
    }

    await this.bonoGalloQueue.add(
      'publish-bono-gallo-job',
      { bonoGalloId },
      {
        delay,
        removeOnComplete: { count: 10 },
        removeOnFail: { count: 10 },
      },
    );

    console.log(
      `BonoGallo ${bonoGalloId} agendado para publicarse en ${delay} ms.`,
    );
  }

  /**
   * Agenda la despublicación de un BonoGallo.
   * @param bonoGalloId - El ID del BonoGallo en MySQL.
   * @param unpublishAt - La fecha y hora exactas de despublicación.
   */
  public async scheduleBonoGalloUnpublication(
    bonoGalloId: number,
    unpublishAt: Date,
  ): Promise<void> {
    const delay = unpublishAt.getTime() - new Date().getTime();

    if (delay <= 0) {
      throw new BadRequestException(
        'La fecha de despublicación debe ser posterior a la fecha actual',
      );
    }

    await this.bonoGalloQueue.add(
      'unpublish-bono-gallo-job',
      { bonoGalloId },
      {
        delay,
        removeOnComplete: { count: 10 },
        removeOnFail: { count: 10 },
      },
    );

    console.log(
      `BonoGallo ${bonoGalloId} agendado para despublicarse en ${delay} ms.`,
    );
  }
}
