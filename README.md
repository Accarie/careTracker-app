# CareTrack - Healthcare Management System

A full-stack healthcare management system with patient tracking, program management, medication dispensing, and comprehensive reporting.

## Architecture

- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS with TypeScript, PostgreSQL, TypeORM
- **Authentication**: JWT with role-based access control (RBAC)
- **Documentation**: Swagger/OpenAPI

## Features

### Core Functionalities

1. **Authentication & Roles**

   - Secure JWT-based login/registration
   - Role-based access control (Admin, Staff, Guest)
   - Protected routes and API endpoints

2. **Program Management** (Admin)

   - Create, update, delete health programs
   - Define program frequency (daily, weekly, monthly)
   - Track enrolled patients

3. **Patient Enrollment & Tracking**

   - Enroll patients into programs
   - Track session attendance (attended, missed, canceled)
   - Monitor medication adherence rates
   - Filter patients by status, program, adherence level

4. **Medication Management**

   - Medication catalog management
   - Prescription tracking with duplicate prevention
   - Automatic status updates (pending, collected, overdue)
   - Frequency-based collection limits

5. **Dashboard & Reporting**
   - Real-time statistics and analytics
   - Interactive charts (adherence, enrollments, session status)
   - CSV export functionality for all data
   - Patient progress tracking

### Backend API Features

- 🔐 **JWT Authentication** with role-based access control (RBAC)
- 👥 **User Management** (Admin, Staff, Guest roles)
- 🏥 **Program Management** - Create and manage healthcare programs
- 👨‍⚕️ **Patient Management** - Track patients, enrollments, and adherence
- 📅 **Session Tracking** - Record session attendance (attended, missed, canceled)
- 💊 **Medication Management** - Manage medications and prescriptions with duplicate prevention
- 📊 **Reports & Analytics** - Dashboard stats, charts data, CSV exports
- 📚 **Swagger Documentation** - API documentation at `/api/docs`

## Project Structure

```
caretrack/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   │   ├── decorators/     # Custom decorators (public, roles)
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── guards/         # Authentication guards
│   │   │   ├── strategies/     # JWT strategy
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.service.ts
│   │   ├── database/           # Database configuration
│   │   │   ├── data-source.ts  # TypeORM data source
│   │   │   ├── run-seed.ts     # Seed script runner
│   │   │   └── seed.ts         # Database seed data
│   │   ├── medications/        # Medication management module
│   │   │   ├── dto/            # DTOs for medications
│   │   │   ├── entities/       # Medication entities
│   │   │   ├── medications.controller.ts
│   │   │   ├── medications.module.ts
│   │   │   └── medications.service.ts
│   │   ├── patients/           # Patient management module
│   │   │   ├── dto/            # DTOs for patients
│   │   │   ├── entities/       # Patient entities
│   │   │   ├── patients.controller.ts
│   │   │   ├── patients.module.ts
│   │   │   └── patients.service.ts
│   │   ├── programs/            # Program management module
│   │   │   ├── dto/            # DTOs for programs
│   │   │   ├── entities/       # Program entities
│   │   │   ├── programs.controller.ts
│   │   │   ├── programs.module.ts
│   │   │   └── programs.service.ts
│   │   ├── reports/             # Reports and analytics module
│   │   │   ├── reports.controller.ts
│   │   │   ├── reports.module.ts
│   │   │   └── reports.service.ts
│   │   ├── sessions/            # Session tracking module
│   │   │   ├── dto/            # DTOs for sessions
│   │   │   ├── entities/       # Session entities
│   │   │   ├── sessions.controller.ts
│   │   │   ├── sessions.module.ts
│   │   │   └── sessions.service.ts
│   │   ├── users/               # User management module
│   │   │   ├── dto/            # DTOs for users
│   │   │   ├── entities/       # User entities
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── app.module.ts        # Root application module
│   │   └── main.ts              # Application entry point
│   ├── dist/                    # Compiled JavaScript files
│   ├── nest-cli.json            # NestJS CLI configuration
│   ├── package.json             # Backend dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   └── README.md                # Backend documentation
│
├── frontend/                    # Next.js Frontend Application
│   ├── app/                     # Next.js App Router
│   │   ├── dashboard/          # Dashboard page
│   │   │   └── page.tsx
│   │   ├── login/               # Login page
│   │   │   └── page.tsx
│   │   ├── medications/         # Medications page
│   │   │   └── page.tsx
│   │   ├── patients/            # Patients page
│   │   │   └── page.tsx
│   │   ├── programs/            # Programs page
│   │   │   └── page.tsx
│   │   ├── reports/             # Reports page
│   │   │   └── page.tsx
│   │   ├── sessions/            # Sessions page
│   │   │   └── page.tsx
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   │   ├── ui/                  # UI component library (shadcn/ui)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   └── ... (57 UI components)
│   │   ├── sidebar-nav.tsx      # Sidebar navigation component
│   │   └── theme-provider.tsx   # Theme provider component
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-mobile.ts        # Mobile detection hook
│   │   └── use-toast.ts         # Toast notification hook
│   ├── lib/                     # Utility libraries
│   │   ├── api.ts               # API client service layer
│   │   ├── auth-context.tsx     # Authentication context
│   │   ├── mock-data.ts         # Mock data for development
│   │   ├── use-api-token.ts     # API token hook
│   │   └── utils.ts             # Utility functions
│   ├── public/                  # Static assets
│   │   ├── placeholder-logo.png
│   │   ├── placeholder-logo.svg
│   │   └── ... (other assets)
│   ├── styles/                  # Additional styles
│   │   └── globals.css
│   ├── components.json          # shadcn/ui configuration
│   ├── next.config.mjs          # Next.js configuration
│   ├── package.json             # Frontend dependencies
│   ├── postcss.config.mjs       # PostCSS configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── README.md                # Frontend documentation
│
└── README.md                    # This file - Main project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create `.env` file in the `backend` directory:**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=healthcare_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
```

