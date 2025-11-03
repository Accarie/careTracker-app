import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Patient, PatientStatus } from '../patients/entities/patient.entity';
import { Program } from '../programs/entities/program.entity';
import { Session, SessionStatus } from '../sessions/entities/session.entity';
import { Prescription, PrescriptionStatus } from '../medications/entities/prescription.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Program)
    private programsRepository: Repository<Program>,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
  ) {}

  async getDashboardStats() {
    const [
      totalPatients,
      activePatients,
      totalPrograms,
      totalEnrollments,
      attendedSessions,
      missedSessions,
      canceledSessions,
      overduePrescriptions,
      patients,
    ] = await Promise.all([
      this.patientsRepository.count(),
      this.patientsRepository.count({ where: { status: PatientStatus.ACTIVE } }),
      this.programsRepository.count(),
      this.patientsRepository
        .createQueryBuilder('patient')
        .leftJoin('patient.patientPrograms', 'patientPrograms')
        .getCount(),
      this.sessionsRepository.count({ where: { status: SessionStatus.ATTENDED } }),
      this.sessionsRepository.count({ where: { status: SessionStatus.MISSED } }),
      this.sessionsRepository.count({ where: { status: SessionStatus.CANCELED } }),
      this.prescriptionsRepository.count({ where: { status: PrescriptionStatus.OVERDUE } }),
      this.patientsRepository.find({ relations: ['sessions'] }),
    ]);

    const averageAdherence =
      patients.length > 0
        ? Math.round(
            patients.reduce((sum, p) => {
              const sessions = p.sessions || [];
              if (sessions.length === 0) {
                // No sessions means we can't calculate adherence - return 0 instead of 100
                return sum;
              }
              const attended = sessions.filter((s) => s.status === SessionStatus.ATTENDED).length;
              return sum + Math.round((attended / sessions.length) * 100);
            }, 0) / patients.length,
          )
        : 0;

    return {
      totalPatients,
      activePatients,
      totalPrograms,
      totalEnrollments,
      averageAdherence,
      overduePrescriptions,
      attendedSessions,
      missedSessions,
      canceledSessions,
    };
  }

  async getPatientAdherenceData() {
    const patients = await this.patientsRepository.find({
      relations: ['sessions'],
    });

    return patients.map((patient) => {
      const sessions = patient.sessions || [];
      const attended = sessions.filter((s) => s.status === SessionStatus.ATTENDED).length;
      const adherence = sessions.length > 0 ? Math.round((attended / sessions.length) * 100) : 0;

      return {
        name: patient.name.split(' ')[0],
        adherence,
      };
    });
  }

  async getProgramEnrollmentData() {
    const programs = await this.programsRepository.find({
      relations: ['patientPrograms'],
    });

    return programs.map((program) => ({
      name: program.name.split(' ')[0],
      enrolled: program.patientPrograms?.length || 0,
    }));
  }

  async getSessionStatusData() {
    const [attended, missed, canceled] = await Promise.all([
      this.sessionsRepository.count({ where: { status: SessionStatus.ATTENDED } }),
      this.sessionsRepository.count({ where: { status: SessionStatus.MISSED } }),
      this.sessionsRepository.count({ where: { status: SessionStatus.CANCELED } }),
    ]);

    return [
      { name: 'Attended', value: attended },
      { name: 'Missed', value: missed },
      { name: 'Canceled', value: canceled },
    ];
  }

  async exportPatientsCSV(startDate?: string, endDate?: string): Promise<string> {
    const query = this.patientsRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.assignedStaff', 'staff')
      .leftJoinAndSelect('patient.patientPrograms', 'patientPrograms')
      .leftJoinAndSelect('patientPrograms.program', 'program');

    if (startDate && endDate) {
      query.andWhere('patient.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const patients = await query.getMany();

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Assigned Staff', 'Adherence Rate', 'Status', 'Created At'];
    const rows = patients.map((p) => [
      p.id,
      p.name,
      p.email,
      p.phone,
      p.assignedStaff?.name || 'N/A',
      `${p.adherenceRate}%`,
      p.status,
      p.createdAt.toISOString().split('T')[0],
    ]);

    return this.generateCSV(headers, rows);
  }

  async exportProgramsCSV(startDate?: string, endDate?: string): Promise<string> {
    const query = this.programsRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.patientPrograms', 'patientPrograms');

    if (startDate && endDate) {
      query.andWhere('program.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const programs = await query.getMany();

    const headers = ['ID', 'Name', 'Description', 'Frequency', 'Total Sessions', 'Enrolled Patients', 'Created At'];
    const rows = programs.map((p) => [
      p.id,
      p.name,
      p.description,
      p.frequency,
      p.sessionsCount.toString(),
      (p.patientPrograms?.length || 0).toString(),
      p.createdAt.toISOString().split('T')[0],
    ]);

    return this.generateCSV(headers, rows);
  }

  async exportSessionsCSV(startDate?: string, endDate?: string): Promise<string> {
    let sessions;

    if (startDate && endDate) {
      sessions = await this.sessionsRepository.find({
        where: {
          date: Between(new Date(startDate), new Date(endDate)),
        },
        relations: ['program', 'patient'],
      });
    } else {
      sessions = await this.sessionsRepository.find({
        relations: ['program', 'patient'],
      });
    }

    const formatDate = (dateValue: any): string => {
      if (!dateValue) return 'N/A';
      
      // Try to convert to Date if not already
      let date: Date;
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else {
        // Try to construct Date from value
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return String(dateValue);
      }
      
      return date.toISOString().split('T')[0];
    };

    const headers = ['ID', 'Program', 'Patient', 'Date', 'Status', 'Cancel Reason', 'Notes', 'Created At'];
    const rows = sessions.map((s) => [
      s.id,
      s.program?.name || 'N/A',
      s.patient?.name || 'N/A',
      formatDate(s.date),
      s.status,
      s.cancelReason || 'N/A',
      s.notes || 'N/A',
      formatDate(s.createdAt),
    ]);

    return this.generateCSV(headers, rows);
  }

  async exportPrescriptionsCSV(startDate?: string, endDate?: string): Promise<string> {
    const query = this.prescriptionsRepository
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.medication', 'medication')
      .leftJoinAndSelect('prescription.patient', 'patient');

    if (startDate && endDate) {
      query.andWhere('prescription.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const prescriptions = await query.getMany();

    const headers = ['ID', 'Medication', 'Patient', 'Date Collected', 'Next Due Date', 'Status'];
    const rows = prescriptions.map((p) => [
      p.id,
      `${p.medication?.name} ${p.medication?.dosage}`,
      p.patient?.name || 'N/A',
      p.dateCollected.toISOString().split('T')[0],
      p.nextDueDate.toISOString().split('T')[0],
      p.status,
    ]);

    return this.generateCSV(headers, rows);
  }

  private generateCSV(headers: string[], rows: any[][]): string {
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [headers.map(escapeCSV).join(',')];
    csvRows.push(...rows.map((row) => row.map(escapeCSV).join(',')));

    return csvRows.join('\n');
  }
}

