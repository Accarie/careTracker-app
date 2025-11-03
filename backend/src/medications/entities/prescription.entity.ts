import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';
import { Medication } from './medication.entity';
import { Patient } from '../../patients/entities/patient.entity';

export enum PrescriptionStatus {
  COLLECTED = 'collected',
  PENDING = 'pending',
  OVERDUE = 'overdue',
}

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  medicationId: string;

  @Column('uuid')
  patientId: string;

  @ManyToOne(() => Medication, (medication) => medication.prescriptions)
  @JoinColumn({ name: 'medicationId' })
  medication: Medication;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column('date')
  dateCollected: Date;

  @Column('date')
  nextDueDate: Date;

  @Column({
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.PENDING,
  })
  status: PrescriptionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeUpdate()
  updateStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDue = new Date(this.nextDueDate);
    nextDue.setHours(0, 0, 0, 0);

    if (this.status !== PrescriptionStatus.COLLECTED && nextDue < today) {
      this.status = PrescriptionStatus.OVERDUE;
    }
  }
}

