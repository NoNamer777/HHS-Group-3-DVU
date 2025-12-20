import type { Records } from '../../types.ts';
import type { LabResult } from '@/models';

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
