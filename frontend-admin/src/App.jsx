import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.scss";
import { Routes, Route } from "react-router-dom";

import Home from "./routes/Home";
import Login from "./routes/Login";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}

export default App
