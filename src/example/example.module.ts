import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { ExampleProcessor } from './example.processor';
import { ExampleEntity } from './entities/example.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExampleEntity]),
    BullModule.registerQueue({ name: 'example' }),
  ],
  controllers: [ExampleController],
  providers: [ExampleService, ExampleProcessor],
  exports: [ExampleService],
})
export class ExampleModule {}
