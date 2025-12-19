import { Route, Routes } from 'react-router-dom';
import './app.css';
import { useAuth } from './auth/context/auth.context.ts';
import LoginPage from './auth/login/login.page.tsx';
import HeaderComponent from './core/header/header.component.tsx';
import RootPage from './core/root/root.page.tsx';
import PatientsDashboardPage from './patients/dashboard/patients-dashboard.page.tsx';
import PatientInfoPage from './patients/patient-info/patient-info.page.tsx';
import PatientInfoConversationsComponent from './patients/patient-info/sections/conversations/patient-info-conversations.component.tsx';
import PatientInfoImagesComponent from './patients/patient-info/sections/images/patient-info-images.component.tsx';
import PatientInfoLabResultsComponent from './patients/patient-info/sections/lab-results/patient-info-lab-results.component.tsx';
import PatientInfoOverviewComponent from './patients/patient-info/sections/overview/patient-info-overview.component.tsx';

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
