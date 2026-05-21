import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, UnrecoverableError } from 'bullmq';
import { ExampleService } from './example.service';
import { ExampleJob } from './interfaces/example-job.interface';

@Processor('example')
export class ExampleProcessor extends WorkerHost {
  private readonly logger = new Logger(ExampleProcessor.name);

  constructor(private readonly exampleService: ExampleService) {
    super();
  }

  async process(job: Job<ExampleJob>): Promise<void> {
    const start = Date.now();
    this.logger.log(
      `Processing job ${job.id} [${job.name}] attempt ${job.attemptsMade + 1}`,
    );

    try {
      switch (job.name) {
        case 'process-example':
          await this.handleProcess(job);
          break;
        default:
          throw new UnrecoverableError(`Unknown job type: ${job.name}`);
      }

      this.logger.log(`Job ${job.id} completed in ${Date.now() - start}ms`);
    } catch (error) {
      this.logger.error(
        `Job ${job.id} failed on attempt ${job.attemptsMade}: ${error.message}`,
        error.stack,
      );
      await this.exampleService.markStatus(job.data.exampleId, 'failed');
      throw error;
    }
  }

  private async handleProcess(job: Job<ExampleJob>): Promise<void> {
    const { exampleId } = job.data;

    await this.exampleService.markStatus(exampleId, 'processing');

    // Lógica de negocio aquí: llamadas HTTP, cálculos, side effects, etc.
    // Mantener idempotente: el mismo job puede ejecutarse más de una vez.

    await this.exampleService.markStatus(exampleId, 'completed');
  }
}
