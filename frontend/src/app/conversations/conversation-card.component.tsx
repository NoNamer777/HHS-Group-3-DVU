import type { Conversation } from '@/models';

interface ConversationCardComponentProps {
    conversation: Conversation;
}

export default function ConversationCardComponent(props: ConversationCardComponentProps) {
    const { conversation } = props;

    return (
        <div className="card w-100 text-bg-light rounded-4 mb-2">
            <div className="card-body">
                <div className="d-flex justify-content-between">
                    <h6 className="card-title">{conversation.from.name}</h6>
                    <span className="text-muted">{new Date(conversation.timestamp).toLocaleDateString()}</span>
                </div>
                {/* TODO: Add role of health professional once we know how to get/use user metadata */}
                <p>{conversation.message}</p>
            </div>
        </div>
    );
}
