import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { PatientProgram } from './entities/patient-program.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(PatientProgram)
    private patientProgramsRepository: Repository<PatientProgram>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const { programIds, ...patientData } = createPatientDto;

    const patient = this.patientsRepository.create(patientData);
    const savedPatient = await this.patientsRepository.save(patient);

    if (programIds && programIds.length > 0) {
      await this.enrollInPrograms(savedPatient.id, programIds);
    }

    return this.findOne(savedPatient.id);
  }

  async findAll(filters?: { status?: string; programId?: string; adherence?: string }): Promise<Patient[]> {
    const query = this.patientsRepository.createQueryBuilder('patient')
      .leftJoinAndSelect('patient.assignedStaff', 'staff')
      .leftJoinAndSelect('patient.patientPrograms', 'patientPrograms')
      .leftJoinAndSelect('patientPrograms.program', 'program')
      .leftJoinAndSelect('patient.sessions', 'sessions');

    if (filters?.status) {
      query.andWhere('patient.status = :status', { status: filters.status });
    }

    if (filters?.programId) {
      query.andWhere('patientPrograms.programId = :programId', { programId: filters.programId });
    }

    const patients = await query.getMany();
    
    // Map patients to include adherenceRate and programs as plain properties for JSON serialization
    const patientsWithAdherence = patients.map(patient => {
      const adherenceRate = patient.adherenceRate;
      const programs = patient.programs;
      return {
        ...patient,
        adherenceRate,
        programs,
      };
    });

    if (filters?.adherence) {
      const adherenceThreshold = parseInt(filters.adherence, 10);
      return patientsWithAdherence.filter(p => {
        const rate = p.adherenceRate;
        if (filters.adherence === 'high') return rate >= 80;
        if (filters.adherence === 'medium') return rate >= 50 && rate < 80;
        if (filters.adherence === 'low') return rate < 50;
        return rate >= adherenceThreshold;
      });
    }

    return patientsWithAdherence;
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['assignedStaff', 'patientPrograms', 'patientPrograms.program', 'sessions', 'prescriptions'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Include adherenceRate and programs as plain properties for JSON serialization
    const adherenceRate = patient.adherenceRate;
    const programs = patient.programs;
    return {
      ...patient,
      adherenceRate,
      programs,
    } as Patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const { programIds, ...patientData } = updatePatientDto;
    const patient = await this.findOne(id);

    Object.assign(patient, patientData);
    await this.patientsRepository.save(patient);

    if (programIds !== undefined) {
      await this.patientProgramsRepository.delete({ patientId: id });
      if (programIds.length > 0) {
        await this.enrollInPrograms(id, programIds);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientsRepository.delete(id);
  }

  async enrollInPrograms(patientId: string, programIds: string[]): Promise<void> {
    const enrollments = programIds.map(programId =>
      this.patientProgramsRepository.create({ patientId, programId })
    );
    await this.patientProgramsRepository.save(enrollments);
  }

  async unenrollFromProgram(patientId: string, programId: string): Promise<void> {
    await this.patientProgramsRepository.delete({ patientId, programId });
  }
}

