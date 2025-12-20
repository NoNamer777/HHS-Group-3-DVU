import type { Doctor } from '@/models';
import type { Records } from '../../types';

class MockDoctorsDB {
    private records: Records<Doctor> = {};

    public getAll() {
        return Object.values(this.records);
    }

    public getById(doctorId: string) {
        return this.records[doctorId];
    }

    public reset() {
        this.records = {};
    }
}

export const mockDoctorsDB = new MockDoctorsDB();
