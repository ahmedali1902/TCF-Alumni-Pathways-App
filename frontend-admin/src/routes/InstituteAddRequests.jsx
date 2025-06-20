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
import Card from 'react-bootstrap/Card';
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
                </div>

                {/* Filter Section */}
                <Card className="mb-4 shadow-sm border-0">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                        Search
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by institute name, faculty name, or address..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="form-control-modern"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
                                        Show Processed
                                    </Form.Label>
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
                                        style={{ background: 'var(--primary-gradient)' }}
                                    >
                                        <i className="fa-solid fa-filter me-2" />
                                        Apply
                                    </Button>
                                    <Button 
                                        variant="outline-secondary" 
                                        onClick={handleFilterClear}
                                        className="btn-modern"
                                    >
                                        <i className="fa-solid fa-times me-2" />
                                        Clear
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Alert Message */}
                {message && (
                    <Alert variant={message.includes("Error") ? "danger" : "info"} className="mb-4">
                        <i className={`fa-solid ${message.includes("Error") ? "fa-exclamation-triangle" : "fa-info-circle"} me-2`} />
                        {message}
                    </Alert>
                )}

                {/* Main Content */}
                <Card className="shadow-sm border-0">
                    <Card.Header className="bg-white border-0 pb-0">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0" style={{ color: 'var(--gray-800)', fontWeight: '600' }}>
                                Institute Add Requests List
                            </h5>
                            <div className="d-flex align-items-center gap-3">
                                <Form.Select 
                                    value={perPage} 
                                    onChange={handlePerPageChange}
                                    style={{ width: 'auto' }}
                                    className="form-control-modern"
                                >
                                    <option value={10}>10 per page</option>
                                    <option value={25}>25 per page</option>
                                    <option value={50}>50 per page</option>
                                </Form.Select>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {isLoading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted">Loading requests...</p>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fa-solid fa-clipboard-list text-muted" style={{ fontSize: '3rem' }} />
                                <p className="mt-3 text-muted mb-0">No institute add requests found</p>
                                <p className="text-muted">Try adjusting your filters or check back later.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table className="mb-0 table-hover">
                                    <thead style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                                        <tr>
                                            <th style={{ fontWeight: '600', color: 'var(--gray-700)', padding: '15px' }}>
                                                Institute Details
                                            </th>
                                            <th style={{ fontWeight: '600', color: 'var(--gray-700)', padding: '15px' }}>
                                                Faculty Name
                                            </th>
                                            <th style={{ fontWeight: '600', color: 'var(--gray-700)', padding: '15px' }}>
                                                Status
                                            </th>
                                            <th style={{ fontWeight: '600', color: 'var(--gray-700)', padding: '15px' }}>
                                                Date
                                            </th>
                                            <th style={{ fontWeight: '600', color: 'var(--gray-700)', padding: '15px', textAlign: 'center' }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map((request, index) => (
                                            <tr key={request.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                                <td style={{ padding: '15px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--gray-900)', marginBottom: '4px' }}>
                                                            {request.institute_name}
                                                        </div>
                                                        <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                                                            {request.institute_address}
                                                        </div>
                                                        {request.institute_map_link && (
                                                            <div className="mt-1">
                                                                <a 
                                                                    href={request.institute_map_link} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    style={{ color: 'var(--primary-color)', fontSize: '0.85rem', textDecoration: 'none' }}
                                                                >
                                                                    <i className="fa-solid fa-map-marker-alt me-1" />
                                                                    View Location
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{ color: 'var(--gray-700)', fontWeight: '500' }}>
                                                        {request.faculty_name}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <Badge 
                                                        bg={request.processed ? "success" : "warning"}
                                                        className="px-3 py-2"
                                                        style={{ fontSize: '0.8rem' }}
                                                    >
                                                        {request.processed ? "Processed" : "Pending"}
                                                    </Badge>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                                                        {formatDate(request.created_at)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => navigate(`/institute-requests/${request.id}`)}
                                                            className="btn-action"
                                                            title="View Details"
                                                        >
                                                            <i className="fa-solid fa-eye" />
                                                        </Button>
                                                        <Button
                                                            variant={request.processed ? "outline-warning" : "outline-success"}
                                                            size="sm"
                                                            onClick={() => handleToggleProcessed(request.id)}
                                                            className="btn-action"
                                                            title={request.processed ? "Mark as Pending" : "Mark as Processed"}
                                                        >
                                                            <i className={`fa-solid ${request.processed ? "fa-undo" : "fa-check"}`} />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(request.id)}
                                                            className="btn-action"
                                                            title="Delete Request"
                                                        >
                                                            <i className="fa-solid fa-trash" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Pagination */}
                {!isLoading && requests.length > 0 && (
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination className="pagination-modern">
                            <Pagination.Prev 
                                disabled={!hasPrev} 
                                onClick={() => handlePageChange(currentPage - 1)}
                            />
                            <Pagination.Item active>{currentPage}</Pagination.Item>
                            <Pagination.Next 
                                disabled={!hasNext} 
                                onClick={() => handlePageChange(currentPage + 1)}
                            />
                        </Pagination>
                    </div>
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

export default InstituteAddRequests; 