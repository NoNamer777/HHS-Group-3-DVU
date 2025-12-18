import { Route, Routes } from 'react-router-dom';
import Login from './auth/login.tsx';
import ProtectedRoot from './auth/protected-root.tsx';
import Header from './core/header/header.tsx';
import Dashboard from './pages/dashboard.tsx';

export default function App() {
    return (
        <>
            <Header />
            <main className={'bg-body'}>
                <Routes>
                    <Route path="/" element={<ProtectedRoot />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </main>
        </>
    );
}
