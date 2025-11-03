import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProgramMedication } from '../../programs/entities/program-medication.entity';
import { Prescription } from './prescription.entity';

export enum MedicationFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  dosage: string;

  @Column({
    type: 'enum',
    enum: MedicationFrequency,
    default: MedicationFrequency.DAILY,
  })
  frequency: MedicationFrequency;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProgramMedication, (programMed) => programMed.medication)
  programMedications: ProgramMedication[];

  @OneToMany(() => Prescription, (prescription) => prescription.medication)
  prescriptions: Prescription[];
}

