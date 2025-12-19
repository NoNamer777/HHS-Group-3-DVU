import { mockPatientsDB } from './patients.ts';

export function resetMockDatabases() {
    mockPatientsDB.reset();
}
