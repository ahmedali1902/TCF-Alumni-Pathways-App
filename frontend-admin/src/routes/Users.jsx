import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext";
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';

const Users = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState({
        search: "",
        role: ""
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");

    // Role options based on backend enum
    const ROLE_OPTIONS = [
        { value: "", label: "All Users" },
        { value: "1", label: "Admin Users" },
        { value: "2", label: "Anonymous Users" }
    ];

    const ROLE_LABELS = {
        1: "Admin",
        2: "Anonymous User"
    };

    const getUsers = async (currentPage, perPage, appliedFilters = filters) => {
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
            if (appliedFilters.role) {
                params.role = appliedFilters.role;
            }

            const response = await axios.get(`${API_BASE_URL}/user`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = response.data.data;
            setUsers(data.data || data);
            
            // Handle pagination
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

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFilterApply = () => {
        setCurrentPage(1);
        getUsers(1, perPage, filters);
    };

    const handleFilterClear = () => {
        const clearedFilters = {
            search: "",
            role: ""
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        getUsers(1, perPage, clearedFilters);
    };

    useEffect(() => {
        if (!user) {
            setMessage("Please login first!");
            setIsLoading(false);
        } else {
            getUsers(currentPage, perPage);
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
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 1: return 'primary';
            case 2: return 'secondary';
            default: return 'light';
        }
    };

    const handleViewUser = (userId) => {
        navigate(`/users/${userId}`);
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action will mark the user as deleted.`)) {
            return;
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setMessage("User deleted successfully");
                // Refresh the current page
                getUsers(currentPage, perPage);
            } else {
                setMessage("Error: " + (response.data.message || "Failed to delete user"));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            setMessage("Error deleting user: " + (error.response?.data?.message || error.message));
        }
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
                            <i className="fa-solid fa-users me-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                            User Management
                        </h1>
                        <p style={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '1rem',
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            View and monitor admin users and anonymous users
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
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>Search</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by email or name"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="my-card-input"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: '500', color: 'var(--gray-700)' }}>User Type</Form.Label>
                                    <Form.Select
                                        value={filters.role}
                                        onChange={(e) => handleFilterChange('role', e.target.value)}
                                        className="my-card-input"
                                    >
                                        {ROLE_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
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
                            Users ({users.length})
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
                                <div className="mt-3" style={{ color: 'var(--gray-800)' }}>Loading users...</div>
                            </div>
                        ) : users.length > 0 ? (
                            <Table responsive hover className="mb-0">
                                <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                                    <tr>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>User Details</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Role</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Device ID</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Last Login</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Created</th>
                                        <th style={{ fontWeight: '600', color: 'var(--gray-800)', padding: '16px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((userData) => (
                                        <tr key={userData.id || userData._id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--gray-800)', marginBottom: '4px' }}>
                                                        {userData.name || 'No Name'}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                        {userData.email || 'No Email'}
                                                    </div>
                                                    {userData.id && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                                                            ID: {userData.id}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <Badge 
                                                    bg={getRoleBadgeColor(userData.role)}
                                                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                                >
                                                    {ROLE_LABELS[userData.role] || 'Unknown'}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                    {userData.device_id ? (
                                                        <code style={{ fontSize: '0.8rem', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px' }}>
                                                            {userData.device_id.length > 12 
                                                                ? userData.device_id.substring(0, 12) + '...' 
                                                                : userData.device_id}
                                                        </code>
                                                    ) : (
                                                        <span style={{ color: 'var(--gray-400)' }}>None</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                    {formatDate(userData.last_login)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                                    {formatDate(userData.created_at)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="info"
                                                        size="sm"
                                                        onClick={() => handleViewUser(userData._id || userData.id)}
                                                        className="btn-modern"
                                                        style={{ fontSize: '0.75rem' }}
                                                    >
                                                        <i className="fa-solid fa-eye" />
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(userData._id || userData.id, userData.name || userData.email)}
                                                        className="btn-modern"
                                                        style={{ fontSize: '0.75rem' }}
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
                                    <i className="fa-solid fa-users fa-3x mb-3" style={{ color: 'var(--gray-300)' }} />
                                    <div>No users found</div>
                                    <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                                        Try adjusting your filters or check back later
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {users.length > 0 && (
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
            </Container>
        </Container>
    );
};

export default Users; 