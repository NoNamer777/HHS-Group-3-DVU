import { BASE_URL, type CreateLabResultData } from '@/models';
import { useAuth0 } from '@auth0/auth0-react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { parseDate } from '../../../../../utils/parseDate.ts';
import { useCreateLabResultMutation, useGetLabResultsQuery } from '../../../../lab-results';
import LabResultCardComponent from '../../../../lab-results/lab-result-card.component.tsx';
import { useGetPatientByIdQuery, useUpdatePatientMutation } from '../../../patients.api.ts';
import './patient-info-lab-results.component.css';

export default function PatientInfoLabResultsComponent() {
    const { patientId } = useParams();
    const { user } = useAuth0();
    const { data: patient } = useGetPatientByIdQuery(patientId);
    const [refresh, setRefresh] = useState(0);

    const { data: labResults } = useGetLabResultsQuery({
        patient: patientId,
    });

    const [createLabResult] = useCreateLabResultMutation();
    const [updatePatient] = useUpdatePatientMutation();

    async function onAddLabResult(formData: FormData) {
        const data: CreateLabResultData = {
            maxValue: Number.parseFloat(formData.get('high') as string),
            minValue: Number.parseFloat(formData.get('low') as string),
            type: formData.get('type') as string,
            unit: formData.get('unit') as string,
            value: Number.parseFloat(formData.get('value') as string),
            patient: patient,
        };
        await createLabResult(data);
        if (patient) {
            await updatePatient({ ...patient, lastUpdated: new Date().toISOString() });
        }
        setRefresh((r) => r + 1); // trigger refresh
    }

    function getRoles() {
        return user?.[`${BASE_URL}/roles`] ?? [];
    }
    function canAddLabResults() {
        const roles: string[] = getRoles();
        return roles.every((role) => role !== 'Patient');
    }

    return (
        <div className="d-flex flex-column gap-4">
            <div className="d-flex align-items-center justify-content-between">
                <h5>Meetwaarden overzicht</h5>
                {canAddLabResults() && (
                    <button
                        type="button"
                        className="btn btn-primary btn-lg d-flex align-items-center gap-2"
                        data-bs-toggle="collapse"
                        data-bs-target="#lab-result-form"
                        aria-expanded="false"
                        aria-controls="lab-result-form"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Meetwaarde toevoegen</span>
                    </button>
                )}
            </div>

            <div className="container-fluid d-flex flex-column gap-4">
                <div className="collapse" id="lab-result-form">
                    <div className="card rounded-4 w-100 shadow-sm">
                        <div className="card-body">
                            <form className="card-body" action={onAddLabResult}>
                                <div className="mb-3">
                                    <label className="form-label">Nieuwe meetwaarde</label>
                                    <div className="row">
                                        <div className="col-2">
                                            <input
                                                type="text"
                                                name="type"
                                                placeholder="Type (bijv. Bloedsuiker)"
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="col-2">
                                            <input
                                                type="number"
                                                name="value"
                                                step="0.1"
                                                placeholder="Waarde"
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="col-2">
                                            <input
                                                type="text"
                                                name="unit"
                                                placeholder="Eenheid"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3 row align-items-center">
                                    <div className="col-auto">
                                        <label className="form-label">Optioneel: Normaalwaarde van</label>
                                    </div>
                                    <div className="col-auto">
                                        <input type="number" className="form-control" name="low" step="0.1" />
                                    </div>
                                    <div className="col-auto">
                                        <span className="form-label">tot</span>
                                    </div>
                                    <div className="col-auto">
                                        <input type="number" className="form-control" name="high" step="0.1" />
                                    </div>
                                </div>
                                <div className="d-flex gap-3 align-items-center">
                                    <button className="btn btn-primary" type="submit">
                                        Toevoegen
                                    </button>
                                    <button className="btn btn-secondary" type="reset">
                                        Annuleren
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="card rounded-4 w-100 shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title">Meetwaarden</h5>
                        {[...(labResults ?? [])]
                            .sort((a, b) => {
                                const da = parseDate(a.timestamp);
                                const db = parseDate(b.timestamp);
                                return db && da ? db.getTime() - da.getTime() : 0;
                            })
                            .map((labResult) => (
                                <LabResultCardComponent labResult={labResult} key={labResult.id + refresh} />
                            ))}
                        {(!labResults || labResults?.length === 0) && <p className="card-text">Geen resultaten</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