4. **Create PostgreSQL database:**

```sql
CREATE DATABASE healthcare_db;
```

5. **Generate seed data (optional but recommended for initial setup):**

```bash
npm run seed
```

This will populate the database with sample data including default users (admin, staff, guest), programs, patients, sessions, and medications.

6. **Start the backend:**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`
Swagger documentation: `http://localhost:3001/api/docs`

### Frontend Setup

1. **Navigate to frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
## or use this command in case npm i doesn't work
npm install react-is --legacy-peer-deps
```

3. **Create `.env.local` file in the `frontend` directory:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. **Start the frontend:**

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Default Credentials

After setting up the backend, you can use the following default credentials:

**Admin:**

- Email: `admin@healthcare.com`
- Password: `admin123`

**Staff:**

- Email: `sarah@healthcare.com`
- Password: `staff123`

**Guest:**

- Email: `guest@healthcare.com`
- Password: `guest123`

_Note: These users are created by the seed script when you run the backend for the first time._

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get current user profile

### Users

- `GET /users` - Get all users (Admin/Staff)
- `GET /users/staff` - Get all staff members
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (Admin only)
- `PATCH /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Programs

- `GET /programs` - Get all programs
- `GET /programs/:id` - Get program by ID
- `POST /programs` - Create program (Admin only)
- `PATCH /programs/:id` - Update program (Admin only)
- `DELETE /programs/:id` - Delete program (Admin only)

### Patients

- `GET /patients` - Get all patients (with filters: status, programId, adherence)
- `GET /patients/:id` - Get patient by ID
- `POST /patients` - Create patient (Admin/Staff)
- `PATCH /patients/:id` - Update patient (Admin/Staff)
- `DELETE /patients/:id` - Delete patient (Admin only)

### Sessions

