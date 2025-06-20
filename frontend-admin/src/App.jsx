import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.scss";
import { Routes, Route } from "react-router-dom";

import Home from "./routes/Home";
import Login from "./routes/Login";
import Institutes from "./routes/Institutes";
import InstituteView from "./routes/InstituteView";
import Notifications from "./routes/Notifications";
import Resources from "./routes/Resources";
import ResourceView from "./routes/ResourceView";
import InstituteAddRequests from "./routes/InstituteAddRequests";
import InstituteAddRequestView from "./routes/InstituteAddRequestView";
import AppFeedback from "./routes/AppFeedback";
import AppFeedbackView from "./routes/AppFeedbackView";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/institutes" element={<Institutes />} />
            <Route path="/institutes/:id" element={<InstituteView />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceView />} />
            <Route path="/institute-requests" element={<InstituteAddRequests />} />
            <Route path="/institute-requests/:id" element={<InstituteAddRequestView />} />
            <Route path="/feedback" element={<AppFeedback />} />
            <Route path="/feedback/:id" element={<AppFeedbackView />} />
        </Routes>
    );
}

export default App
