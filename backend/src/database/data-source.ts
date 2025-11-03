import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Program } from '../programs/entities/program.entity';
import { Patient } from '../patients/entities/patient.entity';
import { PatientProgram } from '../patients/entities/patient-program.entity';
import { Session } from '../sessions/entities/session.entity';
import { Medication } from '../medications/entities/medication.entity';
import { Prescription } from '../medications/entities/prescription.entity';
import { ProgramMedication } from '../programs/entities/program-medication.entity';

export const AppDataSource = new DataSource({
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
    PatientProgram,
    Session,
    Medication,
    Prescription,
    ProgramMedication,
  ],
  synchronize: false, // Keep false, we'll sync manually in seed script
  logging: process.env.NODE_ENV === 'development',
});