- `GET /sessions` - Get all sessions (with filters)
- `GET /sessions/:id` - Get session by ID
- `POST /sessions` - Create session (Admin/Staff)
- `PATCH /sessions/:id` - Update session (Admin/Staff)
- `DELETE /sessions/:id` - Delete session (Admin only)
- `POST /sessions/mark-missed` - Mark past sessions as missed

### Medications

- `GET /medications` - Get all medications
- `GET /medications/:id` - Get medication by ID
- `POST /medications` - Create medication (Admin only)
- `PATCH /medications/:id` - Update medication (Admin only)
- `DELETE /medications/:id` - Delete medication (Admin only)

### Prescriptions

- `GET /medications/prescriptions/all` - Get all prescriptions
- `GET /medications/prescriptions/:id` - Get prescription by ID
- `POST /medications/prescriptions` - Create prescription (with duplicate prevention)
- `PATCH /medications/prescriptions/:id/status` - Update prescription status
- `DELETE /medications/prescriptions/:id` - Delete prescription
- `POST /medications/prescriptions/update-overdue` - Update overdue prescriptions

### Reports

- `GET /reports/dashboard` - Get dashboard statistics
- `GET /reports/adherence` - Get patient adherence data for charts
- `GET /reports/enrollments` - Get program enrollment data for charts
- `GET /reports/session-status` - Get session status distribution
- `GET /reports/export/patients` - Export patients to CSV
- `GET /reports/export/programs` - Export programs to CSV
- `GET /reports/export/sessions` - Export sessions to CSV
- `GET /reports/export/prescriptions` - Export prescriptions to CSV

## API Integration

The frontend uses the API service layer in `lib/api.ts` which provides:

- `authAPI` - Authentication endpoints
- `usersAPI` - User management
- `programsAPI` - Program CRUD operations
- `patientsAPI` - Patient management with filtering
- `sessionsAPI` - Session tracking
- `medicationsAPI` - Medication and prescription management
- `reportsAPI` - Dashboard stats and CSV exports

## Database Schema

### Entities

#### User

- **Fields**: `id` (UUID), `email` (unique), `name`, `password` (hashed), `role` (enum: admin, staff, guest), `createdAt`, `updatedAt`
- **Relationships**: One-to-many with `Patient` (assignedStaff)
- **Methods**: `validatePassword()` for password verification, `hashPasswordOnInsert()` and `hashPasswordOnUpdate()` for automatic password hashing

#### Program

- **Fields**: `id` (UUID), `name`, `description`, `frequency` (enum: daily, weekly, monthly), `sessionsCount`, `createdAt`, `updatedAt`
- **Relationships**:
  - One-to-many with `PatientProgram` (enrollments)
  - One-to-many with `Session`
  - One-to-many with `ProgramMedication`
- **Computed**: `enrolledPatients` (getter)

#### Patient

- **Fields**: `id` (UUID), `name`, `email` (unique), `phone`, `assignedStaffId` (FK), `status` (enum: active, inactive), `createdAt`, `updatedAt`
- **Relationships**:
  - Many-to-one with `User` (assignedStaff)
  - One-to-many with `PatientProgram` (program enrollments)
  - One-to-many with `Session`
  - One-to-many with `Prescription`
- **Computed**: `adherenceRate` (calculated from sessions: attended/total \* 100), `programs` (array of program IDs)

#### PatientProgram

- **Fields**: `id` (UUID), `patientId` (FK), `programId` (FK), `createdAt`, `updatedAt`
- **Purpose**: Many-to-many relationship between patients and programs (enrollment tracking)

#### Session

- **Fields**: `id` (UUID), `programId` (FK), `patientId` (FK), `date`, `status` (enum: attended, missed, canceled), `cancelReason`, `notes`, `createdAt`, `updatedAt`
- **Relationships**: Many-to-one with `Program`, Many-to-one with `Patient`

#### Medication

- **Fields**: `id` (UUID), `name`, `dosage`, `frequency` (enum: daily, weekly, monthly), `description`, `createdAt`, `updatedAt`
- **Relationships**: One-to-many with `Prescription`, One-to-many with `ProgramMedication`

