import { type Conversation, type CreateConversationData } from '@/models';
import { add, getAll, getById, remove, update } from '../../utils/LocalStorageAdapter';

const CONVERSATIONS_KEY = 'conversations';

export function useGetConversationsQuery(params?: { to?: string; limit?: number }) {
    let conversations = getAll<Conversation>(CONVERSATIONS_KEY);
    if (params?.to) {
        conversations = conversations.filter((c) => c.to?.id === params.to);
    }
    if (params?.limit) {
        conversations = conversations.slice(0, params.limit);
    }
    return {
        data: conversations,
        refetch: () => {},
    };
}

export function useCreateConversationMutation() {
    return [
        async (data: CreateConversationData) => {
            const id = Math.random().toString(36).slice(2);
            // Force timestamp as ISO string (YYYY-MM-DDTHH:mm:ssZ) for consistency
            let timestamp: string;
            if (typeof (data as any).timestamp === 'string') {
                timestamp = (data as any).timestamp;
            } else if (typeof (data as any).timestamp === 'number') {
                timestamp = new Date((data as any).timestamp).toISOString();
            } else {
                timestamp = new Date().toISOString();
            }
            add(CONVERSATIONS_KEY, { ...data, id, timestamp });
            return { ...data, id, timestamp };
        },
    ];
}

export function useGetConversationByIdQuery(conversationId?: string) {
    return {
        data: conversationId ? getById<Conversation>(CONVERSATIONS_KEY, conversationId) : undefined,
        isLoading: false,
    };
}

export function useUpdateConversationMutation() {
    return [
        async (conversation: Conversation) => {
            update(CONVERSATIONS_KEY, conversation);
            return conversation;
        },
    ];
}

export function useRemoveConversationMutation() {
    return [
        async (conversationId: string) => {
            remove(CONVERSATIONS_KEY, conversationId);
        },
    ];
}
