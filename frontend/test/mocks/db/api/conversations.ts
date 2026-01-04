import type { Conversation, CreateConversationData } from '@/models';
import { nanoid } from 'nanoid';
import { defaultConversations } from '../../data';
import type { Records } from '../../types';

class MockConversationsDB {
    private records: Records<Conversation> = {};

    public getAll() {
        return Object.values(this.records);
    }

    public create(data: CreateConversationData) {
        const conversation: Conversation = {
            id: nanoid(),
            message: data.message,
            from: data.from,
            to: data.to,
            timestamp: new Date().getTime(),
        };
        this.records[conversation.id] = conversation;
        return conversation;
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
