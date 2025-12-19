import { faArrowLeft, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGetPatientByIdQuery } from '../patients.api.ts';
import './patient-info.page.css';

const InfoSections = {
    OVERVIEW: 'Overzicht',
    LAB_RESULTS: 'Meetwaarden',
    CONVERSATIONS: 'Gesprekken',
    IMAGES: 'Afbeeldingen',
} as const;

type InfoSection = (typeof InfoSections)[keyof typeof InfoSections];

export default function PatientInfoPage() {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [shownSection, setShownSection] = useState<InfoSection>(
        InfoSections.OVERVIEW,
    );

    const { data: patient, isLoading } = useGetPatientByIdQuery(patientId);

    async function onNavigateBack() {
        await navigate('/dashboard');
    }

    return (
        <article className="container-fluid">
            {/*Back button*/}
            <button
                type="button"
                className="btn btn-light d-flex align-items-center gap-3 mb-5"
                onClick={onNavigateBack}
            >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span className="h5 m-0">Terug naar het dashboard</span>
            </button>

            {/*Patient info*/}
            <div className="card shadow-sm w-100 rounded-4 mb-5">
                <div className="card-body">
                    {isLoading && (
                        <div className="d-flex justify-content-center align-items-center py-6">
                            <span className="spinner-border"></span>
                        </div>
                    )}
                    {!isLoading && (
                        <div className="d-flex align-items-center gap-3 py-3 px-2">
                            <FontAwesomeIcon icon={faUserCircle} size="6x" />
                            <div>
                                <p className="card-title fw-bold fs-5 mb-1">
                                    {patient.name}
                                </p>
                                <p className="card-text text-muted fw-semibold d-flex gap-2 mb-0">
                                    <span>
                                        {new Date(
                                            patient.dateOfBirth,
                                        ).toLocaleDateString(['nl'])}
                                    </span>
                                    <span>•</span>
                                    <span>{patient.gender}</span>
                                </p>
                                <p className="card-text text-muted fw-semibold d-flex gap-2 mb-0">
                                    <span>Aandoening:</span>
                                    <span>{patient.condition}</span>
                                </p>
                                <p className="card-text text-muted fw-semibold d-flex gap-2">
                                    <span>Laatst bijgewerkt:</span>
                                    <span>
                                        {new Date(
                                            patient.lastUpdated,
                                        ).toLocaleString(['nl'])}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/*Sections*/}
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <Link className="nav-link" to="overzicht">
                        Overzicht
                    </Link>
                </li>
            </ul>
        </article>
    );
}
