import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MedicationFrequency } from '../entities/medication.entity';

export class CreateMedicationDto {
  @ApiProperty({ example: 'Metformin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({ enum: MedicationFrequency, example: MedicationFrequency.DAILY })
  @IsEnum(MedicationFrequency)
  @IsNotEmpty()
  frequency: MedicationFrequency;

  @ApiProperty({ example: 'Oral diabetes medication' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

