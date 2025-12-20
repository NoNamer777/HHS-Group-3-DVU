import { mockDoctorsDB, mockPatientsDB } from './api';

export function resetMockDatabases() {
    mockPatientsDB.reset();
    mockDoctorsDB.reset();
}
