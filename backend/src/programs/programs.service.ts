import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { Session } from '../sessions/entities/session.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private programsRepository: Repository<Program>,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
  ) {}

  async create(createProgramDto: CreateProgramDto): Promise<Program> {
    const program = this.programsRepository.create(createProgramDto);
    const savedProgram = await this.programsRepository.save(program);
    return this.findOne(savedProgram.id);
  }

  async findAll(): Promise<Program[]> {
    return this.programsRepository.find({
      relations: ['patientPrograms', 'programMedications', 'programMedications.medication'],
    });
  }

  async findOne(id: string): Promise<Program> {
    const program = await this.programsRepository.findOne({
      where: { id },
      relations: ['patientPrograms', 'patientPrograms.patient', 'programMedications', 'programMedications.medication'],
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return program;
  }

  async update(id: string, updateProgramDto: UpdateProgramDto): Promise<Program> {
    const program = await this.findOne(id);
    Object.assign(program, updateProgramDto);
    return this.programsRepository.save(program);
  }

  async remove(id: string): Promise<void> {
    const program = await this.findOne(id);
    
    // Delete all related sessions first to avoid foreign key constraint violation
    await this.sessionsRepository.delete({ programId: id });
    
    // Now delete the program
    await this.programsRepository.delete(id);
  }
}

