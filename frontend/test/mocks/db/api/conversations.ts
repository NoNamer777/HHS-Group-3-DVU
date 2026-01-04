import type { Conversation, CreateConversationData } from '@/models';
import { nanoid } from 'nanoid';
import { defaultConversations } from '../../data';
import type { Records } from '../../types';

class MockConversationsDB {
    private records: Records<Conversation> = {};

    public getAll(params: URLSearchParams) {
        let conversations = Object.values(this.records);

        if (params.has('to')) {
            conversations = conversations.filter(
                ({ to }) => to.id === params.get('to'),
            );
        }
        if (params.has('limit')) {
            conversations = conversations.slice(
                0,
                Number.parseInt(params.get('limit')) - 1,
            );
        }
        return conversations.sort(
            (curr, next) => next.timestamp - curr.timestamp,
        );
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
