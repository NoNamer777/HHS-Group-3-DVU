import { instanceToPlain } from 'class-transformer';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks.ts';
import { Patient } from './models.ts';
import './patient-info.page.css';
import { PatientsService } from './patients.service.ts';
import { setPatients, setSelectedPatient } from './patients.slice.ts';

export default function PatientInfoPage() {
    const patientsService = PatientsService.instance();

    const { selectedPatientId, patients } = useAppSelector(
        (state) => state.patients,
    );
    const dispatch = useAppDispatch();
    const { patientId } = useParams();

    useEffect(() => {
        if (selectedPatientId === patientId) {
            return;
        }
        if (!selectedPatientId && patientId) {
            dispatch(setSelectedPatient(patientId));
        }
        if (patients.length === 0) {
            (async () => {
                const patients = await patientsService.getAll();
                dispatch(setPatients(instanceToPlain(patients) as Patient[]));
            })();
            return;
        }
    }, [selectedPatientId, patientId, dispatch, patients, patientsService]);

    return <></>;
}
