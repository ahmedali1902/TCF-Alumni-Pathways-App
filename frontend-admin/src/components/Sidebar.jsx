import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

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
    const [showSidebar, setShowSidebar] = useState(false);

    const logoutHandler = async () => {
        await logout();
        navigate("/login");
        window.location.reload();
    };

    return (
        <>
            <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="start" scroll={true} backdrop={true} className="fw-bold">
                <Offcanvas.Header closeButton />
                <Offcanvas.Body>
                    <Container>
                        <Nav className="flex-column">
                            <Nav.Link as={NavLink} to="/" className={(navData) => (navData.isActive ? "active" : "")} onClick={() => setShowSidebar(false)}><i className="fa-solid fa-gauge me-2" />Dashboard</Nav.Link>
                            <Nav.Link as={NavLink} to="/admin/user" className={(navData) => (navData.isActive ? "active" : "")} onClick={() => setShowSidebar(false)}><i className="fa-solid fa-user me-2" />User</Nav.Link>
                            <Nav.Link as={NavLink} to="/admin/story" className={(navData) => (navData.isActive ? "active" : "")} onClick={() => setShowSidebar(false)}><i className="fa-solid fa-book me-2" />Story</Nav.Link>
                            {user ? (
                                <Button variant="danger" onClick={logoutHandler}>Logout</Button>
                            ) : (
                                <Button variant="primary green-bg" onClick={() => { setShowSidebar(false); navigate("/login"); }}>Login</Button>
                            )}
                        </Nav>
                    </Container>
                </Offcanvas.Body>
            </Offcanvas>
            <Navbar className="my-bg-2" expand="false" key="admin">
                <Navbar.Toggle className="position-absolute ms-2" onClick={() => setShowSidebar(true)} />
                <Navbar.Brand className="d-flex align-items-center ms-auto me-auto" onClick={() => { navigate("/"); }}>
                    <img src={logo} alt="logo" height="40px" />
                    <h1 className="text-blue-900 fw-bold ms-2">TCF Alumni Pathways</h1>
                </Navbar.Brand>
            </Navbar >
        </>
    );
};

export default Sidebar;