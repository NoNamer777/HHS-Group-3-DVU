import { delay, parseAll } from '../shared';
import { patients } from './data.ts';
import { Patient } from './models.ts';

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
}
