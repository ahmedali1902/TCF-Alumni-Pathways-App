import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationModal from '../components/NotificationModal';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteModalMessage, setDeleteModalMessage] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    const [editNotification, setEditNotification] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        search: ""
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    const getNotifications = async (appliedFilters = filters) => {
        try {
            setIsLoading(true);
            setMessage("");

            const response = await axios.get(`${API_BASE_URL}/notification`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response.data.data;
            let filteredNotifications = data.data;

            // Apply client-side search filter
            if (appliedFilters.search) {
                const searchTerm = appliedFilters.search.toLowerCase();
                filteredNotifications = filteredNotifications.filter(notification =>
                    notification.title.toLowerCase().includes(searchTerm) ||
                    notification.content.toLowerCase().includes(searchTerm)
                );
            }

            setNotifications(filteredNotifications);
        } catch (error) {
            console.error(error);
            setMessage("Error loading notifications: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setDeleteModalMessage("Are you sure you want to delete this notification?");
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/notification/${deleteId}`, {
                is_deleted: true
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDeleteModalMessage("Notification deleted successfully");
            setTimeout(() => {
                setDeleteModalMessage("");
                setShowDeleteModal(false);
                getNotifications();
            }, 2000);
        } catch (error) {
            setDeleteModalMessage("Error deleting notification: " + (error.response?.data?.message || error.message));
            setTimeout(() => {
                setDeleteModalMessage("");
                setShowDeleteModal(false);
            }, 2000);
        }
    };

    const handleEditClick = (notification) => {
        setEditNotification(notification);
        setShowEditModal(true);
    };

    const handleNotificationCreated = () => {
        // Refresh the notifications list when new notification is created
        getNotifications();
    };

    const handleNotificationUpdated = () => {
        // Refresh the notifications list when notification is updated
        getNotifications();
        setEditNotification(null);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFilterApply = () => {
        getNotifications(filters);
    };

    const handleFilterClear = () => {
        const clearedFilters = {
            search: ""
        };
        setFilters(clearedFilters);
        getNotifications(clearedFilters);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        if (!user) {
            setMessage("Please login first!");
            setIsLoading(false);
        } else {
            getNotifications();
        }
    }, [user]);

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
                            <i className="fa-solid fa-bell me-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                            Notifications Management
                        </h1>
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '1rem',
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            Manage system notifications and announcements
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="info" 
                            onClick={() => navigate('/')}
                            className="btn-modern d-flex align-items-center"
                        >
                            <i className="fa-solid fa-home me-2" />
                            Dashboard
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setShowAddModal(true)}
                            className="btn-modern d-flex align-items-center"
                        >
                            <i className="fa-solid fa-plus me-2" />
                            Add Notification
                        </Button>
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

                {/* Enhanced Filter Section */}
                <div className="modern-card mb-4">
                    <div className="card-header">
                        <h5>
                            <i className="fa-solid fa-filter me-2" style={{ color: 'var(--primary-color)' }} />
                            Filters & Search
                        </h5>
                    </div>
                    <div className="card-body">
                        <Row className="g-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Search</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by title or content"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="my-card-input"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex align-items-end">
                                <div className="d-flex gap-2 w-100">
                                    <Button
                                        variant="primary"
                                        onClick={handleFilterApply}
                                        className="btn-modern flex-grow-1"
                                        disabled={isLoading}
                                    >
                                        <i className="fa-solid fa-search me-2" />
                                        Apply
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleFilterClear}
                                        className="btn-modern"
                                        disabled={isLoading}
                                    >
                                        <i className="fa-solid fa-times" />
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* Results Section */}
                <div className="modern-card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5>
                            <i className="fa-solid fa-list me-2" style={{ color: 'var(--success-color)' }} />
                            Notifications ({notifications.length})
                        </h5>
                    </div>
                    <div className="card-body p-0">
                        {isLoading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <div className="mt-3" style={{ color: 'var(--gray-800)' }}>Loading notifications...</div>
                            </div>
                        ) : notifications.length > 0 ? (
                            <Table responsive hover className="mb-0">
                                <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                                    <tr>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Title</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Content</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Created</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Updated</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((notification) => (
                                        <tr key={notification.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--gray-800)', marginBottom: '4px' }}>
                                                    {notification.title}
                                                </div>
                                                <Badge
                                                    bg="info"
                                                    style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                                                >
                                                    {notification.title.length}/39 chars
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ color: 'var(--gray-700)', marginBottom: '4px', fontSize: '0.85rem' }}>
                                                    {notification.content.length > 50
                                                        ? notification.content.substring(0, 50) + '...'
                                                        : notification.content
                                                    }
                                                </div>
                                                <Badge
                                                    bg="secondary"
                                                    style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                                                >
                                                    {notification.content.length}/150 chars
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                    {formatDate(notification.created_at)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                    {formatDate(notification.updated_at)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button
                                                        variant="info"
                                                        size="sm"
                                                        onClick={() => handleEditClick(notification)}
                                                        className="btn-modern"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <i className="fa-solid fa-edit" />
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(notification.id)}
                                                        className="btn-modern"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <i className="fa-solid fa-trash" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <div className="text-center py-5">
                                <div style={{ color: 'var(--gray-500)', fontSize: '1.1rem' }}>
                                    <i className="fa-solid fa-bell fa-3x mb-3" style={{ color: 'var(--gray-300)' }} />
                                    <div>No notifications found</div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                                        Try adjusting your search or add a new notification
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton style={{ borderBottom: '1px solid var(--gray-200)' }}>
                        <Modal.Title style={{ color: 'var(--gray-800)', fontWeight: '600' }}>
                            <i className="fa-solid fa-exclamation-triangle me-2" style={{ color: 'var(--danger-color)' }} />
                            Delete Notification
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '24px' }}>
                        {deleteModalMessage ? (
                            <Alert variant={deleteModalMessage.includes('successfully') ? 'success' : 'danger'}>
                                {deleteModalMessage}
                            </Alert>
                        ) : (
                            <div style={{ color: 'var(--gray-700)' }}>
                                Are you sure you want to delete this notification? This action cannot be undone.
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
                            Delete Notification
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Add Notification Modal */}
                <NotificationModal
                    show={showAddModal}
                    onHide={() => setShowAddModal(false)}
                    onSuccess={handleNotificationCreated}
                />

                {/* Edit Notification Modal */}
                <NotificationModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    onSuccess={handleNotificationUpdated}
                    notification={editNotification}
                    isEdit={true}
                />
            </Container>
        </Container>
    );
};

export default Notifications;