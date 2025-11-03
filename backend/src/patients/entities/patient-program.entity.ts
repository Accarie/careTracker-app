import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Program } from '../../programs/entities/program.entity';

@Entity('patient_programs')
@Unique(['patientId', 'programId'])
export class PatientProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  patientId: string;

  @Column('uuid')
  programId: string;

  @ManyToOne(() => Patient, (patient) => patient.patientPrograms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Program, (program) => program.patientPrograms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'programId' })
  program: Program;

  @CreateDateColumn()
  enrolledAt: Date;
}

