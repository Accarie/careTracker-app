import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Program, ProgramFrequency } from '../programs/entities/program.entity';
import { Patient, PatientStatus } from '../patients/entities/patient.entity';
import { Medication, MedicationFrequency } from '../medications/entities/medication.entity';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const programRepository = dataSource.getRepository(Program);
  const patientRepository = dataSource.getRepository(Patient);
  const medicationRepository = dataSource.getRepository(Medication);

  // Clear existing data if tables exist (optional - skip if first run)
  console.log('Clearing existing data...');
  try {
    // Try to clear existing data - if tables don't exist, this will fail gracefully
    await userRepository.clear().catch(() => {});
    await programRepository.clear().catch(() => {});
    await patientRepository.clear().catch(() => {});
    await medicationRepository.clear().catch(() => {});
    console.log('Existing data cleared (if any existed)');
  } catch (error) {
    console.log('Note: Tables are being created for the first time');
  }

  // Seed Users
  console.log('Seeding users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const guestPassword = await bcrypt.hash('guest123', 10);

  const users = await userRepository.save([
    {
      email: 'admin@healthcare.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
    {
      email: 'sarah@healthcare.com',
      name: 'Dr. Sarah Johnson',
      password: staffPassword,
      role: UserRole.STAFF,
    },
    {
      email: 'guest@healthcare.com',
      name: 'Guest User',
      password: guestPassword,
      role: UserRole.GUEST,
    },
  ]);

  // Seed Programs
  console.log('Seeding programs...');
  const programs = await programRepository.save([
    {
      name: 'Diabetes Management',
      description: 'Comprehensive diabetes care program with regular monitoring and medication',
      frequency: ProgramFrequency.WEEKLY,
      sessionsCount: 12,
    },
    {
      name: 'Hypertension Control',
      description: 'Blood pressure monitoring and lifestyle management program',
      frequency: ProgramFrequency.MONTHLY,
      sessionsCount: 6,
    },
    {
      name: 'Mental Health Support',
      description: 'Weekly counseling and mental wellness sessions',
      frequency: ProgramFrequency.WEEKLY,
      sessionsCount: 16,
    },
  ]);

  // Seed Medications
  console.log('Seeding medications...');
  const medications = await medicationRepository.save([
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: MedicationFrequency.DAILY,
      description: 'Oral diabetes medication',
    },
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: MedicationFrequency.DAILY,
      description: 'Blood pressure medication',
    },
    {
      name: 'Sertraline',
      dosage: '50mg',
      frequency: MedicationFrequency.DAILY,
      description: 'Antidepressant medication',
    },
  ]);

  // Seed Patients
  console.log('Seeding patients...');
  const patients = await patientRepository.save([
    {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      assignedStaffId: users[1].id, // Dr. Sarah Johnson
      status: PatientStatus.ACTIVE,
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 (555) 234-5678',
      assignedStaffId: users[1].id,
      status: PatientStatus.ACTIVE,
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '+1 (555) 345-6789',
      assignedStaffId: users[1].id,
      status: PatientStatus.ACTIVE,
    },
  ]);

  console.log('Database seeded successfully!');
  console.log(`Created ${users.length} users, ${programs.length} programs, ${medications.length} medications, ${patients.length} patients`);
}

