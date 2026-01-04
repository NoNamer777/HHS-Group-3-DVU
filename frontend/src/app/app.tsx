import { useAuth0 } from '@auth0/auth0-react';
import { Route, Routes } from 'react-router-dom';
import './app.css';
import HeaderComponent from './core/header/header.component';
import RootPage from './core/root/root.page';
import PatientsDashboardPage from './patients/dashboard/patients-dashboard.page';
import PatientInfoPage from './patients/patient-info/patient-info.page';
import PatientInfoConversationsComponent from './patients/patient-info/sections/conversations/patient-info-conversations.component';
import PatientInfoLabResultsComponent from './patients/patient-info/sections/lab-results/patient-info-lab-results.component';
import PatientInfoOverviewComponent from './patients/patient-info/sections/overview/patient-info-overview.component';

export default function App() {
    const { isLoading, user } = useAuth0();

    return (
        <>
            {!isLoading && (
                <>
                    {user && (
                        <header className="mb-3">
                            <HeaderComponent />
                        </header>
                    )}
                    <main>
                        <Routes>
                            <Route path="/" element={<RootPage />} />
                            <Route path="/dashboard" element={<PatientsDashboardPage />} />
                            <Route path="/patienten/:patientId" element={<PatientInfoPage />}>
                                <Route path="overzicht" element={<PatientInfoOverviewComponent />} />
                                <Route path="meetwaarden" element={<PatientInfoLabResultsComponent />} />
                                <Route path="gesprekken" element={<PatientInfoConversationsComponent />} />
                            </Route>
                        </Routes>
                    </main>
                </>
            )}
        </>
    );
}
