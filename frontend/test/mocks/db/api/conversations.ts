import type { Conversation } from '@/models';
import { defaultConversations } from '../../data';
import type { Records } from '../../types';

class MockConversationsDB {
    private records: Records<Conversation> = {};

    public getAll() {
        return Object.values(this.records);
    }

    public reset() {
        this.records = [...defaultConversations].reduce(
            (records, conversation) => {
                records[conversation.id] = conversation;
                return records;
            },
            {} as Records<Conversation>,
        );
    }
}

export const mockConversationsDB = new MockConversationsDB();
