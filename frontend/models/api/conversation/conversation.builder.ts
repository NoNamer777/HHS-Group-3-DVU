import { nanoid } from 'nanoid';
import type { User } from '../../auth';
import type { Conversation } from './conversation.model';

export class ConversationBuilder {
    private readonly conversation: Conversation;

    public constructor(id = nanoid()) {
        this.conversation = {
            id: id,
        } as Conversation;
    }

    public build() {
        return this.conversation;
    }

    public from(from: User) {
        this.conversation.from = from;
        return this;
    }

    public to(to: User) {
        this.conversation.to = to;
        return this;
    }

    public withMessage(message: string) {
        this.conversation.message = message;
        return this;
    }

    public sendAt(timestamp: Date) {
        this.conversation.timestamp = timestamp.getTime();
        return this;
    }
}
