import { useParams } from 'react-router-dom';
import { useGetConversationsQuery } from '../../../../conversations';
import ConversationCardComponent from '../../../../conversations/conversation-card.component.tsx';
import { useGetLabResultsQuery } from '../../../../lab-results';
import LabResultCardComponent from '../../../../lab-results/lab-result-card.component.tsx';
import './patient-info-overview.component.css';

export default function PatientInfoOverviewComponent() {
    const { patientId } = useParams();

    const { data: conversations } = useGetConversationsQuery({
        to: patientId,
        limit: 3,
    });

    const { data: labResults } = useGetLabResultsQuery({
        patient: patientId,
        limit: 3,
    });

    return (
        <div className="d-flex flex-column gap-3">
            <div className="card rounded-4 w-100 shadow-sm">
                <div className="card-body">
                    <h5 className="card-title">Recente meetwaarden</h5>
                    {(labResults ?? []).map((labResult) => (
                        <LabResultCardComponent
                            labResult={labResult}
                            key={labResult.id}
                        />
                    ))}
                    {(!labResults || labResults?.length === 0) && (
                        <p className="card-text">Geen resultaten</p>
                    )}
                </div>
            </div>
            <div className="card rounded-4 w-100 shadow-sm">
                <div className="card-body">
                    <h5 className="card-title">Recente communicatie</h5>
                    {(conversations ?? []).map((conversation) => (
                        <ConversationCardComponent
                            conversation={conversation}
                            key={conversation.id}
                        />
                    ))}
                    {(!conversations || conversations?.length === 0) && (
                        <p className="card-text">Geen resultaten</p>
                    )}
                </div>
            </div>
        </div>
    );
}
