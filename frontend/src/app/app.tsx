import { Route, Routes } from 'react-router-dom';
import './app.css';
import { useAuth } from './auth';
import LoginPage from './auth/login/login.page';
import HeaderComponent from './core/header/header.component';
import RootPage from './core/root/root.page';
import PatientsDashboardPage from './patients/dashboard/patients-dashboard.page';
import PatientInfoPage from './patients/patient-info/patient-info.page';
import PatientInfoConversationsComponent from './patients/patient-info/sections/conversations/patient-info-conversations.component';
import PatientInfoImagesComponent from './patients/patient-info/sections/images/patient-info-images.component';
import PatientInfoLabResultsComponent from './patients/patient-info/sections/lab-results/patient-info-lab-results.component';
import PatientInfoOverviewComponent from './patients/patient-info/sections/overview/patient-info-overview.component';

export default function App() {
    const { loading, user } = useAuth();

    return (
        <>
            {!loading && (
                <>
                    {user && (
                        <header className="mb-3">
                            <HeaderComponent />
                        </header>
                    )}
                    <main>
                        <Routes>
                            <Route path="/" element={<RootPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/dashboard"
                                element={<PatientsDashboardPage />}
                            />
                            <Route
                                path="/patienten/:patientId"
                                element={<PatientInfoPage />}
                            >
                                <Route
                                    path="overzicht"
                                    element={<PatientInfoOverviewComponent />}
                                />
                                <Route
                                    path="meetwaarden"
                                    element={<PatientInfoLabResultsComponent />}
                                />
                                <Route
                                    path="gesprekken"
                                    element={
                                        <PatientInfoConversationsComponent />
                                    }
                                />
                                <Route
                                    path="afbeeldingen"
                                    element={<PatientInfoImagesComponent />}
                                />
                            </Route>
                        </Routes>
                    </main>
                </>
            )}
        </>
    );
}
