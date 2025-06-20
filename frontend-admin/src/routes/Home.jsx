import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Sidebar from '../components/Sidebar';

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

import axios from "axios";

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [dashboardData, setDashboardData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setMessage("Loading dashboard data...");
            const token = localStorage.getItem("authToken");
            const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            setMessage("Please login first!");
            setIsLoading(false);
        } else {
            fetchDashboardData();
        }
    }, [user]);

    const dashboardCards = [
        {
            title: "Users",
            count: dashboardData?.users?.total_users || 0,
            subtitle: `Admin: ${dashboardData?.users?.admin_users || 0} | Anonymous: ${dashboardData?.users?.anonymous_users || 0}`,
            icon: "fa-solid fa-users",
            color: "success",
            route: "/users",
            description: "Manage admin and anonymous users"
        },
        {
            title: "Institutes",
            count: dashboardData?.institutes?.total || 0,
            subtitle: "Educational institutions",
            icon: "fa-solid fa-building-columns",
            color: "primary",
            route: "/institutes",
            description: "Manage educational institutes"
        },
        {
            title: "Resources",
            count: dashboardData?.resources?.total || 0,
            subtitle: "Learning materials",
            icon: "fa-solid fa-book-open",
            color: "warning",
            route: "/resources",
            description: "Manage educational resources"
        },
        {
            title: "Institute Add Requests",
            count: dashboardData?.institute_requests?.total || 0,
            subtitle: `Pending: ${dashboardData?.institute_requests?.pending || 0}`,
            icon: "fa-solid fa-clipboard-list",
            color: "info",
            route: "/institute-requests",
            description: "Institute addition requests"
        },
        {
            title: "App Feedback",
            count: dashboardData?.app_feedback?.total || 0,
            subtitle: `Unprocessed: ${dashboardData?.app_feedback?.unprocessed || 0}`,
            icon: "fa-solid fa-comments",
            color: "secondary",
            route: "/feedback",
            description: "User feedback and suggestions"
        },
        {
            title: "Notifications",
            count: dashboardData?.notifications?.total || 0,
            subtitle: "App notifications",
            icon: "fa-solid fa-bell",
            color: "danger",
            route: "/notifications",
            description: "Manage app notifications"
        }
    ];

    if (isLoading) {
        return (
            <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
                <Sidebar />
                <Container className="text-center" style={{ marginTop: '100px' }}>
                    <Spinner animation="border" variant="primary" />
                    <h4 className="mt-3" style={{ color: 'white' }}>Loading dashboard...</h4>
                </Container>
            </Container>
        );
    }

    return (
        <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
            <Sidebar />
            <Container style={{ marginTop: '100px', paddingBottom: '40px' }}>
                {/* Header Section */}
                <div className="text-center mb-5">
                    <h1 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '16px',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontSize: '1.1rem',
                        fontWeight: '400',
                        maxWidth: '600px',
                        margin: '0 auto',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                    }}>
                        Welcome to <span style={{ color: 'white', fontWeight: '600' }}>TCF Alumni Pathways</span> Admin Panel. Manage institutes, users, and resources efficiently.
                    </p>
                    {user && (
                        <div className="mt-3">
                            <span style={{ 
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                <i className="fa-solid fa-user me-2" />
                                {user.name ? `Welcome, ${user.name}` : `Logged in as: ${user.email}`}
                            </span>
                        </div>
                    )}
                </div>

                {message && (
                    <Row className="justify-content-center mb-4">
                        <Col md={8}>
                            <Alert 
                                variant={message.includes('error') ? 'danger' : 'info'} 
                                className="text-center"
                                style={{ 
                                    cursor: message.includes('login') ? 'pointer' : 'default',
                                    fontWeight: 'bold'
                                }}
                                onClick={() => message.includes('login') && navigate('/login')}
                            >
                                {message}
                                {message.includes('login') && <i className="fa-solid fa-external-link-alt ms-2" />}
                            </Alert>
                        </Col>
                    </Row>
                )}

                {/* Dashboard Cards */}
                <Row className="g-4 justify-content-center">
                    {dashboardCards.map((card, index) => (
                        <Col key={index} xs={12} md={6} lg={4}>
                            <div 
                                className={`dashboard-card ${card.color} h-100 p-4`}
                                onClick={() => navigate(card.route)}
                                style={{ 
                                    minHeight: '140px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px'
                                }}
                            >
                                <div className={`dashboard-card-icon ${card.color}`} style={{ flexShrink: 0 }}>
                                    <i className={card.icon} style={{ 
                                        fontSize: '28px', 
                                        color: `var(--${card.color}-color)` 
                                    }} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 style={{ 
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: 'var(--gray-800)',
                                            margin: 0
                                        }}>
                                            {card.title}
                                        </h5>
                                        <div style={{ 
                                            fontSize: '1.8rem', 
                                            fontWeight: '700',
                                            color: 'var(--gray-800)',
                                            lineHeight: '1'
                                        }}>
                                            {card.count.toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {card.subtitle && (
                                        <div style={{ 
                                            fontSize: '0.8rem',
                                            color: 'var(--gray-600)',
                                            fontWeight: '500',
                                            marginBottom: '6px'
                                        }}>
                                            {card.subtitle}
                                        </div>
                                    )}
                                    
                                    <div style={{ 
                                        fontSize: '0.75rem',
                                        color: 'var(--gray-500)',
                                        fontWeight: '400'
                                    }}>
                                        {card.description}
                                    </div>

                                    <div className="mt-2">
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            color: `var(--${card.color}-color)`,
                                            fontSize: '0.8rem',
                                            fontWeight: '500'
                                        }}>
                                            <span>View Details</span>
                                            <i className="fa-solid fa-arrow-right ms-2" style={{ fontSize: '0.7rem' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>


            </Container>
        </Container>
    )
}

export default Home
