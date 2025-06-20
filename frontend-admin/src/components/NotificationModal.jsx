import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

const NotificationModal = ({ show, onHide, onSuccess, notification = null, isEdit = false }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    // Populate form data when editing
    useEffect(() => {
        if (isEdit && notification) {
            setFormData({
                title: notification.title || '',
                content: notification.content || ''
            });
        } else if (!isEdit) {
            resetForm();
        }
    }, [isEdit, notification, show]);

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setMessage('Notification title is required');
            return false;
        }
        if (formData.title.length > 39) {
            setMessage('Title must be 39 characters or less');
            return false;
        }
        if (!formData.content.trim()) {
            setMessage('Notification content is required');
            return false;
        }
        if (formData.content.length > 150) {
            setMessage('Content must be 150 characters or less');
            return false;
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
                title: formData.title.trim(),
                content: formData.content.trim()
            };

            let response;
            if (isEdit && notification?.id) {
                // Update existing notification
                response = await axios.put(`${API_BASE_URL}/notification/${notification.id}`, submitData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Create new notification
                response = await axios.post(`${API_BASE_URL}/notification`, submitData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            if (response.status === 200 || response.status === 201) {
                const successMessage = isEdit ? 'Notification updated successfully!' : 'Notification created successfully!';
                setMessage(successMessage);
                setTimeout(() => {
                    setMessage('');
                    resetForm();
                    onHide();
                    if (onSuccess) onSuccess();
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            const errorMessage = isEdit ? 'Error updating notification: ' : 'Error creating notification: ';
            setMessage(errorMessage + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: ''
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
                    <i className={`fa-solid ${isEdit ? 'fa-edit' : 'fa-bell'} me-2`} style={{ color: 'var(--primary-color)' }} />
                    {isEdit ? 'Edit Notification' : 'Add New Notification'}
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

                    {/* Notification Information Section */}
                    <div className="mb-4">
                        <h5 style={{
                            color: 'var(--gray-800)',
                            fontWeight: '600',
                            marginBottom: '16px',
                            paddingBottom: '8px',
                            borderBottom: '2px solid var(--primary-color)'
                        }}>
                            <i className="fa-solid fa-info-circle me-2" style={{ color: 'var(--primary-color)' }} />
                            Notification Details
                        </h5>

                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                        Title <span style={{ color: 'var(--danger-color)' }}>*</span>
                                        <small className="text-muted ms-2">
                                            ({formData.title.length}/39 characters)
                                        </small>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter notification title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        required
                                        maxLength={39}
                                        className="my-card-input"
                                        style={{ fontSize: '1rem' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="g-3 mt-2">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                        Content <span style={{ color: 'var(--danger-color)' }}>*</span>
                                        <small className="text-muted ms-2">
                                            ({formData.content.length}/150 characters)
                                        </small>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Enter notification content"
                                        value={formData.content}
                                        onChange={(e) => handleInputChange('content', e.target.value)}
                                        required
                                        maxLength={150}
                                        className="my-card-input"
                                        style={{ resize: 'vertical' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
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
                                background: 'var(--primary-gradient)',
                                minWidth: '140px'
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin me-2" />
                                    {isEdit ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <i className={`fa-solid ${isEdit ? 'fa-save' : 'fa-save'} me-2`} />
                                    {isEdit ? 'Update Notification' : 'Create Notification'}
                                </>
                            )}
                        </Button>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default NotificationModal;