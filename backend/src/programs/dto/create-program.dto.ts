import { IsString, IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProgramFrequency } from '../entities/program.entity';

export class CreateProgramDto {
  @ApiProperty({ example: 'Diabetes Management' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Comprehensive diabetes care program' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ProgramFrequency, example: ProgramFrequency.WEEKLY })
  @IsEnum(ProgramFrequency)
  @IsNotEmpty()
  frequency: ProgramFrequency;

  @ApiProperty({ example: 12 })
  @IsNumber()
  @Min(1)
  sessionsCount: number;
}

