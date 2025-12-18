import {
    DiabetesTypes,
    Genders,
    type Patient,
    PatientStatuses,
} from './models.ts';

export const patients: Patient[] = [
    {
        id: 'P001',
        name: 'Alice Smith',
        dateOfBirth: new Date('1985-03-15'),
        gender: Genders.FEMALE,
        diabetesType: DiabetesTypes.TYPE_2,
        lastUpdated: new Date('2025-12-17T10:30:00Z'),
        status: PatientStatuses.STABLE,
    },
    {
        id: 'P002',
        name: 'Bob Johnson',
        dateOfBirth: new Date('1970-11-22'),
        gender: Genders.MALE,
        diabetesType: DiabetesTypes.TYPE_1,
        lastUpdated: new Date('2025-12-18T08:15:00Z'),
        status: PatientStatuses.MONITORING,
    },
    {
        id: 'P003',
        name: 'Charlie Brown',
        dateOfBirth: new Date('1992-07-01'),
        gender: Genders.MALE,
        diabetesType: DiabetesTypes.TYPE_2,
        lastUpdated: new Date('2025-12-18T14:00:00Z'),
        status: PatientStatuses.CRITICAL,
    },
    {
        id: 'P004',
        name: 'Diana Prince',
        dateOfBirth: new Date('1960-01-01'),
        gender: Genders.FEMALE,
        diabetesType: DiabetesTypes.GESTATIONAL,
        lastUpdated: new Date('2025-12-16T16:45:00Z'),
        status: PatientStatuses.STABLE,
    },
    {
        id: 'P005',
        name: 'Eve Adams',
        dateOfBirth: new Date('2000-05-10'),
        gender: Genders.FEMALE,
        diabetesType: DiabetesTypes.TYPE_1,
        lastUpdated: new Date('2025-12-18T11:00:00Z'),
        status: PatientStatuses.MONITORING,
    },
];
