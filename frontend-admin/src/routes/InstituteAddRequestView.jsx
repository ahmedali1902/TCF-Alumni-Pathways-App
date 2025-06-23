import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext";
import { formatDate } from '../utils/dateUtils';
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

const InstituteAddRequestView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [request, setRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalMessage, setDeleteModalMessage] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    const getRequest = async () => {
        try {
            setIsLoading(true);
            setMessage("");
            
            const response = await axios.get(`${API_BASE_URL}/institute/add-request/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setRequest(response.data.data);
        } catch (error) {
            console.error('Error fetching request:', error);
            setMessage("Error loading request: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setDeleteModalMessage("Are you sure you want to delete this institute add request?");
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/institute/add-request/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setDeleteModalMessage("Request deleted successfully");
            setTimeout(() => {
                navigate('/institute-requests');
            }, 2000);
        } catch (error) {
            setDeleteModalMessage("Error deleting request: " + (error.response?.data?.message || error.message));
            setTimeout(() => {
                setDeleteModalMessage("");
                setShowDeleteModal(false);
            }, 2000);
        }
    };

    const handleToggleProcessed = async () => {
        try {
            await axios.put(`${API_BASE_URL}/institute/add-request/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Refresh the request data
            getRequest();
        } catch (error) {
            setMessage("Error updating request: " + (error.response?.data?.message || error.message));
        }
    };



    useEffect(() => {
        if (!user) {
            setMessage("Please login first!");
            setIsLoading(false);
        } else if (!id) {
            setMessage("Request ID is required!");
            setIsLoading(false);
        } else {
            getRequest();
        }
    }, [user, id]);

    if (isLoading) {
        return (
            <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
                <Sidebar />
                <Container style={{ marginTop: '100px', paddingBottom: '40px' }}>
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <div className="mt-3" style={{ color: 'var(--gray-800)' }}>Loading request...</div>
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
                            <i className="fa-solid fa-clipboard-list me-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                            Institute Add Request Details
                        </h1>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '1rem',
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            View and manage institute addition request
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="info" 
                            onClick={() => navigate('/institute-requests')}
                            className="btn-modern d-flex align-items-center"
                        >
                            <i className="fa-solid fa-arrow-left me-2" />
                            Back to Requests
                        </Button>
                        {request && (
                            <>
                                <Button 
                                    variant={request.processed ? "warning" : "success"}
                                    onClick={handleToggleProcessed}
                                    className="btn-modern d-flex align-items-center"
                                >
                                    <i className={`fa-solid ${request.processed ? "fa-undo" : "fa-check"} me-2`} />
                                    {request.processed ? "Mark as Pending" : "Mark as Processed"}
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

                {request && (
                    <Row className="g-4">
                        <Col lg={8}>
                            {/* Request Information Card */}
                            <div className="modern-card">
                                <div className="card-header">
                                    <h4>
                                        <i className="fa-solid fa-building-columns me-2" style={{ color: 'var(--primary-color)' }} />
                                        Institute Information
                                    </h4>
                                </div>
                                <div className="card-body">
                                    <Row className="g-4">
                                        {/* Basic Information Section */}
                                        <Col xs={12}>
                                            <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                                                <i className="fa-solid fa-info-circle me-2" style={{ color: 'var(--primary-color)' }} />
                                                Basic Information
                                            </h6>
                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Institute Name</label>
                                                        <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px', fontSize: '1.1rem', fontWeight: '500' }}>
                                                            {request.institute_name}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Faculty Name</label>
                                                        <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                                                            {request.faculty_name}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={12}>
                                                    <div className="mb-3">
                                                        <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Institute Address</label>
                                                        <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px', lineHeight: '1.5' }}>
                                                            {request.institute_address}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>

                                        {/* Map Link Section */}
                                        {request.institute_map_link && (
                                            <Col xs={12}>
                                                <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--info-color)', paddingBottom: '8px' }}>
                                                    <i className="fa-solid fa-map-marker-alt me-2" style={{ color: 'var(--info-color)' }} />
                                                    Location
                                                </h6>
                                                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                                    <a 
                                                        href={request.institute_map_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{ 
                                                            color: 'var(--primary-color)', 
                                                            textDecoration: 'none',
                                                            fontSize: '1rem',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-external-link-alt me-2" />
                                                        View Location on Map
                                                    </a>
                                                </div>
                                            </Col>
                                        )}

                                        {/* Processing Status Section */}
                                        <Col xs={12}>
                                            <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--success-color)', paddingBottom: '8px' }}>
                                                <i className="fa-solid fa-cog me-2" style={{ color: 'var(--success-color)' }} />
                                                Processing Status
                                            </h6>
                                            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                                <Badge 
                                                    bg={request.processed ? "success" : "warning"}
                                                    style={{ fontSize: '1rem', padding: '8px 16px' }}
                                                >
                                                    <i className={`fa-solid ${request.processed ? "fa-check-circle" : "fa-clock"} me-2`} />
                                                    {request.processed ? "Processed" : "Pending"}
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
                                            Request ID
                                        </label>
                                        <div style={{ 
                                            fontSize: '0.85rem',
                                            color: 'var(--gray-600)',
                                            fontFamily: 'monospace',
                                            backgroundColor: 'var(--gray-100)',
                                            padding: '4px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {request.id}
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
                                            {formatDate(request.created_at)}
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
                                            {formatDate(request.updated_at)}
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

export default InstituteAddRequestView; 