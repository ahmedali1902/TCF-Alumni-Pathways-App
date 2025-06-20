import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

const InstituteModal = ({ show, onHide, onSuccess, institute = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        managing_authority: 1,
        description: '',
        tcf_rating: 0,
        latitude: 0,
        longitude: 0,
        faculties: []
    });
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    // Populate form when editing
    useEffect(() => {
        if (institute && show) {
            setFormData({
                name: institute.name || '',
                managing_authority: institute.managing_authority || 1,
                description: institute.description || '',
                tcf_rating: institute.tcf_rating || 0,
                latitude: institute.location?.coordinates?.[1] || 0,
                longitude: institute.location?.coordinates?.[0] || 0,
                faculties: institute.faculties || []
            });
        } else if (!institute && show) {
            // Reset form for create mode
            resetForm();
        }
    }, [institute, show]);

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const addFaculty = () => {
        setFormData({
            ...formData,
            faculties: [...formData.faculties, {
                name: '',
                average_result_percentage_required: 0,
                gender: 3 // Default to coeducation
            }]
        });
    };

    const removeFaculty = (index) => {
        const newFaculties = formData.faculties.filter((_, i) => i !== index);
        setFormData({ ...formData, faculties: newFaculties });
    };

    const updateFaculty = (index, field, value) => {
        const newFaculties = [...formData.faculties];
        newFaculties[index] = { ...newFaculties[index], [field]: value };
        setFormData({ ...formData, faculties: newFaculties });
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setMessage('Institute name is required');
            return false;
        }
        if (formData.tcf_rating < 0 || formData.tcf_rating > 5) {
            setMessage('TCF Rating must be between 0 and 5');
            return false;
        }
        
        // Validate faculties
        for (let i = 0; i < formData.faculties.length; i++) {
            const faculty = formData.faculties[i];
            if (!faculty.name.trim()) {
                setMessage(`Faculty ${i + 1} name is required`);
                return false;
            }
            if (faculty.average_result_percentage_required < 0 || faculty.average_result_percentage_required > 100) {
                setMessage(`Faculty ${i + 1} average result percentage must be between 0 and 100`);
                return false;
            }
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        setMessage('');

        try {
            const submitData = {
                ...formData,
                faculties: formData.faculties.map(faculty => ({
                    name: faculty.name,
                    average_result_percentage_required: faculty.average_result_percentage_required || 0,
                    gender: faculty.gender
                }))
            };

            let response;
            if (institute) {
                // Update existing institute
                response = await axios.put(`${API_BASE_URL}/institute/${institute.id}`, submitData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Create new institute
                response = await axios.post(`${API_BASE_URL}/institute`, submitData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            if (response.status === 200 || response.status === 201) {
                setMessage(institute ? 'Institute updated successfully!' : 'Institute created successfully!');
                setTimeout(() => {
                    setMessage('');
                    resetForm();
                    onHide();
                    if (onSuccess) onSuccess();
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            setMessage(`Error ${institute ? 'updating' : 'creating'} institute: ` + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            managing_authority: 1,
            description: '',
            tcf_rating: 0,
            latitude: 0,
            longitude: 0,
            faculties: []
        });
        setMessage('');
    };

    const handleClose = () => {
        resetForm();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton style={{ borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
                <Modal.Title style={{ color: 'var(--gray-800)', fontWeight: '700', fontSize: '1.25rem' }}>
                    <i className={`fa-solid ${institute ? 'fa-edit' : 'fa-plus-circle'} me-2`} style={{ color: 'var(--primary-color)' }} />
                    {institute ? 'Edit Institute' : 'Add New Institute'}
                </Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
                    {message && (
                        <Alert variant={message.includes('successfully') ? 'success' : 'danger'} className="mb-4">
                            <i className={`fa-solid ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`} />
                            {message}
                        </Alert>
                    )}

                    <Row className="g-4">
                        {/* Basic Information Section */}
                        <Col xs={12}>
                            <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                                <i className="fa-solid fa-info-circle me-2" style={{ color: 'var(--primary-color)' }} />
                                Basic Information
                            </h6>
                            <Row className="g-3">
                                <Col md={8}>
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                            Institute Name <span style={{ color: 'var(--danger-color)' }}>*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter institute name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                            className="my-card-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                            Managing Authority
                                        </Form.Label>
                                        <Form.Select
                                            value={formData.managing_authority}
                                            onChange={(e) => handleInputChange('managing_authority', parseInt(e.target.value))}
                                            className="my-card-input"
                                        >
                                            <option value={1}>Public</option>
                                            <option value={2}>Private</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                            TCF Rating (0-5)
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            placeholder="0.0"
                                            value={formData.tcf_rating}
                                            onChange={(e) => handleInputChange('tcf_rating', parseFloat(e.target.value) || 0)}
                                            className="my-card-input"
                                        />
                                    </Form.Group>
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
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                            Latitude
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="any"
                                            placeholder="0.0"
                                            value={formData.latitude}
                                            onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                                            className="my-card-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                            Longitude
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="any"
                                            placeholder="0.0"
                                            value={formData.longitude}
                                            onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                                            className="my-card-input"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>

                        {/* Description Section */}
                        <Col xs={12}>
                            <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--success-color)', paddingBottom: '8px' }}>
                                <i className="fa-solid fa-file-text me-2" style={{ color: 'var(--success-color)' }} />
                                Description
                            </h6>
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                    Description
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Enter institute description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="my-card-input"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Faculties Section */}
                    <Col xs={12}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 style={{ 
                                color: 'var(--gray-700)', 
                                fontWeight: '600', 
                                margin: 0,
                                paddingBottom: '8px',
                                borderBottom: '2px solid var(--warning-color)'
                            }}>
                                <i className="fa-solid fa-graduation-cap me-2" style={{ color: 'var(--warning-color)' }} />
                                Faculties ({formData.faculties.length})
                            </h6>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={addFaculty}
                                className="btn-modern d-flex align-items-center"
                                style={{ 
                                    fontSize: '0.85rem',
                                    padding: '6px 12px'
                                }}
                            >
                                <i className="fa-solid fa-plus me-1" />
                                Add Faculty
                            </Button>
                        </div>

                        {formData.faculties.length > 0 ? (
                            <div style={{ 
                                maxHeight: '300px', 
                                overflowY: 'auto',
                                border: '1px solid var(--gray-200)',
                                borderRadius: '12px',
                                background: 'var(--gray-50)'
                            }}>
                                {formData.faculties.map((faculty, index) => (
                                    <div key={index} style={{
                                        padding: '20px',
                                        borderBottom: index < formData.faculties.length - 1 ? '1px solid var(--gray-200)' : 'none',
                                        background: 'white',
                                        margin: '12px',
                                        borderRadius: '8px',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <Badge 
                                                bg="info" 
                                                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                            >
                                                Faculty #{index + 1}
                                            </Badge>
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                onClick={() => removeFaculty(index)}
                                                className="btn-modern"
                                                style={{ 
                                                    fontSize: '0.8rem',
                                                    padding: '4px 8px' 
                                                }}
                                            >
                                                <i className="fa-solid fa-trash" />
                                            </Button>
                                        </div>

                                        <Row className="g-3">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)', fontSize: '0.9rem' }}>
                                                        Faculty Name <span style={{ color: 'var(--danger-color)' }}>*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="e.g., Computer Science"
                                                        value={faculty.name}
                                                        onChange={(e) => updateFaculty(index, 'name', e.target.value)}
                                                        className="my-card-input"
                                                        style={{ fontSize: '0.9rem' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)', fontSize: '0.9rem' }}>
                                                        Required Average (%)
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        placeholder="0"
                                                        value={faculty.average_result_percentage_required || 0}
                                                        onChange={(e) => updateFaculty(index, 'average_result_percentage_required', parseFloat(e.target.value) || 0)}
                                                        className="my-card-input"
                                                        style={{ fontSize: '0.9rem' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)', fontSize: '0.9rem' }}>
                                                        Gender Policy
                                                    </Form.Label>
                                                    <Form.Select
                                                        value={faculty.gender}
                                                        onChange={(e) => updateFaculty(index, 'gender', parseInt(e.target.value))}
                                                        className="my-card-input"
                                                        style={{ fontSize: '0.9rem' }}
                                                    >
                                                        <option value={1}>Male Only</option>
                                                        <option value={2}>Female Only</option>
                                                        <option value={3}>Coeducation</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: 'var(--gray-500)',
                                background: 'var(--gray-50)',
                                borderRadius: '12px',
                                border: '2px dashed var(--gray-300)'
                            }}>
                                <i className="fa-solid fa-graduation-cap fa-3x mb-3" style={{ color: 'var(--gray-300)' }} />
                                <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No faculties added yet</div>
                                <div style={{ fontSize: '0.9rem' }}>Click "Add Faculty" to get started</div>
                            </div>
                        )}
                    </Col>
                </Modal.Body>

                <Modal.Footer style={{ 
                    borderTop: '1px solid var(--gray-200)', 
                    background: 'var(--gray-50)',
                    padding: '20px 32px'
                }}>
                    <div className="d-flex gap-2 w-100 justify-content-end">
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="btn-modern"
                            style={{ minWidth: '100px' }}
                        >
                            <i className="fa-solid fa-times me-2" />
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-modern"
                            style={{ 
                                minWidth: '120px'
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin me-2" />
                                    {institute ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <i className={`fa-solid ${institute ? 'fa-save' : 'fa-plus'} me-2`} />
                                    {institute ? 'Update Institute' : 'Create Institute'}
                                </>
                            )}
                        </Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default InstituteModal; 