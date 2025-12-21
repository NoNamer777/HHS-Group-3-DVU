import type { Doctor } from '@/models';
import { defaultDoctors } from '../../data';
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
        this.records = [...defaultDoctors].reduce((records, doctor) => {
            records[doctor.id] = doctor;
            return records;
        }, {} as Records<Doctor>);
    }
}

export const mockDoctorsDB = new MockDoctorsDB();
