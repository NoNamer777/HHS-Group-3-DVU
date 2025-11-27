import { Routes, Route } from "react-router-dom";
import Navbar from "./core/navbar/navbar.tsx";
import Home from "./core/home.tsx";
import Login from "./auth/login.tsx";

export default function App() {
    return (
        <>
          <Navbar />
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
            <p>Hello World</p>
        </>
    );
}
