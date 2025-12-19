import { nanoid } from 'nanoid';
import { type Gender, Genders } from './gender.ts';
import { type PatientStatus, PatientStatuses } from './patient-status.ts';

export class Patient {
    public readonly id = nanoid();

    public name: string;

    public dateOfBirth: number;

    public gender: Gender = Genders.MALE;

    public condition: string;

    public status: PatientStatus = PatientStatuses.STABLE;

    public lastUpdated = new Date().getTime();

    public constructor(id?: string) {
        if (id) this.id = id;
    }
}

export type CreatePatientData = Exclude<Patient, 'id' | 'lastUpdated'>;
