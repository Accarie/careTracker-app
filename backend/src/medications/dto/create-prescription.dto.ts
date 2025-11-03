import { IsUUID, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'medication-uuid' })
  @IsUUID()
  @IsNotEmpty()
  medicationId: string;

  @ApiProperty({ example: 'patient-uuid' })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ example: '2024-10-15' })
  @IsDateString()
  @IsNotEmpty()
  dateCollected: string;

  @ApiProperty({ example: '2024-11-15' })
  @IsDateString()
  @IsNotEmpty()
  nextDueDate: string;
}

