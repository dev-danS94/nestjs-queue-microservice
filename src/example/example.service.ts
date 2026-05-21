import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { ExampleEntity } from './entities/example.entity';
import { CreateExampleDto } from './dto/create-example.dto';
import { ExampleJob } from './interfaces/example-job.interface';

@Injectable()
export class ExampleService {
  private readonly logger = new Logger(ExampleService.name);

  constructor(
    @InjectQueue('example') private readonly exampleQueue: Queue,
    @InjectRepository(ExampleEntity)
    private readonly exampleRepo: Repository<ExampleEntity>,
  ) {}

  async schedule(dto: CreateExampleDto): Promise<Job<ExampleJob>> {
    const entity = await this.exampleRepo.save(
      this.exampleRepo.create({
        exampleId: dto.exampleId,
        payload: dto.payload,
        scheduledAt: new Date(dto.scheduledAt),
        status: 'pending',
      }),
    );

    const job = await this.exampleQueue.add(
      'process-example',
      {
        exampleId: entity.exampleId,
        payload: entity.payload,
        scheduledAt: dto.scheduledAt,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    );

    this.logger.log(`Job ${job.id} enqueued for example ${entity.exampleId}`);
    return job;
  }

  async findOne(exampleId: string): Promise<ExampleEntity> {
    const entity = await this.exampleRepo.findOne({ where: { exampleId } });
    if (!entity) {
      throw new NotFoundException(`Example ${exampleId} not found`);
    }
    return entity;
  }

  async markStatus(
    exampleId: string,
    status: ExampleEntity['status'],
  ): Promise<void> {
    await this.exampleRepo.update({ exampleId }, { status });
  }
}
