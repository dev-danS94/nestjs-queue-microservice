import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Processor('reservation-cancellation')
export class ReservationProcessor extends WorkerHost {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async process(job: Job<{ reservationId: number }>): Promise<any> {
    switch (job.name) {
      case 'cancel-reservation-job':
        return this.handleCancel(job);
      default:
        throw new Error(`Tipo de job desconocido: ${job.name}`);
    }
  }

  private async callWebhook(path: string, body: object): Promise<void> {
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const url = `${backendUrl}/api/queue-service/${path}`;
    console.log(`WORKER: Llamando webhook → PATCH ${url}`, body);
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`Webhook failed [${res.status}]: ${url}`);
      }
    } catch (error) {
      console.error(`WORKER: Error al llamar webhook ${url}:`, error.message);
      throw error;
    }
  }

  private async handleCancel(job: Job<{ reservationId: number }>): Promise<any> {
    const { reservationId } = job.data;
    console.log(`WORKER: ¡Es hora de cancelar la reservación ${reservationId}!`);
    await this.callWebhook('reservations/cancel', { reservationId });
    console.log(`Webhook de cancelación enviado para reservación ${reservationId}.`);
    return { status: 'completado', reservationId };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<{ reservationId: number }>) {
    console.log(`WORKER: Job ${job.id} (Reservación ${job.data.reservationId}) completado.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<{ reservationId: number }>, err: Error) {
    console.error(`WORKER: Job ${job.id} (Reservación ${job.data.reservationId}) falló: ${err.message}`);
  }
}
