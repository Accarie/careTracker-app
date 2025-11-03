import { IsEmail, IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PatientStatus } from '../entities/patient.entity';

export class CreatePatientDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+1 (555) 123-4567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'uuid-of-staff-member' })
  @IsUUID()
  @IsNotEmpty()
  assignedStaffId: string;

  @ApiProperty({ enum: PatientStatus, required: false })
  @IsEnum(PatientStatus)
  @IsOptional()
  status?: PatientStatus;

  @ApiProperty({ type: [String], required: false, example: ['program-uuid-1', 'program-uuid-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  programIds?: string[];
}

