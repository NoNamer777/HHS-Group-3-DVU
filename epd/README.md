# EPD Backend API

Mock Electronic Patient Record (EPD) backend API built with Express, TypeScript, Prisma, and PostgreSQL.

## Docker Setup (Recommended)

The easiest way to get started is with Docker. This ensures everyone has the same database setup.

### First-time setup:

```powershell
.\start.ps1
```

This script:
- Builds Docker containers (PostgreSQL + backend)
- Installs dependencies
- Runs database migrations
- Seeds the database with test data
- Starts the backend server

### Starting the stack:

```powershell
.\start.ps1
```

### Stopping the stack:

```powershell
docker-compose down
```

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (DOCTOR, NURSE, ASSISTANT, ADMIN)
- **Patient Management**: Full CRUD for patients with search and filtering functionality
- **Encounters**: Management of outpatient, inpatient, and emergency encounters
- **Medical Records**: Notes, consultations, reports, and procedures
- **Diagnoses**: Primary and secondary diagnoses with ICD codes
- **Medications**: Medication prescriptions with status tracking
- **Allergies**: Registration of allergies and reactions
- **Vital Signs**: Blood pressure, heart rate, temperature, etc.
- **Lab Results**: Laboratory test results with validation
- **Appointments**: Appointment management for patients
- **Insurance**: Insurers and insurance policies

## Requirements

- Docker Desktop
- Node.js (v18 or higher)
- npm or yarn
- PowerShell (Windows)

## Quick Start

**Use the Docker setup (see above) - this is the easiest way!**

## Services

When the stack is running:

- **API**: http://localhost:3001
- **API Documentation (Swagger)**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health  
- **PostgreSQL**: localhost:5432
- **Database UI**: `npx prisma studio`

## Manual Installation (without Docker)

If you want to work without Docker:

1. **Install PostgreSQL locally**
2. **Update .env with your database URL**
3. **Install dependencies:**
   ```powershell
   npm install
   ```
4. **Generate Prisma Client & migrate:**
   ```powershell
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```
5. **Start backend:**
   ```powershell
   npm run dev
   ```

## Test Accounts

After seeding, the following accounts are available:

| Rol | Email | Password |
|-----|-------|----------|
| Doctor | jan.devries@ziekenhuis.nl | password123 |
| Nurse | maria.jansen@ziekenhuis.nl | password123 |
| Assistant | pieter.bakker@ziekenhuis.nl | password123 |
| Admin | admin@ziekenhuis.nl | password123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get own profile (authenticated)

### Users
- `GET /api/users` - All users (ADMIN, DOCTOR)
- `GET /api/users/:id` - User details

### Patients
- `GET /api/patients` - All patients (with pagination, search, filtering)
- `GET /api/patients/:id` - Patient details
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Encounters
- `GET /api/encounters` - All encounters (filter: patientId, status, type)
- `GET /api/encounters/:id` - Encounter details
- `POST /api/encounters` - Create new encounter
- `PUT /api/encounters/:id` - Update encounter
- `DELETE /api/encounters/:id` - Delete encounter

### Medical Records
- `GET /api/medical-records` - All records (filter: patientId, encounterId)
- `GET /api/medical-records/:id` - Record details
- `POST /api/medical-records` - Create new record
- `PUT /api/medical-records/:id` - Update record
- `DELETE /api/medical-records/:id` - Delete record

### Diagnoses
- `GET /api/diagnoses` - All diagnoses (filter: patientId)
- `POST /api/diagnoses` - Create new diagnosis

### Medications
- `GET /api/medications` - All medications (filter: patientId)
- `POST /api/medications` - Create new medication

### Allergies
- `GET /api/allergies` - All allergies (filter: patientId)
- `POST /api/allergies` - Create new allergy

### Vital Signs
- `GET /api/vitals` - All vital signs (filter: patientId)
- `POST /api/vitals` - Create new measurement

### Lab Results
- `GET /api/lab-results` - All lab results (filter: patientId)
- `POST /api/lab-results` - Create new lab result

### Appointments
- `GET /api/appointments` - All appointments (filter: patientId)
- `POST /api/appointments` - Create new appointment

### Insurance
- `GET /api/insurance/insurers` - All insurers
- `GET /api/insurance/policies` - All policies (filter: patientId)
- `POST /api/insurance/insurers` - Create new insurer
- `POST /api/insurance/policies` - Create new policy

## 🔒 Authentication

All API endpoints (except `/auth/register` and `/auth/login`) require authentication.

### Login voorbeeld:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jan.devries@ziekenhuis.nl",
    "password": "password123"
  }'
```

Response:
```json
{
  "message": "Logged in",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "Jan",
    "lastName": "de Vries",
    "email": "jan.devries@ziekenhuis.nl",
    "role": "DOCTOR"
  }
}
```

### Authenticated request example:

```bash
curl http://localhost:3001/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Database Schema

The database contains the following models:
- User (with roles: DOCTOR, NURSE, ASSISTANT, ADMIN)
- Patient (with demographic data)
- Encounter (types: INPATIENT, OUTPATIENT, EMERGENCY)
- MedicalRecord (notes, consultations, reports)
- Diagnosis (with ICD codes)
- MedicationOrder
- Allergy
- VitalSign
- LabResult
- Appointment
- Insurer & InsurancePolicy

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Containerization**: Docker & Docker Compose
- **Validation**: TypeScript types + Prisma

## 📝 Development

### Database changes:

1. Modify `prisma/schema.prisma`
2. Create migration: `npm run prisma:migrate`
3. Generate client: `npm run prisma:generate`

### Adding new endpoints:

1. Create service in `backend/src/services/`
2. Create controller in `backend/src/controllers/`
3. Create routes in `backend/src/routes/`
4. Register routes in `backend/src/index.ts`

## 📄 License

ISC
