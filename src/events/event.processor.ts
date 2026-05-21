import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Processor('event-publishing')
export class EventProcessor extends WorkerHost {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async process(job: Job<{ eventId: number }>): Promise<any> {
    switch (job.name) {
      case 'publish-event-job':
        return this.handlePublish(job);
      case 'unpublish-event-job':
        return this.handleUnpublish(job);
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

  private async handlePublish(job: Job<{ eventId: number }>): Promise<any> {
    const { eventId } = job.data;
    console.log(`WORKER: ¡Es hora de publicar el evento ${eventId}!`);
    await this.callWebhook('events/publish', { eventId });
    console.log(`Webhook de publicación enviado para evento ${eventId}.`);
    return { status: 'completado', eventId };
  }

  private async handleUnpublish(job: Job<{ eventId: number }>): Promise<any> {
    const { eventId } = job.data;
    console.log(`WORKER: ¡Es hora de despublicar el evento ${eventId}!`);
    await this.callWebhook('events/unpublish', { eventId });
    console.log(`Webhook de despublicación enviado para evento ${eventId}.`);
    return { status: 'completado', eventId };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<{ eventId: number }>) {
    console.log(`WORKER: Job ${job.id} (Evento ${job.data.eventId}) completado.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<{ eventId: number }>, err: Error) {
    console.error(`WORKER: Job ${job.id} (Evento ${job.data.eventId}) falló: ${err.message}`);
  }
}
