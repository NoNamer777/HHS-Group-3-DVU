import { type Gender } from './gender.ts';
import { type PatientStatus } from './patient-status.ts';

export interface Patient {
    id: string;
    name: string;
    dateOfBirth: number;
    gender: Gender;
    condition: string;
    status: PatientStatus;
    lastUpdated: number;
}

export type CreatePatientData = Exclude<Patient, 'id' | 'lastUpdated'>;
