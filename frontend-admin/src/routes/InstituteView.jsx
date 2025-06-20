import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext";

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
    const [editData, setEditData] = useState({});
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
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
            setEditData({
                name: data.name,
                managing_authority: data.managing_authority,
                description: data.description || '',
                tcf_rating: data.tcf_rating,
                latitude: data.location?.coordinates?.[1] || 0,
                longitude: data.location?.coordinates?.[0] || 0,
                faculties: data.faculties || []
            });
            setMessage("");
        } catch (error) {
            console.error(error);
            setMessage("An error occurred while fetching institute data: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setMessage("Updating institute...");
            const updatePayload = {
                ...editData,
                faculties: editData.faculties.map(faculty => ({
                    name: faculty.name,
                    average_result_percentage_required: faculty.average_result_percentage_required || 0,
                    gender: faculty.gender
                }))
            };
            
            const response = await axios.put(`${API_BASE_URL}/institute/${id}`, updatePayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                setMessage("Institute updated successfully!");
                setIsEditing(false);
                fetchInstituteData(); // Refresh data
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (error) {
            console.error(error);
            setMessage("Error updating institute: " + (error.response?.data?.message || error.message));
        }
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

    const addFaculty = () => {
        setEditData({
            ...editData,
            faculties: [...editData.faculties, {
                name: '',
                average_result_percentage_required: 0,
                gender: 3 // Default to coeducation
            }]
        });
    };

    const removeFaculty = (index) => {
        const newFaculties = editData.faculties.filter((_, i) => i !== index);
        setEditData({ ...editData, faculties: newFaculties });
    };

    const updateFaculty = (index, field, value) => {
        const newFaculties = [...editData.faculties];
        newFaculties[index] = { ...newFaculties[index], [field]: value };
        setEditData({ ...editData, faculties: newFaculties });
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
            <Container fluid className="p-0">
                <Sidebar />
                <Container className="text-center" style={{ marginTop: '100px' }}>
                    <Spinner animation="border" variant="primary" />
                    <h4 className="mt-3" style={{ color: 'var(--gray-600)' }}>Loading institute details...</h4>
                </Container>
            </Container>
        );
    }

    return (
        <Container fluid className="p-0">
            <Sidebar />
            <Container style={{ marginTop: '100px', paddingBottom: '40px' }}>
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700',
                            color: 'var(--gray-800)',
                            marginBottom: '8px'
                        }}>
                            <i className="fa-solid fa-building-columns me-3" style={{ color: 'var(--success-color)' }} />
                            {instituteData.name || 'Institute Details'}
                        </h1>
                        <p style={{ 
                            color: 'var(--gray-600)', 
                            fontSize: '1rem',
                            margin: 0
                        }}>
                            {isEditing ? 'Edit institute information' : 'View and manage institute details'}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="outline-primary" 
                            onClick={() => navigate('/institutes')} 
                            className="btn-modern d-flex align-items-center"
                        >
                            <i className="fa-solid fa-arrow-left me-2" />Back to Institutes
                        </Button>
                        {!isEditing ? (
                            <>
                                <Button 
                                    variant="warning" 
                                    onClick={() => setIsEditing(true)} 
                                    className="btn-modern d-flex align-items-center"
                                    style={{ background: 'var(--warning-gradient)' }}
                                >
                                    <i className="fa-solid fa-edit me-2" />Edit
                                </Button>
                                <Button 
                                    variant="danger" 
                                    onClick={() => setShowDeleteModal(true)}
                                    className="btn-modern d-flex align-items-center"
                                    style={{ background: 'var(--danger-gradient)' }}
                                >
                                    <i className="fa-solid fa-trash me-2" />Delete
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button 
                                    variant="success" 
                                    onClick={handleUpdate} 
                                    className="btn-modern d-flex align-items-center"
                                    style={{ background: 'var(--success-gradient)' }}
                                >
                                    <i className="fa-solid fa-save me-2" />Save Changes
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditData({
                                            name: instituteData.name,
                                            managing_authority: instituteData.managing_authority,
                                            description: instituteData.description || '',
                                            tcf_rating: instituteData.tcf_rating,
                                            latitude: instituteData.location?.coordinates?.[1] || 0,
                                            longitude: instituteData.location?.coordinates?.[0] || 0,
                                            faculties: instituteData.faculties || []
                                        });
                                    }}
                                    className="btn-modern d-flex align-items-center"
                                >
                                    <i className="fa-solid fa-times me-2" />Cancel
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
                            {/* Basic Information Card */}
                            <div className="modern-card mb-4">
                                <div className="card-header">
                                    <h4>
                                        <i className="fa-solid fa-info-circle me-2" style={{ color: 'var(--primary-color)' }} />
                                        Basic Information
                                    </h4>
                                </div>
                                <div className="card-body">
                                    {!isEditing ? (
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
                                                            bg={instituteData.managing_authority === 1 ? 'success' : 'primary'}
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
                                                            bg="warning" 
                                                            text="dark"
                                                            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                                                        >
                                                            <i className="fa-solid fa-star me-1" />
                                                            {instituteData.tcf_rating?.toFixed(1)} / 5.0
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={12}>
                                                <div className="mb-3">
                                                    <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Description</label>
                                                    <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px', minHeight: '60px' }}>
                                                        {instituteData.description || 'No description available'}
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>Institute Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={editData.name}
                                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                                        className="my-card-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>Managing Authority</Form.Label>
                                                    <Form.Select
                                                        value={editData.managing_authority}
                                                        onChange={(e) => setEditData({...editData, managing_authority: parseInt(e.target.value)})}
                                                        className="my-card-input"
                                                    >
                                                        <option value={1}>Public</option>
                                                        <option value={2}>Private</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>TCF Rating (0-5)</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        max="5"
                                                        step="0.1"
                                                        value={editData.tcf_rating}
                                                        onChange={(e) => setEditData({...editData, tcf_rating: parseFloat(e.target.value)})}
                                                        className="my-card-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>Description</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        value={editData.description}
                                                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                                                        className="my-card-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="modern-card">
                                <div className="card-header">
                                    <h4>
                                        <i className="fa-solid fa-map-marker-alt me-2" style={{ color: 'var(--info-color)' }} />
                                        Location
                                    </h4>
                                </div>
                                <div className="card-body">
                                    {!isEditing ? (
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Latitude</label>
                                                    <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                                                        {instituteData.location?.coordinates?.[1]}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Longitude</label>
                                                    <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                                                        {instituteData.location?.coordinates?.[0]}
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>Latitude</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        step="any"
                                                        value={editData.latitude}
                                                        onChange={(e) => setEditData({...editData, latitude: parseFloat(e.target.value)})}
                                                        className="my-card-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>Longitude</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        step="any"
                                                        value={editData.longitude}
                                                        onChange={(e) => setEditData({...editData, longitude: parseFloat(e.target.value)})}
                                                        className="my-card-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Faculties Card */}
                        <Col lg={4}>
                            <div className="modern-card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h4>
                                        <i className="fa-solid fa-graduation-cap me-2" style={{ color: 'var(--warning-color)' }} />
                                        Faculties
                                    </h4>
                                    {isEditing && (
                                        <Button 
                                            variant="success" 
                                            size="sm" 
                                            onClick={addFaculty}
                                            className="btn-modern"
                                            style={{ background: 'var(--success-gradient)' }}
                                        >
                                            <i className="fa-solid fa-plus" />
                                        </Button>
                                    )}
                                </div>
                                <div className="card-body p-0">
                                    {(isEditing ? editData.faculties : instituteData.faculties)?.length > 0 ? (
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {(isEditing ? editData.faculties : instituteData.faculties).map((faculty, index) => (
                                                <div key={index} style={{ 
                                                    padding: '16px', 
                                                    borderBottom: index < (isEditing ? editData.faculties : instituteData.faculties).length - 1 ? '1px solid var(--gray-200)' : 'none' 
                                                }}>
                                                    {!isEditing ? (
                                                        <>
                                                            <div style={{ fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>
                                                                {faculty.name}
                                                            </div>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                                <div>Required Avg: {faculty.average_result_percentage_required || 0}%</div>
                                                                <div>Gender: {GENDER[faculty.gender]}</div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Form.Group className="mb-2">
                                                                <Form.Control
                                                                    type="text"
                                                                    placeholder="Faculty name"
                                                                    value={faculty.name}
                                                                    onChange={(e) => updateFaculty(index, 'name', e.target.value)}
                                                                    className="my-card-input"
                                                                />
                                                            </Form.Group>
                                                            <Row className="g-2">
                                                                <Col>
                                                                    <Form.Group className="mb-2">
                                                                        <Form.Control
                                                                            type="number"
                                                                            placeholder="Required %"
                                                                            min="0"
                                                                            max="100"
                                                                            value={faculty.average_result_percentage_required || 0}
                                                                            onChange={(e) => updateFaculty(index, 'average_result_percentage_required', parseFloat(e.target.value))}
                                                                            className="my-card-input"
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col>
                                                                    <Form.Group className="mb-2">
                                                                        <Form.Select
                                                                            value={faculty.gender}
                                                                            onChange={(e) => updateFaculty(index, 'gender', parseInt(e.target.value))}
                                                                            className="my-card-input"
                                                                        >
                                                                            <option value={1}>Male Only</option>
                                                                            <option value={2}>Female Only</option>
                                                                            <option value={3}>Coeducation</option>
                                                                        </Form.Select>
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col xs="auto">
                                                                    <Button 
                                                                        variant="outline-danger" 
                                                                        size="sm" 
                                                                        onClick={() => removeFaculty(index)}
                                                                        className="btn-modern"
                                                                    >
                                                                        <i className="fa-solid fa-trash" />
                                                                    </Button>
                                                                </Col>
                                                            </Row>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4" style={{ color: 'var(--gray-500)' }}>
                                            <i className="fa-solid fa-graduation-cap fa-2x mb-3" style={{ color: 'var(--gray-300)' }} />
                                            <div>No faculties available</div>
                                            {isEditing && (
                                                <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                                                    Click the + button to add faculties
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                )}

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