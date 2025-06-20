import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';

const InstituteAddRequests = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalMessage, setDeleteModalMessage] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    
    // Filter states
    const [filters, setFilters] = useState({
        search: "",
        show_processed: false
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    const getRequests = async (currentPage, perPage, appliedFilters = filters) => {
        try {
            setIsLoading(true);
            setMessage("");
            
            // Build query parameters
            const params = {
                page: currentPage,
                limit: perPage,
                show_processed: appliedFilters.show_processed
            };

            // Add search filter if it has value
            if (appliedFilters.search) {
                params.search = appliedFilters.search;
            }

            const response = await axios.get(`${API_BASE_URL}/institute/add-request`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = response.data.data;
            setRequests(data.data);
            if (data.page == data.total_pages) {
                setHasNext(false);
            } else {
                setHasNext(true);
            }
            if (data.page == 1) {
                setHasPrev(false);
            } else {
                setHasPrev(true);
            }
        } catch (error) {
            console.error(error);
            setMessage("Error loading data: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setDeleteModalMessage("Are you sure you want to delete this institute add request?");
        setShowDeleteModal(true);
    }

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/institute/add-request/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDeleteModalMessage("Institute add request deleted successfully");
            setTimeout(() => {
                setDeleteModalMessage("");
                setShowDeleteModal(false);
                getRequests(currentPage, perPage);
            }, 2000);
        } catch (error) {
            setDeleteModalMessage("Error deleting request: " + (error.response?.data?.message || error.message));
            setTimeout(() => {
                setDeleteModalMessage("");
                setShowDeleteModal(false);
            }, 2000);
        }
    };

    const handleToggleProcessed = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/institute/add-request/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            getRequests(currentPage, perPage);
        } catch (error) {
            setMessage("Error updating request: " + (error.response?.data?.message || error.message));
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFilterApply = () => {
        setCurrentPage(1);
        getRequests(1, perPage, filters);
    };

    const handleFilterClear = () => {
        const clearedFilters = {
            search: "",
            show_processed: false
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        getRequests(1, perPage, clearedFilters);
    };

    useEffect(() => {
        if (!user) {
            setMessage("Please login first!");
            setIsLoading(false);
        } else {
            getRequests(currentPage, perPage);
        }
    }, [user, currentPage, perPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (e) => {
        setPerPage(e.target.value);
        setCurrentPage(1);
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
                            Institute Add Requests
                        </h1>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '1rem',
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            Manage and review institute addition requests
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
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Search</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by institute name, faculty name, or address..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="my-card-input"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Show Processed</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="show-processed-switch"
                                        label="Include processed requests"
                                        checked={filters.show_processed}
                                        onChange={(e) => handleFilterChange('show_processed', e.target.checked)}
                                        className="mt-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="d-flex align-items-end">
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
                            Institute Add Requests ({requests.length})
                        </h5>
                        <div className="d-flex align-items-center">
                            <Form.Label className="mb-0 me-2" style={{ fontWeight: '500', color: 'var(--gray-700)' }}>
                                Show:
                            </Form.Label>
                            <Form.Select 
                                value={perPage} 
                                onChange={handlePerPageChange} 
                                style={{ width: '80px' }}
                                className="my-card-input"
                                disabled={isLoading}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </Form.Select>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        {isLoading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <div className="mt-3" style={{ color: 'var(--gray-800)' }}>Loading requests...</div>
                            </div>
                        ) : requests.length > 0 ? (
                            <Table responsive hover className="mb-0">
                                <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                                    <tr>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Institute Details</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Faculty Name</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Status</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Date</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((request) => (
                                        <tr key={request.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--gray-800)', marginBottom: '4px' }}>
                                                        {request.institute_name}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                        {request.institute_address}
                                                    </div>
                                                    {request.institute_map_link && (
                                                        <div className="mt-1">
                                                            <a 
                                                                href={request.institute_map_link} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                style={{ color: 'var(--primary-color)', fontSize: '0.8rem', textDecoration: 'none' }}
                                                            >
                                                                <i className="fa-solid fa-map-marker-alt me-1" />
                                                                View Location
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ color: 'var(--gray-700)', fontWeight: '500' }}>
                                                    {request.faculty_name}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <Badge 
                                                    bg={request.processed ? "success" : "warning"}
                                                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                                >
                                                    {request.processed ? "Processed" : "Pending"}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                    {formatDate(request.created_at)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button
                                                        as={Link}
                                                        to={`/institute-requests/${request.id}`}
                                                        variant="info"
                                                        size="sm"
                                                        className="btn-modern"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <i className="fa-solid fa-eye" />
                                                    </Button>
                                                    <Button
                                                        variant={request.processed ? "warning" : "success"}
                                                        size="sm"
                                                        onClick={() => handleToggleProcessed(request.id)}
                                                        className="btn-modern"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <i className={`fa-solid ${request.processed ? "fa-undo" : "fa-check"}`} />
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(request.id)}
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
                                    <i className="fa-solid fa-clipboard-list fa-3x mb-3" style={{ color: 'var(--gray-300)' }} />
                                    <div>No institute add requests found</div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                                        Try adjusting your filters or check back later
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {requests.length > 0 && (
                        <div className="card-footer d-flex justify-content-center" style={{ backgroundColor: 'var(--gray-50)', border: 'none' }}>
                            <Pagination className="mb-0">
                                {hasPrev && (
                                    <Pagination.Prev 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={isLoading}
                                    />
                                )}
                                <Pagination.Item active>
                                    {currentPage}
                                </Pagination.Item>
                                {hasNext && (
                                    <Pagination.Next 
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={isLoading}
                                    />
                                )}
                            </Pagination>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton style={{ borderBottom: '1px solid var(--gray-200)' }}>
                        <Modal.Title style={{ color: 'var(--gray-800)', fontWeight: '600' }}>
                            <i className="fa-solid fa-exclamation-triangle me-2" style={{ color: 'var(--danger-color)' }} />
                            Delete Request
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '24px' }}>
                        {deleteModalMessage ? (
                            <Alert variant={deleteModalMessage.includes('successfully') ? 'success' : 'danger'}>
                                {deleteModalMessage}
                            </Alert>
                        ) : (
                            <div style={{ color: 'var(--gray-700)' }}>
                                Are you sure you want to delete this institute add request? This action cannot be undone.
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
                            Delete Request
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Container>
    );
};

export default InstituteAddRequests; 