import React, { use, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import InstituteModal from '../components/InstituteModal';
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

const Institutes = () => {
    const { user } = useAuth();
	const [institutes, setInstitutes] = useState([]);
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
        managing_authority: "",
        gender: "",
        min_tcf_rating: ""
    });

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    // Filter options based on backend enums
    const MANAGING_AUTHORITY_OPTIONS = [
        { value: "", label: "All Authorities" },
        { value: "1", label: "Public" },
        { value: "2", label: "Private" }
    ];

    const GENDER_OPTIONS = [
        { value: "", label: "All Genders" },
        { value: "1", label: "Male Only" },
        { value: "2", label: "Female Only" },
        { value: "3", label: "Coeducation" }
    ];

	const getInstitutes = async (currentPage, perPage, appliedFilters = filters) => {
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
            if (appliedFilters.managing_authority) {
                params.managing_authority = appliedFilters.managing_authority;
            }
            if (appliedFilters.gender) {
                params.gender = appliedFilters.gender;
            }
            if (appliedFilters.min_tcf_rating) {
                params.min_tcf_rating = appliedFilters.min_tcf_rating;
            }

			const response = await axios.get(`${API_BASE_URL}/institute`, {
				params,
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			const data = response.data.data;
			setInstitutes(data.data);
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
		setDeleteModalMessage("Are you sure you want to delete this institute?");
		setShowDeleteModal(true);
	}

	const handleDeleteConfirm = async () => {
		try {
			const response = await axios.delete(`${API_BASE_URL}/institute/${deleteId}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			setDeleteModalMessage("Institute deleted successfully");
			setTimeout(() => {
				setDeleteModalMessage("");
				setShowDeleteModal(false);
                getInstitutes(currentPage, perPage);
			}, 2000);
		} catch (error) {
			setDeleteModalMessage("Error deleting institute: " + (error.response?.data?.message || error.message));
			setTimeout(() => {
				setDeleteModalMessage("");
				setShowDeleteModal(false);
			}, 2000);
		}
	};

    const handleInstituteCreated = () => {
        // Refresh the institutes list when new institute is created
        getInstitutes(currentPage, perPage);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFilterApply = () => {
        setCurrentPage(1); // Reset to first page when applying filters
		getInstitutes(1, perPage, filters);
	};

    const handleFilterClear = () => {
        const clearedFilters = {
            search: "",
            managing_authority: "",
            gender: "",
            min_tcf_rating: ""
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        getInstitutes(1, perPage, clearedFilters);
    };

	useEffect(() => {
		if (!user) {
			setMessage("Please login first!");
            setIsLoading(false);
		} else {
			getInstitutes(currentPage, perPage);
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
		<Container fluid className="p-0">
			<Sidebar />
			<Container style={{ marginTop: '100px', paddingBottom: '40px' }}>
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700',
                            color: 'var(--gray-800)',
                            marginBottom: '8px'
                        }}>
                            <i className="fa-solid fa-building-columns me-3" style={{ color: 'var(--success-color)' }} />
                            Institutes Management
                        </h1>
                        <p style={{ 
                            color: 'var(--gray-600)', 
                            fontSize: '1rem',
                            margin: 0
                        }}>
                            Manage educational institutes and their information
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button 
                            variant="outline-primary" 
                            onClick={() => window.history.back()}
                            className="btn-modern d-flex align-items-center"
                        >
                            <i className="fa-solid fa-arrow-left me-2" />
                            Back
                        </Button>
                        <Button 
                            variant="success" 
                            onClick={() => setShowAddModal(true)}
                            className="btn-modern d-flex align-items-center"
                            style={{ background: 'var(--success-gradient)' }}
                        >
                            <i className="fa-solid fa-plus me-2" />
                            Add Institute
                        </Button>
                    </div>
                </div>

                {message && (
                    <Alert variant={message.includes('error') ? 'danger' : 'info'} className="mb-4">
                        {message}
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
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Search</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by name or description"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="my-card-input"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Managing Authority</Form.Label>
                                    <Form.Select
                                        value={filters.managing_authority}
                                        onChange={(e) => handleFilterChange('managing_authority', e.target.value)}
                                        className="my-card-input"
                                    >
                                        {MANAGING_AUTHORITY_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Faculty Gender</Form.Label>
                                    <Form.Select
                                        value={filters.gender}
                                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                                        className="my-card-input"
                                    >
                                        {GENDER_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Min TCF Rating</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        placeholder="e.g., 3.5"
                                        value={filters.min_tcf_rating}
                                        onChange={(e) => handleFilterChange('min_tcf_rating', e.target.value)}
                                        className="my-card-input"
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
                                        Apply Filters
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
                            Institutes ({institutes.length})
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
                                <div className="mt-3" style={{ color: 'var(--gray-600)' }}>Loading institutes...</div>
                            </div>
                        ) : institutes.length > 0 ? (
                            <Table responsive hover className="mb-0">
                                <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                                    <tr>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Institute</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Authority</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Rating</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Faculties</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {institutes.map((institute) => (
                                        <tr key={institute.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--gray-800)', marginBottom: '4px' }}>
                                                        {institute.name}
                                                    </div>
                                                    {institute.description && (
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                            {institute.description.length > 60 
                                                                ? institute.description.substring(0, 60) + '...'
                                                                : institute.description
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <Badge 
                                                    bg={institute.managing_authority === 1 ? 'success' : 'primary'}
                                                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                                >
                                                    {institute.managing_authority === 1 ? 'Public' : 'Private'}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <Badge 
                                                    bg="warning" 
                                                    text="dark"
                                                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                                >
                                                    <i className="fa-solid fa-star me-1" />
                                                    {institute.tcf_rating?.toFixed(1) || 0} / 5
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div>
                                                    <Badge 
                                                        bg="info" 
                                                        style={{ fontSize: '0.75rem', padding: '6px 12px', marginBottom: '4px' }}
                                                    >
                                                        {institute.faculties?.length || 0} faculties
                                                    </Badge>
                                                    {institute.faculties?.length > 0 && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                                            {institute.faculties.slice(0, 2).map((faculty, idx) => (
                                                                <div key={idx}>
                                                                    {faculty.name} ({faculty.gender === 1 ? 'M' : faculty.gender === 2 ? 'F' : 'Co-ed'})
                                                                </div>
                                                            ))}
                                                            {institute.faculties.length > 2 && (
                                                                <div style={{ color: 'var(--gray-500)' }}>
                                                                    + {institute.faculties.length - 2} more
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button 
                                                        as={Link} 
                                                        to={`/institutes/${institute.id}`}
                                                        variant="outline-primary" 
                                                        size="sm"
                                                        className="btn-modern"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <i className="fa-solid fa-eye" />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(institute.id)}
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
                                    <i className="fa-solid fa-building-columns fa-3x mb-3" style={{ color: 'var(--gray-300)' }} />
                                    <div>No institutes found</div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                                        Try adjusting your filters or add a new institute
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {institutes.length > 0 && (
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
                            Delete Institute
                        </Modal.Title>
					</Modal.Header>
					<Modal.Body style={{ padding: '24px' }}>
                        {deleteModalMessage ? (
                            <Alert variant={deleteModalMessage.includes('successfully') ? 'success' : 'danger'}>
                                {deleteModalMessage}
                            </Alert>
                        ) : (
                            <div style={{ color: 'var(--gray-700)' }}>
                                Are you sure you want to delete this institute? This action cannot be undone.
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
                            style={{ background: 'var(--danger-gradient)' }}
                        >
                            Delete Institute
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Add Institute Modal */}
                <InstituteModal 
                    show={showAddModal} 
                    onHide={() => setShowAddModal(false)}
                    onSuccess={handleInstituteCreated}
                />
            </Container>
        </Container>
    );
};

export default Institutes;