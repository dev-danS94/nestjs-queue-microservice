import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';

@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  schedule(@Body() dto: CreateExampleDto) {
    return this.exampleService.schedule(dto);
  }

  @Get(':exampleId')
  findOne(@Param('exampleId') exampleId: string) {
    return this.exampleService.findOne(exampleId);
  }
}
