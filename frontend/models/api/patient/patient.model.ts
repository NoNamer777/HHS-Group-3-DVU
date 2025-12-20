import type { User } from '../../auth';
import { type Gender } from './gender.ts';
import { type PatientStatus } from './patient-status.ts';

export interface Patient extends User {
    gender: Gender;
    condition: string;
    status: PatientStatus;

    /**
     * Timestamp in ms since the epoch.
     */
    dateOfBirth: number; // Date;

    /**
     * Timestamp in ms since the epoch.
     */
    lastUpdated: number; // Date;
}

export type CreatePatientData = Omit<Patient, 'id' | 'lastUpdated'>;
