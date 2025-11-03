// Mock data for the healthcare management system

export type UserRole = "admin" | "staff" | "guest"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  password: string
}

export interface Program {
  id: string
  name: string
  description: string
  frequency: "daily" | "weekly" | "monthly"
  sessionsCount: number
  enrolledPatients: number
  createdAt: string
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  assignedStaffId: string
  assignedStaffName: string
  programs: string[]
  adherenceRate: number
  status: "active" | "inactive"
  createdAt: string
}

export interface Session {
  id: string
  programId: string
  programName: string
  patientId: string
  patientName: string
  date: string
  status: "attended" | "missed" | "canceled"
  cancelReason?: string
  notes?: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: "daily" | "weekly" | "monthly"
  description: string
}

export interface Prescription {
  id: string
  medicationId: string
  medicationName: string
  patientId: string
  patientName: string
  dateCollected: string
  nextDueDate: string
  status: "collected" | "pending" | "overdue"
}

// Mock users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@healthcare.com",
    role: "admin",
    password: "admin123",
  },
  {
    id: "2",
    name: "Dr. Sarah Johnson",
    email: "sarah@healthcare.com",
    role: "staff",
    password: "staff123",
  },
  {
    id: "3",
    name: "Guest User",
    email: "guest@healthcare.com",
    role: "guest",
    password: "guest123",
  },
]

// Mock programs
export const mockPrograms: Program[] = [
  {
    id: "1",
    name: "Diabetes Management",
    description: "Comprehensive diabetes care program with regular monitoring and medication",
    frequency: "weekly",
    sessionsCount: 12,
    enrolledPatients: 24,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Hypertension Control",
    description: "Blood pressure monitoring and lifestyle management program",
    frequency: "monthly",
    sessionsCount: 6,
    enrolledPatients: 18,
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    name: "Mental Health Support",
    description: "Weekly counseling and mental wellness sessions",
    frequency: "weekly",
    sessionsCount: 16,
    enrolledPatients: 15,
    createdAt: "2024-01-20",
  },
]

// Mock patients
export const mockPatients: Patient[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    assignedStaffId: "2",
    assignedStaffName: "Dr. Sarah Johnson",
    programs: ["1", "2"],
    adherenceRate: 92,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1 (555) 234-5678",
    assignedStaffId: "2",
    assignedStaffName: "Dr. Sarah Johnson",
    programs: ["1"],
    adherenceRate: 88,
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.brown@email.com",
    phone: "+1 (555) 345-6789",
    assignedStaffId: "2",
    assignedStaffName: "Dr. Sarah Johnson",
    programs: ["3"],
    adherenceRate: 75,
    status: "active",
    createdAt: "2024-02-01",
  },
]

// Mock sessions
export const mockSessions: Session[] = [
  {
    id: "1",
    programId: "1",
    programName: "Diabetes Management",
    patientId: "1",
    patientName: "John Smith",
    date: "2024-11-01",
    status: "attended",
  },
  {
    id: "2",
    programId: "1",
    programName: "Diabetes Management",
    patientId: "2",
    patientName: "Emily Davis",
    date: "2024-11-01",
    status: "missed",
  },
  {
    id: "3",
    programId: "3",
    programName: "Mental Health Support",
    patientId: "3",
    patientName: "Michael Brown",
    date: "2024-10-28",
    status: "canceled",
    cancelReason: "Patient emergency",
  },
]

// Mock medications
export const mockMedications: Medication[] = [
  {
    id: "1",
    name: "Metformin",
    dosage: "500mg",
    frequency: "daily",
    description: "Oral diabetes medication",
  },
  {
    id: "2",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "daily",
    description: "Blood pressure medication",
  },
  {
    id: "3",
    name: "Sertraline",
    dosage: "50mg",
    frequency: "daily",
    description: "Antidepressant medication",
  },
]

// Mock prescriptions
export const mockPrescriptions: Prescription[] = [
  {
    id: "1",
    medicationId: "1",
    medicationName: "Metformin 500mg",
    patientId: "1",
    patientName: "John Smith",
    dateCollected: "2024-10-15",
    nextDueDate: "2024-11-15",
    status: "pending",
  },
  {
    id: "2",
    medicationId: "2",
    medicationName: "Lisinopril 10mg",
    patientId: "1",
    patientName: "John Smith",
    dateCollected: "2024-10-20",
    nextDueDate: "2024-11-20",
    status: "pending",
  },
  {
    id: "3",
    medicationId: "1",
    medicationName: "Metformin 500mg",
    patientId: "2",
    patientName: "Emily Davis",
    dateCollected: "2024-10-10",
    nextDueDate: "2024-11-10",
    status: "overdue",
  },
]
