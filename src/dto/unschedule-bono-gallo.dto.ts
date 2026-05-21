import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class UnscheduleBonoGalloDto {
  @IsNumber()
  @IsNotEmpty()
  bono_gallo_id: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_despublicacion: string;
}
