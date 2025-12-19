import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './patient-info.page.css';
import { useGetPatientByIdQuery } from './patients.api.ts';

export default function PatientInfoPage() {
    const { patientId } = useParams();
    const { data: patient } = useGetPatientByIdQuery(patientId);

    useEffect(() => {
        console.log(patient);
    }, [patient]);

    return <></>;
}
