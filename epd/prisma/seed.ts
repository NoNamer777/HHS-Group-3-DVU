import { PrismaClient, UserRole, Sex, PatientStatus, EncounterType, EncounterStatus, MedicalRecordType, DiagnosisType, MedicationStatus, VitalType, AppointmentStatus, InsuranceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.appointment.deleteMany();
  await prisma.insurancePolicy.deleteMany();
  await prisma.insurer.deleteMany();
  await prisma.labResult.deleteMany();
  await prisma.vitalSign.deleteMany();
  await prisma.allergy.deleteMany();
  await prisma.medicationOrder.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const doctor = await prisma.user.create({
    data: {
      firstName: 'Jan',
      lastName: 'de Vries',
      email: 'jan.devries@ziekenhuis.nl',
      password: hashedPassword,
      role: UserRole.DOCTOR
    }
  });

  const nurse = await prisma.user.create({
    data: {
      firstName: 'Maria',
      lastName: 'Jansen',
      email: 'maria.jansen@ziekenhuis.nl',
      password: hashedPassword,
      role: UserRole.NURSE
    }
  });

  const assistant = await prisma.user.create({
    data: {
      firstName: 'Pieter',
      lastName: 'Bakker',
      email: 'pieter.bakker@ziekenhuis.nl',
      password: hashedPassword,
      role: UserRole.ASSISTANT
    }
  });

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ziekenhuis.nl',
      password: hashedPassword,
      role: UserRole.ADMIN
    }
  });

  console.log('✅ Users created');

  // Create Insurers
  const cz = await prisma.insurer.create({
    data: {
      name: 'CZ Zorgverzekeringen',
      code: 'CZ001',
      phone: '088-123-4567',
      email: 'info@cz.nl',
      website: 'https://www.cz.nl'
    }
  });

  const vgz = await prisma.insurer.create({
    data: {
      name: 'VGZ',
      code: 'VGZ001',
      phone: '088-765-4321',
      email: 'info@vgz.nl',
      website: 'https://www.vgz.nl'
    }
  });

  console.log('✅ Insurers created');

  // Create Patients
  const patient1 = await prisma.patient.create({
    data: {
      hospitalNumber: 'P2024001',
      firstName: 'Anna',
      lastName: 'Smit',
      dateOfBirth: new Date('1985-03-15'),
      sex: Sex.FEMALE,
      phone: '06-12345678',
      email: 'anna.smit@email.nl',
      addressLine1: 'Hoofdstraat 123',
      city: 'Amsterdam',
      postalCode: '1011 AB',
      status: PatientStatus.ACTIVE,
      createdById: doctor.id
    }
  });

  const patient2 = await prisma.patient.create({
    data: {
      hospitalNumber: 'P2024002',
      firstName: 'Henk',
      lastName: 'de Jong',
      dateOfBirth: new Date('1972-08-22'),
      sex: Sex.MALE,
      phone: '06-87654321',
      email: 'henk.dejong@email.nl',
      addressLine1: 'Kerkstraat 45',
      city: 'Rotterdam',
      postalCode: '3011 CD',
      status: PatientStatus.ACTIVE,
      createdById: doctor.id
    }
  });

  const patient3 = await prisma.patient.create({
    data: {
      hospitalNumber: 'P2024003',
      firstName: 'Sophie',
      lastName: 'van Dijk',
      dateOfBirth: new Date('1990-11-10'),
      sex: Sex.FEMALE,
      phone: '06-11223344',
      email: 'sophie.vandijk@email.nl',
      addressLine1: 'Laan 78',
      city: 'Utrecht',
      postalCode: '3511 EF',
      status: PatientStatus.ACTIVE,
      createdById: nurse.id
    }
  });

  console.log('✅ Patients created');

  // Create Insurance Policies
  await prisma.insurancePolicy.create({
    data: {
      policyNumber: 'POL-2024-001',
      status: InsuranceStatus.ACTIVE,
      startDate: new Date('2024-01-01'),
      patientId: patient1.id,
      insurerId: cz.id
    }
  });

  await prisma.insurancePolicy.create({
    data: {
      policyNumber: 'POL-2024-002',
      status: InsuranceStatus.ACTIVE,
      startDate: new Date('2024-01-01'),
      patientId: patient2.id,
      insurerId: vgz.id
    }
  });

  console.log('✅ Insurance policies created');

  // Create Allergies
  await prisma.allergy.create({
    data: {
      substance: 'Penicilline',
      reaction: 'Huiduitslag',
      severity: 'Matig',
      patientId: patient1.id
    }
  });

  await prisma.allergy.create({
    data: {
      substance: 'Noten',
      reaction: 'Anafylaxie',
      severity: 'Ernstig',
      patientId: patient2.id
    }
  });

  console.log('✅ Allergies created');

  // Create Encounter for Patient 1
  const encounter1 = await prisma.encounter.create({
    data: {
      type: EncounterType.OUTPATIENT,
      status: EncounterStatus.COMPLETED,
      reason: 'Controle diabetes',
      location: 'Polikliniek A',
      start: new Date('2024-11-01T09:00:00'),
      end: new Date('2024-11-01T09:30:00'),
      patientId: patient1.id,
      createdById: doctor.id
    }
  });

  // Create Medical Records
  await prisma.medicalRecord.create({
    data: {
      type: MedicalRecordType.CONSULTATION,
      title: 'Diabetes checkup',
      content: 'Patient comes for regular diabetes mellitus type 2 checkup. Blood sugar levels well regulated. HbA1c: 6.8%. No complaints. Continue medication.',
      patientId: patient1.id,
      encounterId: encounter1.id,
      authorId: doctor.id
    }
  });

  // Create Diagnosis
  await prisma.diagnosis.create({
    data: {
      code: 'E11',
      description: 'Diabetes Mellitus Type 2',
      type: DiagnosisType.PRIMARY,
      onset: new Date('2020-05-15'),
      patientId: patient1.id,
      encounterId: encounter1.id,
      authorId: doctor.id
    }
  });

  // Create Medication Orders
  await prisma.medicationOrder.create({
    data: {
      medicationName: 'Metformine',
      dose: '850mg',
      route: 'Oraal',
      frequency: '2x daags',
      startDate: new Date('2020-05-15'),
      status: MedicationStatus.ACTIVE,
      patientId: patient1.id,
      encounterId: encounter1.id,
      prescriberId: doctor.id
    }
  });

  console.log('✅ Encounter 1 with records created');

  // Create Encounter for Patient 2
  const encounter2 = await prisma.encounter.create({
    data: {
      type: EncounterType.EMERGENCY,
      status: EncounterStatus.COMPLETED,
      reason: 'Pijn op de borst',
      location: 'Spoedeisende Hulp',
      start: new Date('2024-11-15T14:30:00'),
      end: new Date('2024-11-15T18:00:00'),
      patientId: patient2.id,
      createdById: doctor.id
    }
  });

  await prisma.medicalRecord.create({
    data: {
      type: MedicalRecordType.NOTE,
      title: 'ER admission',
      content: 'Patient presents with acute chest pain. ECG: no abnormalities. Troponin negative. Diagnosis: musculoskeletal pain. Pain medication given and discharged.',
      patientId: patient2.id,
      encounterId: encounter2.id,
      authorId: doctor.id
    }
  });

  await prisma.diagnosis.create({
    data: {
      code: 'M79.1',
      description: 'Musculoskeletale pijn',
      type: DiagnosisType.PRIMARY,
      onset: new Date('2024-11-15'),
      resolved: new Date('2024-11-15'),
      patientId: patient2.id,
      encounterId: encounter2.id,
      authorId: doctor.id
    }
  });

  console.log('✅ Encounter 2 with records created');

  // Create Vital Signs
  await prisma.vitalSign.create({
    data: {
      type: VitalType.BLOOD_PRESSURE,
      value: '120/80',
      unit: 'mmHg',
      patientId: patient1.id,
      measuredAt: new Date('2024-11-01T09:00:00')
    }
  });

  await prisma.vitalSign.create({
    data: {
      type: VitalType.HEART_RATE,
      value: '72',
      unit: 'bpm',
      patientId: patient1.id,
      measuredAt: new Date('2024-11-01T09:00:00')
    }
  });

  await prisma.vitalSign.create({
    data: {
      type: VitalType.TEMPERATURE,
      value: '36.8',
      unit: '°C',
      patientId: patient2.id,
      measuredAt: new Date('2024-11-15T14:30:00')
    }
  });

  console.log('✅ Vital signs created');

  // Create Lab Results
  await prisma.labResult.create({
    data: {
      testName: 'HbA1c',
      value: '6.8',
      unit: '%',
      referenceRange: '< 7.0%',
      status: 'FINAL',
      takenAt: new Date('2024-11-01T09:00:00'),
      patientId: patient1.id,
      encounterId: encounter1.id,
      validatorId: doctor.id
    }
  });

  await prisma.labResult.create({
    data: {
      testName: 'Troponine',
      value: '0.02',
      unit: 'ng/mL',
      referenceRange: '< 0.04',
      status: 'FINAL',
      takenAt: new Date('2024-11-15T14:45:00'),
      patientId: patient2.id,
      encounterId: encounter2.id,
      validatorId: doctor.id
    }
  });

  console.log('✅ Lab results created');

  // Create Appointments
  await prisma.appointment.create({
    data: {
      start: new Date('2024-12-15T10:00:00'),
      end: new Date('2024-12-15T10:30:00'),
      location: 'Polikliniek A',
      reason: 'Controle diabetes',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient1.id,
      clinicianId: doctor.id
    }
  });

  await prisma.appointment.create({
    data: {
      start: new Date('2024-12-20T14:00:00'),
      end: new Date('2024-12-20T14:30:00'),
      location: 'Polikliniek B',
      reason: 'Nacontrole',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient2.id,
      clinicianId: doctor.id
    }
  });

  await prisma.appointment.create({
    data: {
      start: new Date('2024-12-10T09:00:00'),
      end: new Date('2024-12-10T09:30:00'),
      location: 'Polikliniek C',
      reason: 'Intake',
      status: AppointmentStatus.SCHEDULED,
      patientId: patient3.id,
      clinicianId: nurse.id
    }
  });

  console.log('✅ Appointments created');

  console.log('\n🎉 Seeding completed!');
  console.log('\n📋 Test accounts:');
  console.log('Doctor:    jan.devries@ziekenhuis.nl / password123');
  console.log('Nurse:     maria.jansen@ziekenhuis.nl / password123');
  console.log('Assistant: pieter.bakker@ziekenhuis.nl / password123');
  console.log('Admin:     admin@ziekenhuis.nl / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
