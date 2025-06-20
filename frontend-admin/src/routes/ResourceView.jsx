import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ResourceModal from '../components/ResourceModal';
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

const ResourceView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [resource, setResource] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalMessage, setDeleteModalMessage] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    const getResource = async () => {
        try {
            setIsLoading(true);
            setMessage("");
            
            const response = await axios.get(`${API_BASE_URL}/resource/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setResource(response.data.data);
        } catch (error) {
            console.error('Error fetching resource:', error);
            setMessage("Error loading resource: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setDeleteModalMessage("Are you sure you want to delete this resource?");
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/resource/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setDeleteModalMessage("Resource deleted successfully");
            setTimeout(() => {
                navigate('/resources');
            }, 2000);
        } catch (error) {
            setDeleteModalMessage("Error deleting resource: " + (error.response?.data?.message || error.message));
            setTimeout(() => {
                setDeleteModalMessage("");
                setShowDeleteModal(false);
            }, 2000);
        }
    };

    const handleResourceUpdated = () => {
        // Refresh the resource data when updated
        getResource();
    };

    const getEducationLevelLabel = (level) => {
        switch (level) {
            case 1: return 'Matriculation';
            case 2: return 'Intermediate';
            default: return 'Unknown';
        }
    };

    const getCategoryLabel = (category) => {
        switch (category) {
            case 1: return 'General';
            case 2: return 'Scholarship';
            default: return 'Unknown';
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

    useEffect(() => {
        if (!user) {
            setMessage("Please login first!");
            setIsLoading(false);
        } else if (!id) {
            setMessage("Resource ID is required!");
            setIsLoading(false);
        } else {
            getResource();
        }
    }, [user, id]);

    if (isLoading) {
        return (
            <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
                <Sidebar />
                <Container style={{ marginTop: '100px', paddingBottom: '40px' }}>
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <div className="mt-3" style={{ color: 'var(--gray-800)' }}>Loading resource...</div>
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
                            <i className="fa-solid fa-book-open me-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                            Resource Details
                        </h1>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '1rem',
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            View and manage resource information
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="info" 
                            onClick={() => navigate('/resources')}
                            className="btn-modern d-flex align-items-center"
                        >
                            <i className="fa-solid fa-arrow-left me-2" />
                            Back to Resources
                        </Button>
                        {resource && (
                            <>
                                <Button 
                                    variant="warning" 
                                    onClick={() => setShowEditModal(true)}
                                    className="btn-modern d-flex align-items-center"
                                >
                                    <i className="fa-solid fa-edit me-2" />
                                    Edit
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
                        variant={message.includes('error') ? 'danger' : 'info'} 
                        className="mb-4"
                        style={{ 
                            cursor: message.includes('login') ? 'pointer' : 'default',
                            fontWeight: 'bold'
                        }}
                        onClick={() => message.includes('login') && navigate('/login')}
                    >
                        {message}
                        {message.includes('login') && <i className="fa-solid fa-external-link-alt ms-2" />}
                    </Alert>
                )}

                {resource && (
                    <Row className="g-4">
                        {/* Resource Information */}
                        <Col lg={8}>
                            <div className="modern-card">
                                <div className="card-header">
                                    <h4>
                                        <i className="fa-solid fa-book-open me-2" style={{ color: 'var(--primary-color)' }} />
                                        Resource Information
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
                                                <Col md={12}>
                                                    <div className="mb-3">
                                                        <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Title</label>
                                                        <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px', fontSize: '1.1rem', fontWeight: '500' }}>
                                                            {resource.title}
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Education Level</label>
                                                        <div style={{ marginTop: '8px' }}>
                                                            <Badge 
                                                                bg={resource.education_level === 1 ? 'primary' : 'info'}
                                                                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                                            >
                                                                {getEducationLevelLabel(resource.education_level)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Category</label>
                                                        <div style={{ marginTop: '8px' }}>
                                                            <Badge 
                                                                bg={resource.category === 1 ? 'success' : 'warning'}
                                                                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                                            >
                                                                {getCategoryLabel(resource.category)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>

                                        {/* Content Section */}
                                        <Col xs={12}>
                                            <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--success-color)', paddingBottom: '8px' }}>
                                                <i className="fa-solid fa-file-text me-2" style={{ color: 'var(--success-color)' }} />
                                                Content
                                            </h6>
                                            <div style={{ 
                                                padding: '16px', 
                                                background: 'var(--gray-50)', 
                                                borderRadius: '8px', 
                                                minHeight: '80px', 
                                                lineHeight: '1.6',
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {resource.content}
                                            </div>
                                        </Col>

                                        {/* External Link Section */}
                                        {resource.link && (
                                            <Col xs={12}>
                                                <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--info-color)', paddingBottom: '8px' }}>
                                                    <i className="fa-solid fa-link me-2" style={{ color: 'var(--info-color)' }} />
                                                    External Link
                                                </h6>
                                                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                                                    <a 
                                                        href={resource.link} 
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
                                                        {resource.link}
                                                    </a>
                                                </div>
                                            </Col>
                                        )}
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
                                            Resource ID
                                        </label>
                                        <div style={{ 
                                            fontSize: '0.85rem',
                                            color: 'var(--gray-600)',
                                            fontFamily: 'monospace',
                                            backgroundColor: 'var(--gray-100)',
                                            padding: '4px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {resource.id}
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
                                            {formatDate(resource.created_at)}
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
                                            {formatDate(resource.updated_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                )}

                {/* Edit Resource Modal */}
                {resource && (
                    <ResourceModal 
                        show={showEditModal} 
                        onHide={() => setShowEditModal(false)}
                        onSuccess={handleResourceUpdated}
                        resource={resource}
                    />
                )}

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton style={{ borderBottom: '1px solid var(--gray-200)' }}>
                        <Modal.Title style={{ color: 'var(--gray-800)', fontWeight: '600' }}>
                            <i className="fa-solid fa-exclamation-triangle me-2" style={{ color: 'var(--danger-color)' }} />
                            Delete Resource
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '24px' }}>
                        {deleteModalMessage ? (
                            <Alert variant={deleteModalMessage.includes('successfully') ? 'success' : 'danger'}>
                                {deleteModalMessage}
                            </Alert>
                        ) : (
                            <div style={{ color: 'var(--gray-700)' }}>
                                Are you sure you want to delete this resource? This action cannot be undone.
                                {resource && (
                                    <div className="mt-3 p-3" style={{ 
                                        backgroundColor: 'var(--gray-50)', 
                                        borderRadius: '8px',
                                        border: '1px solid var(--gray-200)'
                                    }}>
                                        <strong>Resource:</strong> {resource.title}
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: '1px solid var(--gray-200)', padding: '16px 24px' }}>
                        <Button 
                            variant="outline-secondary" 
                            onClick={() => setShowDeleteModal(false)}
                            className="btn-modern"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={handleDeleteConfirm}
                            className="btn-modern"
                        >
                            Delete Resource
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    );
};

export default ResourceView; 