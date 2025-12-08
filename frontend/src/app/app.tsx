import { Route, Routes } from 'react-router-dom';
import Login from './auth/login.tsx';
import Home from './core/home.tsx';
import Navbar from './core/navbar/navbar.tsx';
import EpdTable from './pages/epdtable.tsx';

export default function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/epdtable" element={<EpdTable />} />
            </Routes>
            <p>Hello World</p>
        </>
    );
}
