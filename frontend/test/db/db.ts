import { mockDoctorsDB, mockPatientsDB } from './api';
import { mockUsersDB } from './auth';

export function resetMockDatabases() {
    mockUsersDB.reset();

    mockPatientsDB.reset();
    mockDoctorsDB.reset();
}
