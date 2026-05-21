import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class UnscheduleEventDto {
  @IsNumber()
  @IsNotEmpty()
  evento_id: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_despublicacion: string;
}
