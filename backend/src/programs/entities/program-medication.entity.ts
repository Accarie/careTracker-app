import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Program } from './program.entity';
import { Medication } from '../../medications/entities/medication.entity';

@Entity('program_medications')
export class ProgramMedication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  programId: string;

  @Column('uuid')
  medicationId: string;

  @ManyToOne(() => Program, (program) => program.programMedications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'programId' })
  program: Program;

  @ManyToOne(() => Medication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medicationId' })
  medication: Medication;

  @CreateDateColumn()
  createdAt: Date;
}

