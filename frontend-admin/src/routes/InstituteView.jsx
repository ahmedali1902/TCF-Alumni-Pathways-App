import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import InstituteModal from '../components/InstituteModal';
import { useAuth } from "../context/AuthContext";
import { formatDate } from '../utils/dateUtils';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';

import axios from "axios";

const InstituteView = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [instituteData, setInstituteData] = useState({});
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    // Enum mappings based on backend model
    const MANAGING_AUTHORITY = {
        1: 'Public',
        2: 'Private'
    };

    const GENDER = {
        1: 'Male Only',
        2: 'Female Only', 
        3: 'Coeducation'
    };

    const fetchInstituteData = async () => {
        try {
            setIsLoading(true);
            setMessage("Loading institute data...");
            const response = await axios.get(`${API_BASE_URL}/institute/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = response.data.data;
            setInstituteData(data);
            setMessage("");
        } catch (error) {
            console.error(error);
            setMessage("An error occurred while fetching institute data: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInstituteUpdated = () => {
        // Refresh the institute data when updated
        fetchInstituteData();
    };

    const handleDelete = async () => {
        try {
            setDeleteMessage("Deleting institute...");
            const response = await axios.delete(`${API_BASE_URL}/institute/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.status === 200) {
                setDeleteMessage("Institute deleted successfully!");
                setTimeout(() => {
                    navigate('/institutes');
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            setDeleteMessage("Error deleting institute: " + (error.response?.data?.message || error.message));
        }
    };





    useEffect(() => {
        if (!user) {
            setMessage("Please login first!");
            setIsLoading(false);
        } else {
            fetchInstituteData();
        }
    }, [user, id]);

    if (isLoading) {
        return (
            <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
                <Sidebar />
                <Container className="text-center" style={{ marginTop: '100px' }}>
                    <Spinner animation="border" variant="primary" />
                    <h4 className="mt-3" style={{ color: 'white' }}>Loading institute details...</h4>
                </Container>
            </Container>
        );
    }

    return (
        <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
            <Sidebar />
            <Container style={{ marginTop: '100px', paddingBottom: '40px' }}>
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '8px',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                        }}>
                            <i className="fa-solid fa-building-columns me-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                            {instituteData.name || 'Institute Details'}
                        </h1>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '1rem',
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            View and manage institute details
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="info" 
                            onClick={() => navigate('/institutes')} 
                            className="btn-modern d-flex align-items-center"
                        >
                            <i className="fa-solid fa-arrow-left me-2" />Back to Institutes
                        </Button>
                        {instituteData && Object.keys(instituteData).length > 0 && (
                            <>
                                <Button 
                                    variant="warning" 
                                    onClick={() => setShowEditModal(true)} 
                                    className="btn-modern d-flex align-items-center"
                                >
                                    <i className="fa-solid fa-edit me-2" />Edit
                                </Button>
                                <Button 
                                    variant="danger" 
                                    onClick={() => setShowDeleteModal(true)}
                                    className="btn-modern d-flex align-items-center"
                                >
                                    <i className="fa-solid fa-trash me-2" />Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {message && (
                    <Alert variant={message.includes('successfully') ? 'success' : 'danger'} className="mb-4">
                        {message}
                    </Alert>
                )}

                {Object.keys(instituteData).length > 0 && (
                    <Row className="g-4">
                        <Col lg={8}>
                            {/* Institute Information Card */}
                            <div className="modern-card">
                                <div className="card-header">
                                    <h4>
                                        <i className="fa-solid fa-building-columns me-2" style={{ color: 'var(--primary-color)' }} />
                                        Institute Information
                                    </h4>
                                </div>
                                <div className="card-body">
                                    <Row className="g-4">
                                            {/* Basic Info Section */}
                                            <Col xs={12}>
                                                <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                                                    <i className="fa-solid fa-info-circle me-2" style={{ color: 'var(--primary-color)' }} />
                                                    Basic Information
                                                </h6>
                                                <Row className="g-3">
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Institute Name</label>
                                                            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                                                                {instituteData.name}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Managing Authority</label>
                                                            <div style={{ marginTop: '8px' }}>
                                                                <Badge 
                                                                    bg={instituteData.managing_authority === 1 ? 'info' : 'warning'}
                                                                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                                                >
                                                                    {MANAGING_AUTHORITY[instituteData.managing_authority]}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>TCF Rating</label>
                                                            <div style={{ marginTop: '8px' }}>
                                                                <Badge 
                                                                    bg="success" 
                                                                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                                                >
                                                                    <i className="fa-solid fa-star me-1" />
                                                                    {instituteData.tcf_rating?.toFixed(1)} / 5.0
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Col>

                                            {/* Location Section */}
                                            <Col xs={12}>
                                                <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--info-color)', paddingBottom: '8px' }}>
                                                    <i className="fa-solid fa-map-marker-alt me-2" style={{ color: 'var(--info-color)' }} />
                                                    Location
                                                </h6>
                                                <Row className="g-3">
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Latitude</label>
                                                            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                                                                {instituteData.location?.coordinates?.[1] || 'Not specified'}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Longitude</label>
                                                            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                                                                {instituteData.location?.coordinates?.[0] || 'Not specified'}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Col>

                                            {/* Description Section */}
                                            <Col xs={12}>
                                                <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--success-color)', paddingBottom: '8px' }}>
                                                    <i className="fa-solid fa-file-text me-2" style={{ color: 'var(--success-color)' }} />
                                                    Description
                                                </h6>
                                                <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', minHeight: '80px', lineHeight: '1.6' }}>
                                                    {instituteData.description || 'No description available'}
                                                </div>
                                            </Col>
                                        </Row>
                                </div>
                            </div>
                        </Col>

                        {/* Faculties & Metadata */}
                        <Col lg={4}>
                            {/* Faculties Card */}
                            <div className="modern-card mb-4">
                                <div className="card-header">
                                    <h5 className="mb-0">
                                        <i className="fa-solid fa-graduation-cap me-2" style={{ color: 'var(--warning-color)' }} />
                                        Faculties
                                        <Badge 
                                            bg="secondary" 
                                            className="ms-2"
                                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                        >
                                            {instituteData.faculties?.length || 0}
                                        </Badge>
                                    </h5>
                                </div>
                                <div className="card-body p-0">
                                    {instituteData.faculties?.length > 0 ? (
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {instituteData.faculties.map((faculty, index) => (
                                                <div 
                                                    key={index} 
                                                    style={{ 
                                                        padding: '16px', 
                                                        borderBottom: index < instituteData.faculties.length - 1 ? '1px solid var(--gray-200)' : 'none',
                                                        background: index % 2 === 0 ? 'rgba(248, 250, 252, 0.5)' : 'white'
                                                    }}
                                                >
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div style={{ 
                                                            fontWeight: '600', 
                                                            color: 'var(--gray-800)', 
                                                            fontSize: '0.95rem'
                                                        }}>
                                                            {faculty.name}
                                                        </div>
                                                        <Badge 
                                                            bg="info" 
                                                            style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                                                        >
                                                            #{index + 1}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                        <div className="mb-1">
                                                            <i className="fa-solid fa-percentage me-1" />
                                                            Required: <strong>{faculty.average_result_percentage_required || 0}%</strong>
                                                        </div>
                                                        <div>
                                                            <Badge 
                                                                bg={faculty.gender === 1 ? 'primary' : faculty.gender === 2 ? 'warning' : 'success'}
                                                                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                                            >
                                                                <i className="fa-solid fa-users me-1" />
                                                                {GENDER[faculty.gender]}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4" style={{ color: 'var(--gray-500)' }}>
                                            <i className="fa-solid fa-graduation-cap fa-2x mb-2" style={{ color: 'var(--gray-300)' }} />
                                            <div style={{ fontSize: '0.9rem' }}>No faculties available</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Institute Metadata */}
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
                                            Institute ID
                                        </label>
                                        <div style={{ 
                                            fontSize: '0.85rem',
                                            color: 'var(--gray-600)',
                                            fontFamily: 'monospace',
                                            backgroundColor: 'var(--gray-100)',
                                            padding: '4px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {instituteData.id}
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
                                            {formatDate(instituteData.created_at)}
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
                                            {formatDate(instituteData.updated_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                )}

                {/* Edit Institute Modal */}
                <InstituteModal 
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    onSuccess={handleInstituteUpdated}
                    institute={instituteData}
                />

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton style={{ borderBottom: '1px solid var(--gray-200)' }}>
                        <Modal.Title style={{ color: 'var(--gray-800)', fontWeight: '600' }}>
                            <i className="fa-solid fa-exclamation-triangle me-2" style={{ color: 'var(--danger-color)' }} />
                            Delete Institute
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '24px' }}>
                        {deleteMessage ? (
                            <Alert variant={deleteMessage.includes('successfully') ? 'success' : 'danger'}>
                                {deleteMessage}
                            </Alert>
                        ) : (
                            <div style={{ color: 'var(--gray-700)' }}>
                                Are you sure you want to delete <strong>{instituteData.name}</strong>? This action cannot be undone.
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
                            onClick={handleDelete} 
                            disabled={deleteMessage.includes('Deleting')}
                            className="btn-modern"
                            style={{ background: 'var(--danger-gradient)' }}
                        >
                            {deleteMessage.includes('Deleting') ? 'Deleting...' : 'Delete Institute'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    )
}

export default InstituteView