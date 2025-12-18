import { Route, Routes } from 'react-router-dom';
import Login from './auth/login.tsx';
import Header from './core/header/header.tsx';
import Home from './core/home.tsx';
import Dashboard from './pages/dashboard.tsx';

export default function App() {
    return (
        <>
            <Header />
            <main className={'bg-body'}>
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </main>
        </>
    );
}
