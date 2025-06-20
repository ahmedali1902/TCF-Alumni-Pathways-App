import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Offcanvas from "react-bootstrap/Offcanvas";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";

import logo from "../assets/tcf_logo.svg";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showSidebar, setShowSidebar] = useState(false);

    const logoutHandler = async () => {
        await logout();
        navigate("/login");
        window.location.reload();
    };

    const navigationItems = [
        {
            path: "/",
            icon: "fa-solid fa-chart-line",
            label: "Dashboard",
            exact: true
        },
        {
            path: "/users",
            icon: "fa-solid fa-users",
            label: "Users",
            exact: false
        },
        {
            path: "/institutes",
            icon: "fa-solid fa-building-columns",
            label: "Institutes",
            exact: false
        },
        {
            path: "/resources",
            icon: "fa-solid fa-book-open",
            label: "Resources",
            exact: false
        },
        {
            path: "/institute-requests",
            icon: "fa-solid fa-clipboard-list",
            label: "Institute Requests",
            exact: false
        },
        {
            path: "/feedback",
            icon: "fa-solid fa-comments",
            label: "Feedback",
            exact: false
        }
    ];

    const isActiveRoute = (path, exact) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <Offcanvas 
                show={showSidebar} 
                onHide={() => setShowSidebar(false)} 
                placement="start" 
                scroll={true} 
                backdrop={true} 
                className="admin-sidebar"
            >
                <Offcanvas.Header closeButton style={{ borderBottom: '1px solid var(--gray-200)', padding: '20px' }}>
                    <Offcanvas.Title>
                        <div className="d-flex align-items-center">
                            <img src={logo} alt="TCF Logo" height="32px" className="me-2" />
                            <span style={{ color: 'var(--gray-800)', fontWeight: '600', fontSize: '1.1rem' }}>
                                Admin Panel
                            </span>
                        </div>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body style={{ padding: '20px' }}>
                    <div className="mb-4">
                        {user && (
                            <div className="p-3 rounded" style={{ 
                                background: 'var(--gray-50)', 
                                border: '1px solid var(--gray-200)' 
                            }}>
                                <div className="d-flex align-items-center">
                                    <div className="me-3" style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'var(--primary-gradient)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '600'
                                    }}>
                                        {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'A')}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--gray-800)', fontSize: '0.9rem' }}>
                                            {user.name ? `Welcome, ${user.name}!` : 'Welcome back!'}
                                        </div>
                                        <div style={{ color: 'var(--gray-600)', fontSize: '0.8rem' }}>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Nav className="flex-column">
                        {navigationItems.map((item) => (
                            <Nav.Link
                                key={item.path}
                                as={NavLink}
                                to={item.path}
                                className={isActiveRoute(item.path, item.exact) ? "active" : ""}
                                onClick={() => setShowSidebar(false)}
                                style={{ textDecoration: 'none' }}
                            >
                                <i className={`${item.icon} me-3`} style={{ width: '20px' }} />
                                {item.label}
                            </Nav.Link>
                        ))}
                    </Nav>

                    <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
                        {user ? (
                            <Button 
                                variant="danger" 
                                onClick={logoutHandler}
                                className="w-100 btn-modern"
                                style={{ 
                                    background: 'var(--danger-gradient)',
                                    border: 'none'
                                }}
                            >
                                <i className="fa-solid fa-sign-out-alt me-2" />
                                Logout
                            </Button>
                        ) : (
                            <Button 
                                variant="primary" 
                                onClick={() => { 
                                    setShowSidebar(false); 
                                    navigate("/login"); 
                                }}
                                className="w-100 btn-modern"
                                style={{ 
                                    background: 'var(--primary-gradient)',
                                    border: 'none'
                                }}
                            >
                                <i className="fa-solid fa-sign-in-alt me-2" />
                                Login
                            </Button>
                        )}
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            <Navbar className="admin-navbar" expand="false" fixed="top">
                <Container>
                    <Navbar.Toggle 
                        onClick={() => setShowSidebar(true)}
                        style={{ border: 'none' }}
                    >
                        <i className="fa-solid fa-bars" style={{ color: 'var(--gray-600)' }} />
                    </Navbar.Toggle>
                    
                    <Navbar.Brand 
                        className="mx-auto d-flex align-items-center" 
                        onClick={() => navigate("/")}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={logo} alt="TCF Logo" height="40px" className="me-3" />
                        <h1 style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: '700',
                            margin: 0,
                            background: 'var(--primary-gradient)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            TCF Alumni Pathways
                        </h1>
                    </Navbar.Brand>

                    <div style={{ width: '50px' }}></div> {/* Spacer for centering */}
                </Container>
            </Navbar>
        </>
    );
};

export default Sidebar;