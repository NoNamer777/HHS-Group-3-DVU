import type { User } from '@/models';
import type { Records } from '../../types';

class MockUsersDB {
    private records: Records<User> = {};

    public getAll() {
        return Object.values(this.records);
    }

    public reset() {
        this.records = {};
    }
}

export const mockUsersDB = new MockUsersDB();
