import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgramsModule } from './programs/programs.module';
import { PatientsModule } from './patients/patients.module';
import { SessionsModule } from './sessions/sessions.module';
import { MedicationsModule } from './medications/medications.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/entities/user.entity';
import { Program } from './programs/entities/program.entity';
import { Patient } from './patients/entities/patient.entity';
import { Session } from './sessions/entities/session.entity';
import { Medication } from './medications/entities/medication.entity';
import { Prescription } from './medications/entities/prescription.entity';
import { ProgramMedication } from './programs/entities/program-medication.entity';
import { PatientProgram } from './patients/entities/patient-program.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'health_db',
      entities: [
        User,
        Program,
        Patient,
        Session,
        Medication,
        Prescription,
        ProgramMedication,
        PatientProgram,
      ],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync schema in dev
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    ProgramsModule,
    PatientsModule,
    SessionsModule,
    MedicationsModule,
    ReportsModule,
  ],
})
export class AppModule {}

