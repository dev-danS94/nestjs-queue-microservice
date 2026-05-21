import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Processor('bono-gallo-publishing')
export class BonoGalloProcessor extends WorkerHost {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async process(job: Job<{ bonoGalloId: number }>): Promise<any> {
    switch (job.name) {
      case 'publish-bono-gallo-job':
        return this.handlePublish(job);
      case 'unpublish-bono-gallo-job':
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

  private async handlePublish(job: Job<{ bonoGalloId: number }>): Promise<any> {
    const { bonoGalloId } = job.data;
    console.log(`WORKER: ¡Es hora de publicar el BonoGallo ${bonoGalloId}!`);
    await this.callWebhook('bono-gallo/publish', { bonoGalloId });
    console.log(`Webhook de publicación enviado para BonoGallo ${bonoGalloId}.`);
    return { status: 'completado', bonoGalloId };
  }

  private async handleUnpublish(job: Job<{ bonoGalloId: number }>): Promise<any> {
    const { bonoGalloId } = job.data;
    console.log(`WORKER: ¡Es hora de despublicar el BonoGallo ${bonoGalloId}!`);
    await this.callWebhook('bono-gallo/unpublish', { bonoGalloId });
    console.log(`Webhook de despublicación enviado para BonoGallo ${bonoGalloId}.`);
    return { status: 'completado', bonoGalloId };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<{ bonoGalloId: number }>) {
    console.log(`WORKER: Job ${job.id} (BonoGallo ${job.data.bonoGalloId}) completado.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<{ bonoGalloId: number }>, err: Error) {
    console.error(`WORKER: Job ${job.id} (BonoGallo ${job.data.bonoGalloId}) falló: ${err.message}`);
  }
}
