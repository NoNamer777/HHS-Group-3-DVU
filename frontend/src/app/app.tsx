import { Route, Routes } from 'react-router-dom';
import './app.css';
import { useAuth } from './auth/auth.context.ts';
import LoginPage from './auth/login.page.tsx';
import HeaderComponent from './core/header/header.component.tsx';
import RootPage from './core/root/root.page.tsx';
import DashboardPage from './dashboard/dashboard.page.tsx';

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
                                element={<DashboardPage />}
                            />
                        </Routes>
                    </main>
                </>
            )}
        </>
    );
}
