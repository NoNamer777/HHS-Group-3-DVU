import { Route, Routes } from 'react-router-dom';
import { isAuthenticated } from './auth';
import LoginPage from './auth/login.page.tsx';
import HeaderComponent from './core/header/header.component.tsx';
import RootPage from './core/root/root.page.tsx';
import DashboardPage from './dashboard/dashboard.page.tsx';

export default function App() {
    return (
        <>
            {isAuthenticated() && (
                <header>
                    <HeaderComponent />
                </header>
            )}
            <main className={'bg-body'}>
                <Routes>
                    <Route path="/" element={<RootPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                </Routes>
            </main>
        </>
    );
}
