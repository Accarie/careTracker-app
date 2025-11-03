import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Medication, MedicationFrequency } from './entities/medication.entity';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(Medication)
    private medicationsRepository: Repository<Medication>,
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
  ) {}

  async create(createMedicationDto: CreateMedicationDto): Promise<Medication> {
    const medication = this.medicationsRepository.create(createMedicationDto);
    const savedMedication = await this.medicationsRepository.save(medication);
    return this.findOne(savedMedication.id);
  }

  async findAll(): Promise<Medication[]> {
    return this.medicationsRepository.find();
  }

  async findOne(id: string): Promise<Medication> {
    const medication = await this.medicationsRepository.findOne({
      where: { id },
      relations: ['prescriptions', 'prescriptions.patient'],
    });

    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found`);
    }

    return medication;
  }

  async update(id: string, updateDto: Partial<CreateMedicationDto>): Promise<Medication> {
    const medication = await this.findOne(id);
    Object.assign(medication, updateDto);
    return this.medicationsRepository.save(medication);
  }

  async remove(id: string): Promise<void> {
    const medication = await this.findOne(id);
    
    // Delete all related prescriptions first to avoid foreign key constraint violation
    await this.prescriptionsRepository.delete({ medicationId: id });
    
    // Now delete the medication
    await this.medicationsRepository.delete(id);
  }

  async createPrescription(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    const medication = await this.findOne(createPrescriptionDto.medicationId);
    
    // Check for duplicate collection based on frequency
    const canCollect = await this.canCollectMedication(
      createPrescriptionDto.patientId,
      createPrescriptionDto.medicationId,
      medication.frequency,
      new Date(createPrescriptionDto.dateCollected),
    );

    if (!canCollect) {
      throw new BadRequestException(
        `Medication already collected. Frequency: ${medication.frequency}. Please wait until next collection date.`,
      );
    }

    const prescription = this.prescriptionsRepository.create({
      ...createPrescriptionDto,
      dateCollected: new Date(createPrescriptionDto.dateCollected),
      nextDueDate: new Date(createPrescriptionDto.nextDueDate),
    });

    const savedPrescription = await this.prescriptionsRepository.save(prescription);
    return this.findPrescription(savedPrescription.id);
  }

  async findAllPrescriptions(filters?: { patientId?: string; status?: string }): Promise<Prescription[]> {
    const query = this.prescriptionsRepository.createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.medication', 'medication')
      .leftJoinAndSelect('prescription.patient', 'patient');

    if (filters?.patientId) {
      query.andWhere('prescription.patientId = :patientId', { patientId: filters.patientId });
    }

    if (filters?.status) {
      query.andWhere('prescription.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findPrescription(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['medication', 'patient'],
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return prescription;
  }

  async updatePrescriptionStatus(id: string, status: PrescriptionStatus): Promise<Prescription> {
    const prescription = await this.findPrescription(id);
    prescription.status = status;
    return this.prescriptionsRepository.save(prescription);
  }

  async removePrescription(id: string): Promise<void> {
    const prescription = await this.findPrescription(id);
    await this.prescriptionsRepository.delete(id);
  }

  async canCollectMedication(
    patientId: string,
    medicationId: string,
    frequency: MedicationFrequency,
    collectionDate: Date,
  ): Promise<boolean> {
    const existingPrescriptions = await this.prescriptionsRepository.find({
      where: {
        patientId,
        medicationId,
        status: PrescriptionStatus.COLLECTED,
      },
      order: { dateCollected: 'DESC' },
      take: 1,
    });

    if (existingPrescriptions.length === 0) {
      return true;
    }

    // Ensure lastCollection is a Date object (it might be a string from database)
    const lastCollectionRaw = existingPrescriptions[0].dateCollected;
    const lastCollection = lastCollectionRaw instanceof Date 
      ? lastCollectionRaw 
      : new Date(lastCollectionRaw);
    
    // Ensure collectionDate is a Date object
    const collectionDateObj = collectionDate instanceof Date 
      ? collectionDate 
      : new Date(collectionDate);

    const daysSinceLastCollection = Math.floor(
      (collectionDateObj.getTime() - lastCollection.getTime()) / (1000 * 60 * 60 * 24),
    );

    switch (frequency) {
      case MedicationFrequency.DAILY:
        return daysSinceLastCollection >= 1;
      case MedicationFrequency.WEEKLY:
        return daysSinceLastCollection >= 7;
      case MedicationFrequency.MONTHLY:
        return daysSinceLastCollection >= 30;
      default:
        return true;
    }
  }

  async updateOverduePrescriptions(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overduePrescriptions = await this.prescriptionsRepository
      .createQueryBuilder('prescription')
      .where('prescription.nextDueDate < :today', { today })
      .andWhere('prescription.status != :collected', { collected: PrescriptionStatus.COLLECTED })
      .getMany();

    for (const prescription of overduePrescriptions) {
      prescription.status = PrescriptionStatus.OVERDUE;
    }

    await this.prescriptionsRepository.save(overduePrescriptions);
    return overduePrescriptions.length;
  }
}

