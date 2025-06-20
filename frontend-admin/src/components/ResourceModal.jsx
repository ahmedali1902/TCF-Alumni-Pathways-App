import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';

const ResourceModal = ({ show, onHide, onSuccess, resource = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        link: '',
        education_level: '1',
        category: '1'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    // Education level options based on backend enum
    const EDUCATION_LEVEL_OPTIONS = [
        { value: '1', label: 'Matriculation' },
        { value: '2', label: 'Intermediate' }
    ];

    // Category options based on backend enum
    const CATEGORY_OPTIONS = [
        { value: '1', label: 'General' },
        { value: '2', label: 'Scholarship' }
    ];

    // Initialize form data when modal opens or resource changes
    useEffect(() => {
        if (resource) {
            // Edit mode - populate form with existing resource data
            setFormData({
                title: resource.title || '',
                content: resource.content || '',
                link: resource.link || '',
                education_level: resource.education_level?.toString() || '1',
                category: resource.category?.toString() || '1'
            });
        } else {
            // Add mode - reset form
            setFormData({
                title: '',
                content: '',
                link: '',
                education_level: '1',
                category: '1'
            });
        }
        setMessage('');
        setErrors({});
    }, [resource, show]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        }

        if (formData.link && !isValidUrl(formData.link)) {
            newErrors.link = 'Please enter a valid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const payload = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                education_level: parseInt(formData.education_level),
                category: parseInt(formData.category),
                ...(formData.link.trim() && { link: formData.link.trim() })
            };

            let response;
            if (resource) {
                // Update existing resource
                response = await axios.put(`${API_BASE_URL}/resource/${resource.id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Create new resource
                response = await axios.post(`${API_BASE_URL}/resource`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            setMessage(resource ? 'Resource updated successfully!' : 'Resource created successfully!');
            
            // Close modal and refresh parent component after 1.5 seconds
            setTimeout(() => {
                onHide();
                onSuccess();
            }, 1500);

        } catch (error) {
            console.error('Error saving resource:', error);
            setMessage('Error saving resource: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onHide();
        }
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose} 
            size="lg" 
            centered
            backdrop={isLoading ? "static" : true}
            keyboard={!isLoading}
        >
            <Modal.Header closeButton={!isLoading} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <Modal.Title style={{ color: 'var(--gray-800)', fontWeight: '600' }}>
                    <i className={`fa-solid ${resource ? 'fa-edit' : 'fa-plus'} me-2`} style={{ color: 'var(--primary-color)' }} />
                    {resource ? 'Edit Resource' : 'Add New Resource'}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body style={{ padding: '24px' }}>
                    {message && (
                        <Alert 
                            variant={message.includes('Error') ? 'danger' : 'success'}
                            className="mb-3"
                        >
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
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                            Title <span style={{ color: 'var(--danger-color)' }}>*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Enter resource title"
                                            className={`my-card-input ${errors.title ? 'is-invalid' : ''}`}
                                            disabled={isLoading}
                                        />
                                        {errors.title && (
                                            <div className="invalid-feedback">
                                                {errors.title}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                            Education Level <span style={{ color: 'var(--danger-color)' }}>*</span>
                                        </Form.Label>
                                        <Form.Select
                                            name="education_level"
                                            value={formData.education_level}
                                            onChange={handleChange}
                                            className="my-card-input"
                                            disabled={isLoading}
                                        >
                                            {EDUCATION_LEVEL_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                            Category <span style={{ color: 'var(--danger-color)' }}>*</span>
                                        </Form.Label>
                                        <Form.Select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="my-card-input"
                                            disabled={isLoading}
                                        >
                                            {CATEGORY_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>

                        {/* Content Section */}
                        <Col xs={12}>
                            <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--success-color)', paddingBottom: '8px' }}>
                                <i className="fa-solid fa-file-text me-2" style={{ color: 'var(--success-color)' }} />
                                Content
                            </h6>
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                    Content <span style={{ color: 'var(--danger-color)' }}>*</span>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder="Enter resource content/description"
                                    className={`my-card-input ${errors.content ? 'is-invalid' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.content && (
                                    <div className="invalid-feedback">
                                        {errors.content}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>

                        {/* External Link Section */}
                        <Col xs={12}>
                            <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--info-color)', paddingBottom: '8px' }}>
                                <i className="fa-solid fa-link me-2" style={{ color: 'var(--info-color)' }} />
                                External Link
                            </h6>
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                    External Link
                                </Form.Label>
                                <Form.Control
                                    type="url"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    placeholder="https://example.com (optional)"
                                    className={`my-card-input ${errors.link ? 'is-invalid' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.link && (
                                    <div className="invalid-feedback">
                                        {errors.link}
                                    </div>
                                )}
                                <Form.Text className="text-muted">
                                    Optional: Add a link to external resource or website
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer style={{ borderTop: '1px solid var(--gray-200)', padding: '16px 24px' }}>
                    <Button 
                        variant="outline-secondary" 
                        onClick={handleClose}
                        disabled={isLoading}
                        className="btn-modern"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={isLoading}
                        className="btn-modern d-flex align-items-center"
                    >
                        {isLoading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    className="me-2"
                                />
                                {resource ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <i className={`fa-solid ${resource ? 'fa-save' : 'fa-plus'} me-2`} />
                                {resource ? 'Update Resource' : 'Create Resource'}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ResourceModal; 