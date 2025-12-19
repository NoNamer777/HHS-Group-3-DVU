import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './patient-info.page.css';

export default function PatientInfoPage() {
    const { patientId } = useParams();

    useEffect(() => {
        console.log({ patientId });
    }, [patientId]);

    return <></>;
}
