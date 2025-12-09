import { Route, Routes } from 'react-router-dom';
import Login from './auth/login.tsx';
import Home from './core/home.tsx';
import Navbar from './core/navbar/navbar.tsx';
import Dashboard from './pages/dashboard.tsx';

export default function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </>
    );
}
