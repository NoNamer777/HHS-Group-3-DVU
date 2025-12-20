import { mockPatientsDB } from './api/patients.ts';

export function resetMockDatabases() {
    mockPatientsDB.reset();
}
