import type { CreateConversationData, User } from '@/models';
import { useAuth0 } from '@auth0/auth0-react';
import { useParams } from 'react-router-dom';
import {
    useCreateConversationMutation,
    useGetConversationsQuery,
} from '../../../../conversations';
import ConversationCardComponent from '../../../../conversations/conversation-card.component.tsx';
import { useGetPatientByIdQuery } from '../../../patients.api.ts';
import './patient-info-conversations.component.css';

export default function PatientInfoConversationsComponent() {
    const { patientId } = useParams();
    const { user } = useAuth0();

    const { data: patient } = useGetPatientByIdQuery(patientId);

    const { data: conversations } = useGetConversationsQuery({
        to: patientId,
    });
    const [createConversation] = useCreateConversationMutation();

    async function onAddNote(formData: FormData) {
        const data: CreateConversationData = {
            message: formData.get('note') as string,
            to: patient,
            from: {
                id: user.sub,
                email: user.email,
                name: user.name,
                // TODO: Add roles when know how to use/get metadata
            } as User,
        };
        await createConversation(data);
    }

    return (
        <div className="d-flex flex-column gap-4">
            <div className="card w-100 shadow-sm rounded-4">
                <form className="card-body" action={onAddNote}>
                    <div className="mb-3">
                        <label
                            htmlFor="note-textarea"
                            className="form-label fw-bold"
                        >
                            Nieuwe notitie toevoegen
                        </label>
                        <textarea
                            id="note-textarea"
                            className="form-control"
                            name="note"
                            rows={4}
                            placeholder="Voer hier uw notitie of bericht in..."
                        ></textarea>
                    </div>
                    <button className="btn btn-primary" type="submit">
                        Notitie toevoegen
                    </button>
                </form>
            </div>
            <div className="card w-100 shadow-sm rounded-4">
                <div className="card-body">
                    <h5 className="card-title">Gespreksgeschiedenis</h5>
                    <div className="d-flex flex-column gap-2">
                        {(conversations ?? []).map((conversation) => (
                            <ConversationCardComponent
                                conversation={conversation}
                                key={conversation.id}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
