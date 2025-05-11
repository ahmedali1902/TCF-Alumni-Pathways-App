import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

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
            setAuthError("An account is already logged in! Redirecting...");
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
    }, [isLogged, error]);

    return (
        <Container fluid className="p-0">
            <Sidebar />
            <Container className="text-center mt-5 pb-5">
                <h1 className="text-blue-900 fw-semibold">Login</h1>
                <Row className="justify-content-center mt-4">
                    <Col xs={11} md={8} lg={4}>
                        <div className="my-card p-4">
                            <Form onSubmit={handleLogin}>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="alert alert-success" role="alert">
                                        {successMessage}
                                    </div>
                                )}
                                <Form.Group controlId="formEmail">
                                    <Form.Control
                                        type="email"
                                        placeholder="Email"
                                        className="my-card-input my-3 py-2 px-4"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group controlId="formPassword" className="position-relative">
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="my-card-input my-3 py-2 px-4"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <div
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                                    </div>
                                </Form.Group>
                                <Button
                                    type="submit"
                                    className="green-bg w-100 py-2 mb-2"
                                    tabIndex={0}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Logging in..." : "Login"}
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
};

export default Login;
