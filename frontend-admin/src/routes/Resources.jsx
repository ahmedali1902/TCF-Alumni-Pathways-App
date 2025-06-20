import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ResourceModal from '../components/ResourceModal';
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

const Resources = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteModalMessage, setDeleteModalMessage] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    
    // Filter states
    const [filters, setFilters] = useState({
        search: "",
        education_level: "",
        category: ""
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    // Filter options based on backend enums
    const EDUCATION_LEVEL_OPTIONS = [
        { value: "", label: "All Levels" },
        { value: "1", label: "Matriculation" },
        { value: "2", label: "Intermediate" }
    ];

    const CATEGORY_OPTIONS = [
        { value: "", label: "All Categories" },
        { value: "1", label: "General" },
        { value: "2", label: "Scholarship" }
    ];

    const getResources = async (currentPage, perPage, appliedFilters = filters) => {
        try {
            setIsLoading(true);
            setMessage("");
            
            // Build query parameters
            const params = {
                page: currentPage,
                limit: perPage
            };

            // Add filters if they have values
            if (appliedFilters.search) {
                params.search = appliedFilters.search;
            }
            if (appliedFilters.education_level) {
                params.education_level = appliedFilters.education_level;
            }
            if (appliedFilters.category) {
                params.category = appliedFilters.category;
            }

            const response = await axios.get(`${API_BASE_URL}/resource`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = response.data.data;
            setResources(data.data);
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
        setDeleteModalMessage("Are you sure you want to delete this resource?");
        setShowDeleteModal(true);
    }

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/resource/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDeleteModalMessage("Resource deleted successfully");
            setTimeout(() => {
                setDeleteModalMessage("");
                setShowDeleteModal(false);
                getResources(currentPage, perPage);
            }, 2000);
        } catch (error) {
            setDeleteModalMessage("Error deleting resource: " + (error.response?.data?.message || error.message));
            setTimeout(() => {
                setDeleteModalMessage("");
                setShowDeleteModal(false);
            }, 2000);
        }
    };

    const handleResourceCreated = () => {
        // Refresh the resources list when new resource is created
        getResources(currentPage, perPage);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFilterApply = () => {
        setCurrentPage(1); // Reset to first page when applying filters
        getResources(1, perPage, filters);
    };

    const handleFilterClear = () => {
        const clearedFilters = {
            search: "",
            education_level: "",
            category: ""
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        getResources(1, perPage, clearedFilters);
    };

    useEffect(() => {
        if (!user) {
            setMessage("Please login first!");
            setIsLoading(false);
        } else {
            getResources(currentPage, perPage);
        }
    }, [user, currentPage, perPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (e) => {
        setPerPage(e.target.value);
        setCurrentPage(1);
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
                            <i className="fa-solid fa-book-open me-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                            Resources Management
                        </h1>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '1rem',
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            Manage educational resources and learning materials
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
                            Add Resource
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
                            <Col md={4}>
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
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Education Level</Form.Label>
                                    <Form.Select
                                        value={filters.education_level}
                                        onChange={(e) => handleFilterChange('education_level', e.target.value)}
                                        className="my-card-input"
                                    >
                                        {EDUCATION_LEVEL_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Category</Form.Label>
                                    <Form.Select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="my-card-input"
                                    >
                                        {CATEGORY_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex align-items-end">
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
                            Resources ({resources.length})
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
                                <div className="mt-3" style={{ color: 'var(--gray-800)' }}>Loading resources...</div>
                            </div>
                        ) : resources.length > 0 ? (
                            <Table responsive hover className="mb-0">
                                <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                                    <tr>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Resource</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Education Level</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Category</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Link</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resources.map((resource) => (
                                        <tr key={resource.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--gray-800)', marginBottom: '4px' }}>
                                                        {resource.title}
                                                    </div>
                                                    {resource.content && (
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                            {resource.content.length > 80 
                                                                ? resource.content.substring(0, 80) + '...'
                                                                : resource.content
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <Badge 
                                                    bg={resource.education_level === 1 ? 'primary' : 'info'}
                                                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                                >
                                                    {resource.education_level === 1 ? 'Matriculation' : 'Intermediate'}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <Badge 
                                                    bg={resource.category === 1 ? 'success' : 'warning'}
                                                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                                >
                                                    {resource.category === 1 ? 'General' : 'Scholarship'}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {resource.link ? (
                                                    <a 
                                                        href={resource.link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                                                    >
                                                        <i className="fa-solid fa-external-link-alt me-1" />
                                                        View Link
                                                    </a>
                                                ) : (
                                                    <span style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>No link</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button 
                                                        as={Link} 
                                                        to={`/resources/${resource.id}`}
                                                        variant="info" 
                                                        size="sm"
                                                        className="btn-modern"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <i className="fa-solid fa-eye" />
                                                    </Button>
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(resource.id)}
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
                                    <i className="fa-solid fa-book-open fa-3x mb-3" style={{ color: 'var(--gray-300)' }} />
                                    <div>No resources found</div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                                        Try adjusting your filters or add a new resource
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {resources.length > 0 && (
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

                {/* Add Resource Modal */}
                <ResourceModal 
                    show={showAddModal} 
                    onHide={() => setShowAddModal(false)}
                    onSuccess={handleResourceCreated}
                />
            </Container>
        </Container>
    );
};

export default Resources; 