import { Route, Routes } from 'react-router-dom';
import Home from './core/home.tsx';
import Navbar from './core/navbar/navbar.tsx';

export default function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/home" element={<Home />} />
            </Routes>
            <p>Hello World</p>
        </>
    );
}
