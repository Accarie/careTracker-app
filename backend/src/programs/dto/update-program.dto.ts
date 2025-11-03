import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProgramFrequency } from '../entities/program.entity';

export class UpdateProgramDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ProgramFrequency, required: false })
  @IsEnum(ProgramFrequency)
  @IsOptional()
  frequency?: ProgramFrequency;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  sessionsCount?: number;
}

