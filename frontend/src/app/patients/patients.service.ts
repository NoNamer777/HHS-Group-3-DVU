import { type CreatePatientData, Patient } from '@/models';
import { nanoid } from 'nanoid';
import { delay, parse, parseAll } from '../shared';
import { patients } from './data.ts';

export class PatientsService {
    public async getAll() {
        await delay(200);
        return parseAll<Patient>(Patient, patients);
    }

    public async create(data: CreatePatientData) {
        const patient = parse<Patient>(Patient, data);

        patient.lastUpdated = new Date().getTime();
        patient.id = nanoid();

        patients.push(patient);
        await delay(200);

        return patient;
    }
}

export const patientsService = new PatientsService();
