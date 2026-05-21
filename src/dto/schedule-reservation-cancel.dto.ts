import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class ScheduleReservationCancelDto {
  @IsNumber()
  @IsNotEmpty()
  reservation_id: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_cancelacion: string;
}
