import React from "react";
import { Routes, Route } from "react-router-dom";
// components
import Navbar from "./components/Navbar";
// pages
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
// styles

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/home" element={<Home />} />      
        <Route path="/login" element={<Login />} /> 
      </Routes>
    </>
  );
};

export default App;
