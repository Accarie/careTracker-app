import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Program } from '../../programs/entities/program.entity';
import { Patient } from '../../patients/entities/patient.entity';

export enum SessionStatus {
  ATTENDED = 'attended',
  MISSED = 'missed',
  CANCELED = 'canceled',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  programId: string;

  @Column('uuid')
  patientId: string;

  @ManyToOne(() => Program, (program) => program.sessions)
  @JoinColumn({ name: 'programId' })
  program: Program;

  @ManyToOne(() => Patient, (patient) => patient.sessions)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column('date')
  date: Date;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.MISSED,
  })
  status: SessionStatus;

  @Column({ nullable: true })
  cancelReason: string;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

