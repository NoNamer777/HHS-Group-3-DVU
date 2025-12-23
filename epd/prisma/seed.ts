import { PrismaClient, UserRole, Sex, PatientStatus, EncounterType, EncounterStatus, MedicalRecordType, DiagnosisType, MedicationStatus, VitalType, AppointmentStatus, InsuranceStatus, LabResultStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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
  // Note: Password not used anymore since we use Auth0 for authentication
  const doctor = await prisma.user.create({
    data: {
      firstName: 'Jan',
      lastName: 'de Vries',
      email: 'jan.devries@ziekenhuis.nl',
      password: 'not-used-with-auth0',
      role: UserRole.DOCTOR
    }
  });

  const nurse = await prisma.user.create({
    data: {
      firstName: 'Maria',
      lastName: 'Jansen',
      email: 'maria.jansen@ziekenhuis.nl',
      password: 'not-used-with-auth0',
      role: UserRole.NURSE
    }
  });

  const assistant = await prisma.user.create({
    data: {
      firstName: 'Pieter',
      lastName: 'Bakker',
      email: 'pieter.bakker@ziekenhuis.nl',
      password: 'not-used-with-auth0',
      role: UserRole.ASSISTANT
    }
  });

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ziekenhuis.nl',
      password: 'not-used-with-auth0',
      role: UserRole.ADMIN
    }
  });

  console.log('Users created');

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

  console.log('Insurers created');

  // Create Patients
  const firstNames: string[] = ['Anna', 'Henk', 'Sophie', 'Jan', 'Maria', 'Peter', 'Lisa', 'Tom', 'Emma', 'Lars', 
    'Sara', 'Mark', 'Julia', 'Tim', 'Nina', 'Paul', 'Laura', 'Bas', 'Eva', 'Daan',
    'Lotte', 'Sven', 'Isa', 'Ruben', 'Fleur', 'Max', 'Anne', 'Jesse', 'Mila', 'Lucas',
    'Zoey', 'Finn', 'Noa', 'Sem', 'Lina', 'Luuk', 'Tess', 'Thijs', 'Fenna', 'Bram',
    'Liv', 'Sam', 'Evi', 'Stijn', 'Iris', 'Joep', 'Roos', 'Gijs', 'Luna', 'Milan',
    'Sophie', 'Nick', 'Lynn', 'Jayden', 'Lieke', 'Dex', 'Saar', 'Robin', 'Fay', 'Koen'];
  
  const lastNames: string[] = ['Smit', 'de Jong', 'van Dijk', 'Bakker', 'Jansen', 'Visser', 'van den Berg', 'Peters', 
    'Hendriks', 'de Vries', 'van Leeuwen', 'Mulder', 'Vermeulen', 'de Boer', 'Willems',
    'Koning', 'van der Meer', 'Schouten', 'Meijer', 'van Dam', 'Brouwer', 'Jacobs', 'de Groot',
    'Hoekstra', 'van Veen', 'Maas', 'de Wit', 'Vos', 'Dekker', 'Kok', 'de Graaf'];

  const cities: string[] = ['Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Tilburg', 
    'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Enschede', 'Apeldoorn', 'Haarlem', 
    'Arnhem', 'Amersfoort', 'Zaanstad', 'Haarlemmermeer', 's-Hertogenbosch', 'Zoetermeer', 'Zwolle'];

  const streets: string[] = ['Hoofdstraat', 'Kerkstraat', 'Laan', 'Markt', 'Dorpsstraat', 'Schoolstraat', 
    'Stationsweg', 'Parkweg', 'Molenstraat', 'Beatrixlaan'];

  const patients: any[] = [];
  
  for (let i = 0; i < 60; i++) {
    const patient = await prisma.patient.create({
      data: {
        hospitalNumber: `P2024${String(i + 1).padStart(3, '0')}`,
        firstName: firstNames[i % firstNames.length]!,
        lastName: lastNames[Math.floor(i / 2) % lastNames.length]!,
        dateOfBirth: new Date(1950 + (i % 50), (i % 12), (i % 28) + 1),
        sex: i % 3 === 0 ? Sex.MALE : i % 3 === 1 ? Sex.FEMALE : Sex.OTHER,
        phone: `06-${String(12345678 + i).slice(0, 8)}`,
        email: `patient${i + 1}@email.nl`,
        addressLine1: `${streets[i % streets.length]} ${(i % 200) + 1}`,
        city: cities[i % cities.length]!,
        postalCode: `${1000 + (i % 9000)} ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i * 2) % 26))}`,
        status: i % 15 === 0 ? PatientStatus.DISCHARGED : PatientStatus.ACTIVE,
        createdById: i % 3 === 0 ? doctor.id : i % 3 === 1 ? nurse.id : assistant.id
      }
    });
    patients.push(patient);
  }

  const patient1 = patients[0]!;
  const patient2 = patients[1]!;
  const patient3 = patients[2]!;

  console.log(`${patients.length} Patients created`);

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

  console.log('Insurance policies created');

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

  console.log('Allergies created');

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

  console.log('Encounter 1 with records created');

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

  console.log('Encounter 2 with records created');

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

  console.log('Vital signs created');

  // Create Lab Results
  await prisma.labResult.create({
    data: {
      testName: 'HbA1c',
      value: '6.8',
      unit: '%',
      referenceRange: '< 7.0%',
      status: LabResultStatus.FINAL,
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
      status: LabResultStatus.FINAL,
      takenAt: new Date('2024-11-15T14:45:00'),
      patientId: patient2.id,
      encounterId: encounter2.id,
      validatorId: doctor.id
    }
  });

  console.log('Lab results created');

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

  console.log('Appointments created');

  console.log('\nSeeding completed!');
  console.log('\nTest accounts:');
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
