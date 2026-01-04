import { mockConversationsDB, mockDoctorsDB, mockLabResultsDB, mockPatientsDB } from './api';
import { mockUsersDB } from './auth';

export function resetMockDatabases() {
    mockUsersDB.reset();

    mockDoctorsDB.reset();
    mockConversationsDB.reset();
    mockLabResultsDB.reset();
    mockPatientsDB.reset();
}