#### Prescription

- **Fields**: `id` (UUID), `medicationId` (FK), `patientId` (FK), `dateCollected`, `nextDueDate`, `status` (enum: collected, pending, overdue), `createdAt`, `updatedAt`
- **Relationships**: Many-to-one with `Medication`, Many-to-one with `Patient`
- **Automatic Updates**: Status automatically updated to "overdue" if `nextDueDate` is in the past (via `@BeforeUpdate` hook)

#### ProgramMedication

- **Fields**: `id` (UUID), `programId` (FK), `medicationId` (FK), `createdAt`, `updatedAt`
- **Purpose**: Many-to-many relationship between programs and medications

### Entity Relationships Diagram

```
User (assignedStaff)
  └─> Patient (1:N)
      ├─> PatientProgram (1:N) ─> Program (N:1)
      ├─> Session (1:N)
      └─> Prescription (1:N) ─> Medication (N:1)

Program
  ├─> PatientProgram (1:N) ─> Patient (N:1)
  ├─> Session (1:N)
  └─> ProgramMedication (1:N) ─> Medication (N:1)
```

## Seed Data

The database seed script (`backend/src/database/seed.ts`) creates:

1. **Users** (3 default users):

   - Admin: `admin@healthcare.com` / `admin123`
   - Staff: `sarah@healthcare.com` / `staff123`
   - Guest: `guest@healthcare.com` / `guest123`

2. **Programs** (3 sample programs):

   - Diabetes Management (Weekly, 12 sessions)
   - Hypertension Control (Monthly, 6 sessions)
   - Mental Health Support (Weekly, 16 sessions)

3. **Medications** (3 sample medications):

   - Metformin (500mg, Daily)
   - Lisinopril (10mg, Daily)
   - Sertraline (50mg, Daily)

4. **Patients** (3 sample patients):
   - John Smith, Emily Davis, Michael Brown
   - All assigned to Dr. Sarah Johnson (staff user)

To generate seed data, run:

```bash
cd backend
npm run seed
```

## Implementation Details and Assumptions

### Backend Implementation

1. **Authentication & Authorization**:

   - JWT tokens include user ID, email, and role in the payload
   - All protected routes use `JwtAuthGuard` for authentication
   - Role-based access is enforced via `RolesGuard` with `@Roles()` decorator
   - Password hashing uses bcrypt with automatic hashing on insert/update

2. **Data Validation**:

   - DTOs use `class-validator` decorators for input validation
   - Email uniqueness is enforced at the database level
   - Enum types are strictly validated (UserRole, PatientStatus, SessionStatus, etc.)

3. **Database Synchronization**:

   - Development uses `synchronize: true` for automatic schema updates
   - Production should use migrations (`synchronize: false`)
   - Seed script creates initial data with error handling for existing tables

4. **Computed Properties**:

   - Patient `adherenceRate` is calculated from session attendance (attended sessions / total sessions \* 100)
   - Patient `programs` getter returns array of enrolled program IDs
   - Program `enrolledPatients` getter returns count of enrolled patients

5. **Automatic Status Updates**:

   - Prescription status automatically updates to "overdue" via `@BeforeUpdate` hook when `nextDueDate` passes
   - Sessions can be bulk-updated via `/sessions/mark-missed` endpoint

6. **Duplicate Prevention**:
   - Medication collection is prevented based on frequency (daily/weekly/monthly)
   - Logic checks last collected date against frequency rules in `canCollectMedication()` method

### Frontend Implementation

1. **State Management**:

   - Authentication state managed via React Context (`auth-context.tsx`)
   - JWT token stored in localStorage
   - API calls include token in Authorization header automatically

2. **Routing & Protection**:

   - Next.js App Router for page routing
   - Protected routes check authentication status
   - Role-based UI rendering (sidebar items filtered by user role)

3. **Data Fetching**:

   - Centralized API service layer (`lib/api.ts`) with error handling
   - Automatic token injection for authenticated requests
   - Loading states and error handling with toast notifications

