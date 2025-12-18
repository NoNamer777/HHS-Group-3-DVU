export const Genders = {
    MALE: 'Man',
    FEMALE: 'Vrouw',
    OTHER: 'Anders',
} as const;

export type Gender = (typeof Genders)[keyof typeof Genders];

export const DiabetesTypes = {
    TYPE_1: 'Type 1',
    TYPE_2: 'Type 2',
    GESTATIONAL: 'Zwangerschap',
    OTHER: 'Anders',
} as const;

export type DiabetesType = (typeof DiabetesTypes)[keyof typeof DiabetesTypes];

export const PatientStatuses = {
    STABLE: 'Stabiel',
    MONITORING: 'Monitoren',
    CRITICAL: 'Kritiek',
} as const;

export type PatientStatus =
    (typeof PatientStatuses)[keyof typeof PatientStatuses];

export class Patient {
    id: string;
    name: string;
    dateOfBirth: Date;
    gender: Gender;
    diabetesType: DiabetesType;
    status: PatientStatus;
    lastUpdated: Date;
}
