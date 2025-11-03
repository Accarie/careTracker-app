import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PatientProgram } from '../../patients/entities/patient-program.entity';
import { ProgramMedication } from './program-medication.entity';
import { Session } from '../../sessions/entities/session.entity';

export enum ProgramFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ProgramFrequency,
    default: ProgramFrequency.WEEKLY,
  })
  frequency: ProgramFrequency;

  @Column({ default: 0 })
  sessionsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PatientProgram, (patientProgram) => patientProgram.program)
  patientPrograms: PatientProgram[];

  @OneToMany(() => ProgramMedication, (programMed) => programMed.program)
  programMedications: ProgramMedication[];

  @OneToMany(() => Session, (session) => session.program)
  sessions: Session[];

  get enrolledPatients(): number {
    return this.patientPrograms?.length || 0;
  }
}

