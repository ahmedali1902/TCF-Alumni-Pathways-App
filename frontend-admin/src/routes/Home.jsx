import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Sidebar from '../components/Sidebar';

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import axios from "axios";

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [dashboardData, setDashboardData] = useState({});
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchDashboardData = async () => {
        try {
            setMessage("Loading dashboard data...");
            const token = localStorage.getItem("authToken");
            const response = await axios.get(`${API_BASE_URL}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = response.data.data
            setDashboardData(data);
            setMessage("");
        } catch (error) {
            console.error(error);
            setMessage("An error occurred while fetching dashboard data.");
        }
    };

    useEffect(() => {
        if (!user) {
            setMessage("Please login first!");
        } else {
            fetchDashboardData();
        }
    }, [user]);

    return (
        <Container fluid className="p-0">
            <Sidebar />
            <Container className="text-center mt-5">
                <h1 className="text-blue-900 fw-semibold">Dashboard</h1>
                <Row className="justify-content-center mt-4">
                    {message ? (
                        <h4 className="alert alert-danger">{message}</h4>
                    ) : (
                        <>
                            <Col xs={10} md={6} lg={3} className="my-2">
                                <div className="d-flex justify-content-around align-items-center bg-light p-3 rounded-3 h-100" onClick={() => navigate("/users")}>
                                    <i className="fa-solid fa-user fa-4x" style={{ color: "rgba(224, 54, 54, 0.8)" }} />
                                    <div className="d-flex flex-column justify-content-center">
                                        <h3 className="text-blue-900 fw-semibold">Users</h3>
                                        <h1 className="text-blue-900 fw-bold">{dashboardData?.user_count || 0}</h1>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={10} md={6} lg={3} className="my-2">
                                <div className="d-flex justify-content-around align-items-center bg-light p-3 rounded-3 h-100" onClick={() => navigate("/institutes")}>
                                    <i className="fa-solid fa-building-columns fa-4x" style={{ color: "rgba(0, 123, 224, 0.8)" }} />
                                    <div className="d-flex flex-column justify-content-center">
                                        <h3 className="text-blue-900 fw-semibold">Institutes</h3>
                                        <h1 className="text-blue-900 fw-bold">{dashboardData?.institute_count || 0}</h1>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={10} md={6} lg={3} className="my-2">
                                <div className="d-flex justify-content-around align-items-center bg-light p-3 rounded-3 h-100" onClick={() => navigate("/resources")}>
                                    <i className="fa-solid fa-book fa-4x" style={{ color: "rgba(247, 153, 0, 0.8)" }} />
                                    <div className="d-flex flex-column justify-content-center">
                                        <h3 className="text-blue-900 fw-semibold">Resources</h3>
                                        <h1 className="text-blue-900 fw-bold">{dashboardData?.resource_count || 0}</h1>
                                    </div>
                                </div>
                            </Col>
                            {/* <Col xs={10} md={6} lg={3} className="my-2">
                                <div className="d-flex justify-content-around align-items-center bg-light p-3 rounded-3 h-100" onClick={() => navigate("/admin/contact")}>
                                    <i className="fa-solid fa-phone fa-4x" style={{ color: "rgba(20, 191, 150, 0.8)" }} />
                                    <div className="d-flex flex-column justify-content-center">
                                        <h3 className="text-blue-900 fw-semibold">Contact Queries</h3>
                                        <h1 className="text-blue-900 fw-bold">{dashboardData?.contact_count || 0}</h1>
                                    </div>
                                </div>
                            </Col> */}
                        </>
                    )}
                </Row>
            </Container>
        </Container>
    )
}

export default Home
