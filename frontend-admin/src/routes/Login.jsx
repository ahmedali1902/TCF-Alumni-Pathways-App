import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

import logo from "../assets/tcf_logo.svg";

const Login = () => {
    const { user, login, error, isLoading } = useAuth();
    const [isLogged, setIsLogged] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (user) {
            setSuccessMessage("An account is already logged in! Redirecting...");
            setTimeout(() => {
                navigate("/");
                window.location.reload();
            }, 2000);
            return;
        }
        setIsLogged(false);
        await login(formData.email, formData.password);
        setIsLogged(true);
    };

    useEffect(() => {
        if (isLogged && !error) {
            setSuccessMessage("Logged in successfully! Redirecting...");
            setTimeout(() => {
                navigate("/");
                window.location.reload();
            }, 2000);
        }
    }, [isLogged, error, navigate]);

    // If user is already logged in, redirect to dashboard
    useEffect(() => {
        if (user && !isLoading) {
            navigate("/");
        }
    }, [user, isLoading, navigate]);

    return (
        <Container fluid style={{ 
            minHeight: '100vh',
            background: 'var(--bg-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6} xl={4}>
                        <div style={{
                            background: 'var(--bg-card)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            boxShadow: 'var(--shadow-xl)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            padding: '40px',
                            textAlign: 'center'
                        }}>
                            {/* Logo and Header */}
                            <div className="mb-4">
                                <img src={logo} alt="TCF Logo" height="60px" className="mb-3" />
                                <h1 style={{ 
                                    fontSize: '2rem', 
                                    fontWeight: '700',
                                    color: 'var(--gray-800)',
                                    marginBottom: '8px'
                                }}>
                                    Admin Login
                                </h1>
                                <p style={{ 
                                    color: 'var(--gray-600)', 
                                    fontSize: '1rem',
                                    margin: 0
                                }}>
                                    Sign in to access the admin panel
                                </p>
                            </div>

                            <Form onSubmit={handleLogin}>
                                {error && (
                                    <Alert variant="danger" className="mb-4">
                                        <i className="fa-solid fa-exclamation-triangle me-2" />
                                        {error}
                                    </Alert>
                                )}
                                {successMessage && (
                                    <Alert variant="success" className="mb-4">
                                        <i className="fa-solid fa-check-circle me-2" />
                                        {successMessage}
                                    </Alert>
                                )}

                                <div className="text-start">
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                            Email Address
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="my-card-input"
                                            style={{ 
                                                padding: '12px 16px',
                                                fontSize: '1rem',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                            Password
                                        </Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="my-card-input"
                                                style={{ 
                                                    padding: '12px 16px',
                                                    paddingRight: '45px',
                                                    fontSize: '1rem',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="position-absolute"
                                                style={{
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--gray-500)',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    fontSize: '1rem'
                                                }}
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} />
                                            </button>
                                        </div>
                                    </Form.Group>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isLoading}
                                    className="w-100 btn-modern"
                                    style={{ 
                                        padding: '12px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        borderRadius: '8px'
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-sign-in-alt me-2" />
                                            Sign In
                                        </>
                                    )}
                                </Button>
                            </Form>

                            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
                                <p style={{ 
                                    color: 'var(--gray-500)', 
                                    fontSize: '0.9rem',
                                    margin: 0
                                }}>
                                    <i className="fa-solid fa-shield-alt me-1" />
                                    Secure admin access only
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
};

export default Login;