4. **UI/UX**:

   - Responsive design with Tailwind CSS breakpoints (mobile, tablet, desktop)
   - Sidebar hidden on mobile devices (`hidden md:flex`)
   - Forms use controlled components with React state
   - Charts use Recharts library for data visualization

5. **Data Display**:
   - Tables have horizontal scroll on mobile (`overflow-x-auto`)
   - Dialogs are full-width on mobile (`max-w-full sm:max-w-lg`)
   - Filters stack vertically on mobile (`flex-col sm:flex-row`)

### Assumptions Made

1. **User Roles**: Three roles (Admin, Staff, Guest) with hierarchical permissions

   - Admin: Full CRUD access to all resources
   - Staff: Can manage patients, sessions, prescriptions (read-only for programs/medications)
   - Guest: Read-only access to public information

2. **Patient-Program Relationship**: Many-to-many allows patients to enroll in multiple programs simultaneously

3. **Session Tracking**: Sessions are tracked per patient-program combination, allowing same patient to have different session records for different programs

4. **Medication Collection**: Duplicate prevention based on frequency prevents abuse but allows legitimate refills after the time period

5. **Date Handling**: All dates stored as DATE type in PostgreSQL, time zones assumed to be server-local

6. **Password Security**: Passwords are never returned in API responses (excluded via `@Exclude()` decorator)

## Role-Based Access Control (RBAC) Implementation

### Architecture

The RBAC system uses a combination of guards and decorators:

1. **JWT Authentication Guard** (`JwtAuthGuard`):

   - Extends Passport's `AuthGuard('jwt')`
   - Validates JWT token from `Authorization: Bearer <token>` header
   - Extracts user information from token payload
   - Required for all protected endpoints

2. **Roles Guard** (`RolesGuard`):

   - Reads required roles from `@Roles()` decorator metadata
   - Compares user's role against required roles
   - Returns `true` if user has one of the required roles

3. **Custom Decorators**:
   - `@Roles(...roles)` - Specifies which roles can access an endpoint
   - `@Public()` - Marks endpoint as public (bypasses authentication)

### Role Permissions

#### Admin Role

- ✅ Full access to all resources
- ✅ Create, read, update, delete users, programs, patients, sessions, medications
- ✅ Manage all prescriptions
- ✅ Access all reports and exports

#### Staff Role

- ✅ Read access to programs and medications
- ✅ Create, read, update patients (cannot delete)
- ✅ Create, read, update sessions (cannot delete)
- ✅ Create, read, update, delete prescriptions
- ❌ Cannot manage users, programs, or medications
- ❌ Cannot delete patients or sessions

#### Guest Role

- ✅ Read-only access to programs
- ✅ View dashboard statistics
- ❌ Cannot access patients, sessions, medications, or prescriptions
- ❌ Cannot perform any write operations

### Implementation Example

```typescript
// Controller with role-based access
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)  // Both guards required
export class PatientsController {

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)  // Admin and Staff can access
  findAll() { ... }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)  // Admin and Staff can create
  create() { ... }

  @Delete(':id')
  @Roles(UserRole.ADMIN)  // Only Admin can delete
  remove() { ... }
}
```

### Frontend RBAC

The frontend implements RBAC through:

1. **Route Protection**: Checks authentication before rendering protected pages
2. **UI Filtering**: Sidebar navigation items filtered by user role in `sidebar-nav.tsx`
3. **Conditional Rendering**: Buttons and actions shown/hidden based on user role
4. **API Error Handling**: 403 Forbidden errors handled gracefully with user feedback

## Bonus Features Implemented

The following features go beyond basic requirements:

### 1. Dashboard Analytics & Visualization

- **Real-time Statistics**: Dashboard displays live metrics (total patients, programs, attendance, adherence)
- **Interactive Charts**:
  - Patient adherence distribution (bar chart)
  - Program enrollment trends (bar chart)
  - Session status distribution (pie chart)
  - Weekly trends (line chart with patient and session counts)
