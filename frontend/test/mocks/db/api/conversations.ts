import type { Conversation } from '@/models';
import type { Records } from '../../types.ts';

class MockConversationsDB {
    private records: Records<Conversation> = {};

    public getAll() {
        return Object.values(this.records);
    }

    public reset() {
        this.records = {};
    }
}

export const mockConversationsDB = new MockConversationsDB();
