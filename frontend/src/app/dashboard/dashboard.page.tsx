import {
    faCircleCheck,
    faHeartPulse,
    faMagnifyingGlass,
    faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type ChangeEvent, useEffect, useState } from 'react';
import { type Patient, PatientsService, PatientStatuses } from '../patients';
import './dashboard.page.css';

export default function DashboardPage() {
    const patientsService = PatientsService.instance();

    const [query, setQuery] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);

    function onQueryChange(event: ChangeEvent) {
        setQuery((event.target as HTMLInputElement).value);
    }

    function onQuery() {
        console.log({ query });
    }

    function onOpenPatientDossier(patientId: string) {
        console.warn(`OPENING DOSSIER OF PATIENT WITH ID "${patientId}"`);
    }

    useEffect(() => {
        (async () => {
            const patients = await patientsService.getAll();

            setPatients(patients);
        })();
    }, [patientsService]);

    return (
        <article className="container-fluid">
            {/*Query input*/}
            <div className="bg-body p-2 shadow-sm rounded-3 mb-5">
                <form action={onQuery}>
                    <label
                        htmlFor="query-input"
                        className="form-label visually-hidden"
                    >
                        Zoek
                    </label>
                    <div className="input-group input-group-lg">
                        <span className="input-group-text">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </span>
                        <input
                            type="search"
                            className="form-control"
                            id="query-input"
                            placeholder="Zoek op naam..."
                            value={query}
                            onChange={onQueryChange}
                        />
                    </div>
                </form>
            </div>

            {/*Information Cards*/}
            <div className="d-flex align-items-center justify-content-between px-5 mb-5">
                <div className="card rounded-4 shadow-sm">
                    <div className="card-body">
                        <h3 className="card-title text-muted h6">
                            Totaal Patienten
                        </h3>
                        <h4 className="h2">{patients.length}</h4>
                    </div>
                </div>
                <div className="card rounded-4 shadow-sm">
                    <div className="card-body d-flex justify-content-between">
                        <section>
                            <h3 className="card-title text-muted h6">
                                Stabiel
                            </h3>
                            <h4 className="h2">
                                {
                                    patients.filter(
                                        (patient) =>
                                            patient.status ===
                                            PatientStatuses.STABLE,
                                    ).length
                                }
                            </h4>
                        </section>
                        <FontAwesomeIcon
                            icon={faCircleCheck}
                            size="5x"
                            className="text-success"
                        />
                    </div>
                </div>
                <div className="card rounded-4 shadow-sm">
                    <div className="card-body d-flex justify-content-between">
                        <section>
                            <h3 className="card-title text-muted h6">
                                Monitoren
                            </h3>
                            <h4 className="h2">
                                {
                                    patients.filter(
                                        (patient) =>
                                            patient.status ===
                                            PatientStatuses.MONITORING,
                                    ).length
                                }
                            </h4>
                        </section>
                        <FontAwesomeIcon
                            icon={faHeartPulse}
                            size="5x"
                            className="text-warning"
                        />
                    </div>
                </div>
                <div className="card rounded-4 shadow-sm">
                    <div className="card-body d-flex justify-content-between">
                        <section>
                            <h3 className="card-title text-muted h6">
                                Kritiek
                            </h3>
                            <h4 className="h2">
                                {
                                    patients.filter(
                                        (patient) =>
                                            patient.status ===
                                            PatientStatuses.CRITICAL,
                                    ).length
                                }
                            </h4>
                        </section>
                        <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            size="5x"
                            className="text-danger"
                        />
                    </div>
                </div>
            </div>

            {/*Table*/}
            <div className="border rounded">
                <table className="table table-hover">
                    <thead className="table-secondary">
                        <tr>
                            <th scope="col" className="p-3">
                                Naam
                            </th>
                            <th scope="col" className="p-3">
                                Geboortedatum
                            </th>
                            <th scope="col" className="p-3">
                                Geslacht
                            </th>
                            <th scope="col" className="p-3">
                                Aandoening
                            </th>
                            <th scope="col" className="p-3">
                                Laatst bijgewerkt
                            </th>
                            <th scope="col" className="p-3">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">
                        {patients.map((patient) => (
                            <tr
                                key={patient.id}
                                onClick={() => onOpenPatientDossier(patient.id)}
                            >
                                <td className="p-3">{patient.name}</td>
                                <td className="p-3">
                                    {patient.dateOfBirth.toLocaleDateString([
                                        'nl',
                                    ])}
                                </td>
                                <td className="p-3">{patient.gender}</td>
                                <td className="p-3">{patient.condition}</td>
                                <td className="p-3">
                                    {patient.lastUpdated.toLocaleString(['nl'])}
                                </td>
                                <td className="p-3 d-flex gap-2 align-items-center">
                                    {patient.status ===
                                        PatientStatuses.STABLE && (
                                        <FontAwesomeIcon
                                            icon={faCircleCheck}
                                            className="text-success"
                                        />
                                    )}
                                    {patient.status ===
                                        PatientStatuses.MONITORING && (
                                        <FontAwesomeIcon
                                            icon={faHeartPulse}
                                            className="text-warning"
                                        />
                                    )}
                                    {patient.status ===
                                        PatientStatuses.CRITICAL && (
                                        <FontAwesomeIcon
                                            icon={faTriangleExclamation}
                                            className="text-danger"
                                        />
                                    )}
                                    {patient.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </article>
    );
}
