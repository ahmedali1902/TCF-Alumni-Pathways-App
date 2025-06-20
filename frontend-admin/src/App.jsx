import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.scss";
import { Routes, Route } from "react-router-dom";

import Home from "./routes/Home";
import Login from "./routes/Login";
import Institutes from "./routes/Institutes";
import InstituteView from "./routes/InstituteView";
import Notifications from "./routes/Notifications";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/institutes" element={<Institutes />} />
            <Route path="/institutes/:id" element={<InstituteView />} />
            <Route path="/notifications" element={<Notifications />} />
        </Routes>
    );
}

export default App
