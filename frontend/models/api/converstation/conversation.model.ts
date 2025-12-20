import type { User } from '../../auth';

export interface Conversation {
    id: string;
    from: User;
    to: User;
    message: string;
    timestamp: number; // Date
}
