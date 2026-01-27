import { BASE_URL, type CreateConversationData, type User } from '@/models';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { parseDate } from '../../../../../utils/parseDate.ts';
import { useCreateConversationMutation, useGetConversationsQuery } from '../../../../conversations';
import ConversationCardComponent from '../../../../conversations/conversation-card.component.tsx';
import { useGetPatientByIdQuery, useUpdatePatientMutation } from '../../../patients.api.ts';
import './patient-info-conversations.component.css';

export default function PatientInfoConversationsComponent() {
    const { patientId } = useParams();
    const { user } = useAuth0();
    const [refresh, setRefresh] = useState(0);

    const { data: patient } = useGetPatientByIdQuery(patientId);

    const { data: conversations } = useGetConversationsQuery({
        to: patientId,
    });
    const [createConversation] = useCreateConversationMutation();
    const [updatePatient] = useUpdatePatientMutation();

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
        if (patient) {
            await updatePatient({ ...patient, lastUpdated: new Date().toISOString() });
        }
        setRefresh((r) => r + 1); // trigger refresh
    }

    function getRoles() {
        return user?.[`${BASE_URL}/roles`] ?? [];
    }
    function canAddMessage() {
        const roles: string[] = getRoles();
        return roles.every((role) => role !== 'Patient');
    }

    return (
        <div className="d-flex flex-column gap-4">
            {canAddMessage() && (
                <div className="card w-100 shadow-sm rounded-4">
                    <form className="card-body" action={onAddNote}>
                        <div className="mb-3">
                            <label htmlFor="note-textarea" className="form-label fw-bold">
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
            )}
            <div className="card w-100 shadow-sm rounded-4">
                <div className="card-body">
                    <h5 className="card-title">Gespreksgeschiedenis</h5>
                    <div className="d-flex flex-column gap-2">
                        {[...(conversations ?? [])]
                            .sort((a, b) => {
                                const da = parseDate(a.timestamp);
                                const db = parseDate(b.timestamp);
                                return db && da ? db.getTime() - da.getTime() : 0;
                            })
                            .map((conversation) => (
                                <ConversationCardComponent
                                    conversation={conversation}
                                    key={conversation.id + refresh}
                                />
                            ))}
                        {(!conversations || conversations?.length === 0) && (
                            <p className="card-text">Geen resultaten</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
