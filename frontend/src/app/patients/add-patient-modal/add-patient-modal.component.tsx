import {
    type CreatePatientData,
    type Gender,
    GENDER_OPTIONS,
    genderAttribute,
    Genders,
    PATIENT_STATUS_OPTIONS,
    type PatientStatus,
    patientStatusAttribute,
    PatientStatuses,
} from '@/models';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from 'bootstrap';
import { type ChangeEvent, useState } from 'react';
import { useCreatePatientMutation } from '../patients.api';
import './add-patient-modal.component.css';

export default function AddPatientModalComponent() {
    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
    const [gender, setGender] = useState<Gender>(Genders.MALE);
    const [condition, setCondition] = useState('');
    const [patientStatus, setPatientStatus] = useState<PatientStatus>(
        PatientStatuses.STABLE,
    );

    const [createPatient] = useCreatePatientMutation();

    function onNameChange(event: ChangeEvent) {
        setName((event.target as HTMLInputElement).value);
    }

    function onDateOfBirthChange(event: ChangeEvent) {
        setDateOfBirth((event.target as HTMLInputElement).valueAsDate);
    }

    function onGenderChange(event: ChangeEvent) {
        setGender(genderAttribute((event.target as HTMLInputElement).value));
    }

    function onConditionChange(event: ChangeEvent) {
        setCondition((event.target as HTMLInputElement).value);
    }

    function onPatientStatusChange(event: ChangeEvent) {
        setPatientStatus(
            patientStatusAttribute((event.target as HTMLInputElement).value),
        );
    }

    async function onAddPatient() {
        const modal = new Modal(document.getElementById('add-patient-modal'));

        const data = {
            name: name,
            dateOfBirth: dateOfBirth.getTime(),
            gender: gender,
            condition: condition,
            status: patientStatus,
        } as CreatePatientData;
        await createPatient(data);

        // Reset form
        setName('');
        setDateOfBirth(new Date());
        setGender(Genders.MALE);
        setCondition('');
        setPatientStatus(PatientStatuses.STABLE);

        modal.hide();
        modal.dispose();
    }

    return (
        <>
            <button
                type="button"
                className="btn btn-primary d-flex gap-1 align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#add-patient-modal"
            >
                <FontAwesomeIcon icon={faUserPlus} />
                Patiënt toevoegen
            </button>

            <div
                className="modal fade"
                tabIndex={-1}
                id="add-patient-modal"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header d-flex align-items-center gap-3">
                            <div className="text-primary bg-primary-subtle rounded-4 p-2 d-flex align-items-center justify-content-between">
                                <FontAwesomeIcon icon={faUserPlus} size="2x" />
                            </div>
                            <div>
                                <h3 className="h5 m-0">
                                    Nieuwe patiënt toevoegen
                                </h3>
                                <h4 className="h6 text-muted m-0">
                                    Vul de gegevens van de nieuwe patiënt in
                                </h4>
                            </div>
                        </div>
                        <div className="modal-body">
                            <form action={onAddPatient}>
                                <div className="mb-3">
                                    <label
                                        htmlFor="name-input"
                                        className="form-label"
                                    >
                                        Naam
                                        <span className="text-danger position-relative top-0 right-0">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name-input"
                                        value={name}
                                        onChange={onNameChange}
                                    />
                                </div>
                                <div className="row mb-3">
                                    <div className="col">
                                        <label
                                            htmlFor="date-of-birth-input"
                                            className="form-label"
                                        >
                                            Geboortedatum
                                            <span className="text-danger position-relative top-0 right-0">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="date-of-birth-input"
                                            // For some reason this is the only locale that worked quickly to format the value in the required form (yyyy-MM-dd).
                                            value={dateOfBirth.toLocaleDateString(
                                                ['fr-CA'],
                                            )}
                                            onChange={onDateOfBirthChange}
                                        />
                                    </div>
                                    <div className="col">
                                        <label
                                            htmlFor="gender-select"
                                            className="form-label"
                                        >
                                            Geslacht
                                            <span className="text-danger position-relative top-0 right-0">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            className="form-select"
                                            id="gender-select"
                                            value={gender}
                                            onChange={onGenderChange}
                                        >
                                            {GENDER_OPTIONS.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label
                                        htmlFor="condition-input"
                                        className="form-label"
                                    >
                                        Aandoening
                                        <span className="text-danger position-relative top-0 right-0">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="condition-input"
                                        value={condition}
                                        onChange={onConditionChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label
                                        htmlFor="status-select"
                                        className="form-label"
                                    >
                                        Status
                                    </label>
                                    <select
                                        className="form-select"
                                        id="status-select"
                                        value={patientStatus}
                                        onChange={onPatientStatusChange}
                                    >
                                        {PATIENT_STATUS_OPTIONS.map(
                                            (option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer d-flex align-items-center">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Annuleren
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                                onClick={onAddPatient}
                            >
                                Patiënt toevoegen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
