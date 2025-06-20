import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

const AppFeedbackView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalMessage, setDeleteModalMessage] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    // Reason type mapping
    const REASON_TYPES = {
        1: "General",
        2: "Complaint",
        3: "Suggestion",
        4: "Other"
    };

    const getFeedback = async () => {
        try {
            setIsLoading(true);
            setMessage("");
            
            const response = await axios.get(`${API_BASE_URL}/app-feedback/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setFeedback(response.data.data);
        } catch (error) {
            console.error('Error fetching feedback:', error);
            setMessage("Error loading feedback: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setDeleteModalMessage("Are you sure you want to delete this feedback?");
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/app-feedback/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setDeleteModalMessage("Feedback deleted successfully");
            setTimeout(() => {
                navigate('/feedback');
            }, 2000);
        } catch (error) {
            setDeleteModalMessage("Error deleting feedback: " + (error.response?.data?.message || error.message));
            setTimeout(() => {
                setDeleteModalMessage("");
                setShowDeleteModal(false);
            }, 2000);
        }
    };

    const handleToggleProcessed = async () => {
        try {
            await axios.put(`${API_BASE_URL}/app-feedback/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Refresh the feedback data
            getFeedback();
        } catch (error) {
            setMessage("Error updating feedback: " + (error.response?.data?.message || error.message));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`fa-solid fa-star ${i <= rating ? 'text-warning' : 'text-muted'}`}
                    style={{ fontSize: '1.2rem', marginRight: '4px' }}
                />
            );
        }
        return <div className="d-flex align-items-center">{stars}</div>;
    };

    useEffect(() => {
        if (!user) {
            setMessage("Please login first!");
            setIsLoading(false);
        } else if (!id) {
            setMessage("Feedback ID is required!");
            setIsLoading(false);
        } else {
            getFeedback();
        }
    }, [user, id]);

    if (isLoading) {
        return (
            <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
                <Sidebar />
                <Container style={{ marginTop: '100px', paddingBottom: '40px' }}>
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <div className="mt-3" style={{ color: 'var(--gray-800)' }}>Loading feedback...</div>
                    </div>
                </Container>
            </Container>
        );
    }

    return (
        <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
            <Sidebar />
            <Container style={{ marginTop: '100px', paddingBottom: '40px' }}>
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '8px',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                        }}>
                            <i className="fa-solid fa-comments me-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                            App Feedback Details
                        </h1>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '1rem',
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            View and manage user feedback
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="info" 
                            onClick={() => navigate('/feedback')}
                            className="btn-modern d-flex align-items-center"
                        >
                            <i className="fa-solid fa-arrow-left me-2" />
                            Back to Feedback
                        </Button>
                        {feedback && (
                            <>
                                <Button 
                                    variant={feedback.processed ? "warning" : "success"}
                                    onClick={handleToggleProcessed}
                                    className="btn-modern d-flex align-items-center"
                                >
                                    <i className={`fa-solid ${feedback.processed ? "fa-undo" : "fa-check"} me-2`} />
                                    {feedback.processed ? "Mark as Pending" : "Mark as Processed"}
                                </Button>
                                <Button 
                                    variant="danger" 
                                    onClick={handleDeleteClick}
                                    className="btn-modern d-flex align-items-center"
                                >
                                    <i className="fa-solid fa-trash me-2" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {message && (
                    <Alert 
                        variant={message.includes('error') || message.includes('Error') ? 'danger' : 'info'} 
                        className="mb-4"
                    >
                        <i className={`fa-solid ${message.includes('error') || message.includes('Error') ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2`} />
                        {message}
                    </Alert>
                )}

                {feedback && (
                    <Row className="g-4">
                        <Col lg={8}>
                            {/* User Information Card */}
                            <div className="modern-card mb-4">
                                <div className="card-header">
                                    <h4>
                                        <i className="fa-solid fa-user me-2" style={{ color: 'var(--primary-color)' }} />
                                        User Information
                                    </h4>
                                </div>
                                <div className="card-body">
                                    <Row className="g-4">
                                        {/* Basic User Info Section */}
                                        <Col xs={12}>
                                            <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                                                <i className="fa-solid fa-info-circle me-2" style={{ color: 'var(--primary-color)' }} />
                                                Basic Information
                                            </h6>
                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>User Name</label>
                                                        <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px', fontSize: '1.1rem', fontWeight: '500' }}>
                                                            {feedback.user_name || 'Anonymous'}
                                                            {feedback.is_tcf_alumni && (
                                                                <Badge bg="info" className="ms-2" style={{ fontSize: '0.7rem' }}>
                                                                    TCF Alumni
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>WhatsApp Number</label>
                                                        <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                                                            {feedback.whatsapp_number ? (
                                                                <span>
                                                                    <i className="fa-brands fa-whatsapp me-2" style={{ color: '#25D366' }} />
                                                                    {feedback.whatsapp_number}
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: 'var(--gray-500)' }}>Not provided</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Feedback Type</label>
                                                        <div style={{ marginTop: '8px' }}>
                                                            <Badge 
                                                                bg="secondary"
                                                                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                                            >
                                                                {REASON_TYPES[feedback.reason_type]}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Experience Rating</label>
                                                        <div style={{ marginTop: '8px' }}>
                                                            {feedback.experience_rating > 0 ? (
                                                                <div style={{ fontSize: '1.2rem' }}>
                                                                    {renderStars(feedback.experience_rating)}
                                                                    <span className="ms-2" style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                                                                        ({feedback.experience_rating}/5)
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span style={{ color: 'var(--gray-500)' }}>No rating provided</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                            </div>

                            {/* Feedback Content Card */}
                            <div className="modern-card">
                                <div className="card-header">
                                    <h4>
                                        <i className="fa-solid fa-comment-dots me-2" style={{ color: 'var(--success-color)' }} />
                                        Feedback Content
                                    </h4>
                                </div>
                                <div className="card-body">
                                    <Row className="g-4">
                                        {/* Custom Reason (if Other) */}
                                        {feedback.reason_type === 4 && feedback.reason_if_other && (
                                            <Col xs={12}>
                                                <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--warning-color)', paddingBottom: '8px' }}>
                                                    <i className="fa-solid fa-tag me-2" style={{ color: 'var(--warning-color)' }} />
                                                    Custom Reason
                                                </h6>
                                                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                                    "{feedback.reason_if_other}"
                                                </div>
                                            </Col>
                                        )}

                                        {/* Feedback Text */}
                                        <Col xs={12}>
                                            <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--success-color)', paddingBottom: '8px' }}>
                                                <i className="fa-solid fa-message me-2" style={{ color: 'var(--success-color)' }} />
                                                Feedback Message
                                            </h6>
                                            <div style={{ 
                                                padding: '16px', 
                                                background: 'var(--gray-50)', 
                                                borderRadius: '8px', 
                                                minHeight: '80px', 
                                                lineHeight: '1.6',
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {feedback.feedback_text || 'No feedback message provided'}
                                            </div>
                                        </Col>

                                        {/* Processing Status Section */}
                                        <Col xs={12}>
                                            <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--info-color)', paddingBottom: '8px' }}>
                                                <i className="fa-solid fa-cog me-2" style={{ color: 'var(--info-color)' }} />
                                                Processing Status
                                            </h6>
                                            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                                <Badge 
                                                    bg={feedback.processed ? "success" : "warning"}
                                                    style={{ fontSize: '1rem', padding: '8px 16px' }}
                                                >
                                                    <i className={`fa-solid ${feedback.processed ? "fa-check-circle" : "fa-clock"} me-2`} />
                                                    {feedback.processed ? "Processed" : "Pending"}
                                                </Badge>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>

                        {/* Metadata */}
                        <Col lg={4}>
                            <div className="modern-card">
                                <div className="card-header">
                                    <h5>
                                        <i className="fa-solid fa-clock me-2" style={{ color: 'var(--info-color)' }} />
                                        Metadata
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label style={{ 
                                            fontWeight: '600', 
                                            color: 'var(--gray-700)', 
                                            marginBottom: '4px',
                                            display: 'block',
                                            fontSize: '0.9rem'
                                        }}>
                                            Feedback ID
                                        </label>
                                        <div style={{ 
                                            fontSize: '0.85rem',
                                            color: 'var(--gray-600)',
                                            fontFamily: 'monospace',
                                            backgroundColor: 'var(--gray-100)',
                                            padding: '4px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {feedback.id}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label style={{ 
                                            fontWeight: '600', 
                                            color: 'var(--gray-700)', 
                                            marginBottom: '4px',
                                            display: 'block',
                                            fontSize: '0.9rem'
                                        }}>
                                            Created At
                                        </label>
                                        <div style={{ 
                                            fontSize: '0.85rem',
                                            color: 'var(--gray-600)'
                                        }}>
                                            {formatDate(feedback.created_at)}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ 
                                            fontWeight: '600', 
                                            color: 'var(--gray-700)', 
                                            marginBottom: '4px',
                                            display: 'block',
                                            fontSize: '0.9rem'
                                        }}>
                                            Last Updated
                                        </label>
                                        <div style={{ 
                                            fontSize: '0.85rem',
                                            color: 'var(--gray-600)'
                                        }}>
                                            {formatDate(feedback.updated_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                )}
            </Container>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fa-solid fa-exclamation-triangle text-warning me-2" />
                        Confirm Delete
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{deleteModalMessage}</p>
                </Modal.Body>
                <Modal.Footer>
                    {deleteModalMessage.includes("successfully") || deleteModalMessage.includes("Error") ? (
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Close
                        </Button>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleDeleteConfirm}>
                                <i className="fa-solid fa-trash me-2" />
                                Delete
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AppFeedbackView;
