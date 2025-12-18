export const Genders = {
    MALE: 'Man',
    FEMALE: 'Vrouw',
    OTHER: 'Anders',
} as const;

export type Gender = (typeof Genders)[keyof typeof Genders];

export function genderAttribute(value: unknown) {
    return (
        Object.values(Genders).find((gender) => gender === value) ??
        Genders.MALE
    );
}

export const GENDER_OPTIONS = [
    { value: Genders.MALE, label: 'Man' },
    { value: Genders.FEMALE, label: 'Vrouw' },
    { value: Genders.OTHER, label: 'Anders' },
] as const;

export const DiabetesTypes = {
    TYPE_1: 'Type 1',
    TYPE_2: 'Type 2',
    GESTATIONAL: 'Zwangerschap',
    OTHER: 'Anders',
} as const;

export const PatientStatuses = {
    STABLE: 'Stabiel',
    MONITORING: 'Monitoren',
    CRITICAL: 'Kritiek',
} as const;

export type PatientStatus =
    (typeof PatientStatuses)[keyof typeof PatientStatuses];

export function patientStatusAttribute(value: unknown) {
    return (
        Object.values(PatientStatuses).find((status) => value === status) ??
        PatientStatuses.STABLE
    );
}

export const PATIENT_STATUS_OPTIONS = [
    { value: PatientStatuses.STABLE, label: 'Stabiel' },
    { value: PatientStatuses.MONITORING, label: 'Monitoring' },
    { value: PatientStatuses.CRITICAL, label: 'Kritiek' },
] as const;

export class Patient {
    id: string;
    name: string;
    dateOfBirth: number;
    gender: Gender;
    condition: string;
    status: PatientStatus;
    lastUpdated: number;
}

export type CreatePatientData = Exclude<Patient, 'id' | 'lastUpdated'>;
