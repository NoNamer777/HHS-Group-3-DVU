import { nanoid } from 'nanoid';
import { delay, parse, parseAll } from '../shared';
import { patients } from './data.ts';
import { type CreatePatientData, Patient } from './models.ts';

export class PatientsService {
    public static instance() {
        if (this._instance) return this._instance;
        this._instance = new PatientsService();

        return this._instance;
    }
    private static _instance: PatientsService;

    public async getAll() {
        await delay(200);
        return parseAll<Patient>(Patient, patients);
    }

    public async create(data: CreatePatientData) {
        const patient = parse<Patient>(Patient, data);

        patient.lastUpdated = new Date();
        patient.id = nanoid();

        patients.push(patient);
        await delay(200);

        return patient;
    }
}
