import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  exampleId: string;

  @IsString()
  @IsNotEmpty()
  payload: string;

  @IsDateString()
  scheduledAt: string;
}
