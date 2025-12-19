import { type CreatePatientData, Patient } from '@/models';
import { parse, parseAll } from '@/utils';
import { apiService } from '../shared';

export class PatientsService {
    private readonly endPoint = '/patients';

    public async getAll() {
        const response = await apiService.get(this.endPoint);
        return parseAll<Patient>(Patient, await response.json());
    }

    public async create(data: CreatePatientData) {
        const response = await apiService.post(this.endPoint, data);
        return parse<Patient>(Patient, await response.json());
    }

    public async getById(patientId: string) {
        const response = await apiService.get(
            this.buildPatientEndPoint(patientId),
        );
        return parse<Patient>(Patient, await response.json());
    }

    public async update(data: Patient) {
        const response = await apiService.put(
            this.buildPatientEndPoint(data.id),
            data,
        );
        return parse<Patient>(Patient, await response.json());
    }

    public async remove(patientId: string) {
        await apiService.delete(this.buildPatientEndPoint(patientId));
    }

    private buildPatientEndPoint(patientId: string) {
        return `${this.endPoint}${patientId}`;
    }
}

export const patientsService = new PatientsService();
