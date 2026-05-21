import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class ScheduleBonoGalloDto {
  @IsNumber()
  @IsNotEmpty()
  bono_gallo_id: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_publicacion: string;
}
