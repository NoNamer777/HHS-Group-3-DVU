import type { LabResult } from '@/models';
import type { Records } from '../../types';

class MockLabResultsDB {
    private records: Records<LabResult> = {};

    public getAll() {
        return Object.values(this.records);
    }

    public reset() {
        this.records = {};
    }
}

export const mockLabResultsDB = new MockLabResultsDB();
