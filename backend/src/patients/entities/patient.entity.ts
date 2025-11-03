import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PatientProgram } from './patient-program.entity';
import { Session } from '../../sessions/entities/session.entity';
import { Prescription } from '../../medications/entities/prescription.entity';

export enum PatientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column('uuid')
  assignedStaffId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedStaffId' })
  assignedStaff: User;

  @Column({
    type: 'enum',
    enum: PatientStatus,
    default: PatientStatus.ACTIVE,
  })
  status: PatientStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PatientProgram, (patientProgram) => patientProgram.patient)
  patientPrograms: PatientProgram[];

  @OneToMany(() => Session, (session) => session.patient)
  sessions: Session[];

  @OneToMany(() => Prescription, (prescription) => prescription.patient)
  prescriptions: Prescription[];

  get adherenceRate(): number {
    if (!this.sessions || this.sessions.length === 0) return 0;
    const attended = this.sessions.filter((s) => s.status === 'attended').length;
    if (attended === 0) return 0;
    return Math.round((attended / this.sessions.length) * 100);
  }

  get programs(): string[] {
    return this.patientPrograms?.map((pp) => pp.programId) || [];
  }
}

