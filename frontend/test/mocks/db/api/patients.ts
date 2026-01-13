import { type CreatePatientData, type Patient } from '@/models';
import { nanoid } from 'nanoid';
import { defaultPatients } from '../../data';
import type { Records } from '../../types';

class MockPatientsDB {
    private records: Records<Patient> = {};

    public getAll(searchParams: URLSearchParams) {
        const users = Object.values(this.records);

        if (searchParams.has('name')) {
            return users.filter((user) => user.name.toLowerCase().includes(searchParams.get('name').toLowerCase()));
        }
        return users;
    }

    public getById(patientId: string) {
        return this.records[patientId] ?? null;
    }

    public create(data: CreatePatientData) {
        const patient: Patient = {
            ...data,
            id: nanoid(),
            lastUpdated: new Date().getTime(),
        };
        this.records[patient.id] = patient;

        return patient;
    }

    public update(patient: Patient) {
        if (!this.records[patient.id]) return null;

        patient.lastUpdated = new Date().getTime();
        this.records[patient.id] = patient;

        return patient;
    }

    public remove(patientId: string) {
        if (!this.records[patientId]) return false;
        delete this.records[patientId];

        return true;
    }

    public reset() {
        this.records = [...defaultPatients].reduce((records, patient) => {
            records[patient.id] = patient;
            return records;
        }, {} as Records<Patient>);
    }
}

export const mockPatientsDB = new MockPatientsDB();
