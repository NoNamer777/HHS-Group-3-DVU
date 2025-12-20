import type { Doctor } from '@/models';
import type { Records } from '../../types.ts';

class MockDoctorsDB {
    private records: Records<Doctor> = {};

    public getAll() {
        return Object.values(this.records);
    }

    public reset() {
        this.records = {};
    }
}

export const mockDoctorsDB = new MockDoctorsDB();
