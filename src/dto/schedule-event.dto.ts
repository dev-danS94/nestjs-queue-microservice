// en src/dto/schedule-event.dto.ts
import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class ScheduleEventDto {
  @IsNumber()
  @IsNotEmpty()
  evento_id: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_publicacion: string;
}