- **Chart Library**: Uses Recharts for professional data visualization
- **Dynamic Data**: All charts populated from real backend data

### 2. CSV Export Functionality

- Export patients, programs, sessions, and prescriptions to CSV
- Date range filtering for exports
- Generates properly formatted CSV files for reporting
- Available to Admin and Staff roles

### 3. Advanced Filtering

- **Patient Filters**: Filter by status (active/inactive), program ID, adherence level (high/medium/low)
- **Session Filters**: Filter by program, patient, and status
- **Prescription Filters**: Filter by patient ID and status
- Combined filters for precise data queries

### 4. Duplicate Medication Collection Prevention

- Prevents duplicate medication collection based on frequency
- Rules: Daily (once per day), Weekly (once per week), Monthly (once per month)
- Validates collection dates before allowing new prescriptions
- Business logic in `canCollectMedication()` method

### 5. Automatic Status Management

- **Session Status**: Automatic marking of past sessions as "missed" via `/sessions/mark-missed` endpoint
- **Prescription Status**: Automatic update to "overdue" when `nextDueDate` passes (via `@BeforeUpdate` hook)
- Reduces manual status updates

### 6. Patient Adherence Calculation

- Computed adherence rate based on session attendance
- Formula: `(attended sessions / total sessions) * 100`
- Displayed in patient list with progress bar visualization
- Filterable by adherence level (high: ≥80%, medium: 50-79%, low: <50%)

### 7. Responsive Design

- **Mobile-First**: Fully responsive layout for phones and tablets
- **Adaptive Sidebar**: Hidden on mobile, visible on tablet/desktop
- **Responsive Tables**: Horizontal scroll on mobile devices
- **Flexible Forms**: Stack on mobile, side-by-side on larger screens
- **Mobile Dialogs**: Full-width on mobile, constrained width on desktop

### 8. Dark Mode Support

- Theme provider with light/dark mode toggle
- User preference persisted across sessions
- Smooth transitions between themes

### 9. Comprehensive Search

- Patient search by name, email, or ID
- Program search by name or description
- Medication search by name
- Real-time filtering as user types

### 10. Swagger/OpenAPI Documentation

- Complete API documentation at `/api/docs`
- Interactive API testing interface
- Request/response schema definitions
- Authentication testing support

### 11. Data Validation & Error Handling

- Frontend form validation with visual feedback
- Backend DTO validation with descriptive error messages
- Toast notifications for success/error states
- Graceful error handling throughout the application

### 12. Seed Data Script

- Automated database seeding for development
- Creates sample users, programs, patients, medications
- Easy setup for new developers
- Can be run multiple times (handles existing data)

## Key Features

### Duplicate Medication Collection Prevention

The system prevents duplicate medication collection based on frequency:

- **Daily**: Once per day
- **Weekly**: Once per week
- **Monthly**: Once per month

### Automatic Status Updates

- Past sessions are automatically marked as "missed" if not attended
- Prescriptions past their due date are automatically marked as "overdue"

### Role-Based Access Control (RBAC)

- **Admin**: Full access to all resources
- **Staff**: Can manage assigned patients, sessions, and prescriptions
- **Guest**: Read-only access to public programs

## Development

### Backend Development

```bash
cd backend
npm run start:dev  # Watch mode
npm run build      # Production build
npm test           # Run tests
npm run test:e2e   # E2E tests
npm run test:cov   # Test coverage
```

### Frontend Development

```bash
cd frontend
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production server
npm run lint       # Lint code
```

## Testing

### Backend Testing

```bash
cd backend
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in `.env`
2. Set `synchronize: false` in TypeORM config (use migrations instead)
3. Use strong JWT secrets
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up database connection pooling
7. Use environment variables for all sensitive data

### Frontend Deployment

1. Set `NEXT_PUBLIC_API_URL` to production API URL
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or your preferred platform

## Tech Stack

### Backend

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (passport-jwt)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API

## License

MIT
