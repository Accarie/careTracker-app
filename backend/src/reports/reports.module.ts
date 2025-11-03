import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Patient } from '../patients/entities/patient.entity';
import { Program } from '../programs/entities/program.entity';
import { Session } from '../sessions/entities/session.entity';
import { Prescription } from '../medications/entities/prescription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Program, Session, Prescription])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

