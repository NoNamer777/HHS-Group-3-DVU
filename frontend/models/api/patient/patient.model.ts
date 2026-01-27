import type { User } from '../../auth';
import type { Gender } from './gender.enum';
import type { PatientStatus } from './patient-status.enum';

export interface Patient extends User {
    gender: Gender;
    condition: string;
    status: PatientStatus;

    /**
     * Timestamp in ms since the epoch.
     */
    dateOfBirth: string; // Date;

    /**
     * Timestamp in ms since the epoch.
     */
    lastUpdated: string; // Date;
}

export type CreatePatientData = Omit<Patient, 'id' | 'lastUpdated' | 'email' | 'password' | 'role'>;
