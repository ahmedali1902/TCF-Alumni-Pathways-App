import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext";
import { formatDate, formatLastLogin } from '../utils/dateUtils';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';

const UserView = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  const fetchUser = async () => {
    try {
      setLoading(true);
      setMessage("Loading user data...");
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setUserData(data.data);
        setMessage("");
      } else {
        setMessage(data.message || 'Failed to fetch user');
      }
    } catch (err) {
      setMessage('Failed to fetch user details');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteMessage("Deleting user...");
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setDeleteMessage('User deleted successfully!');
        setTimeout(() => {
          navigate('/users');
        }, 2000);
      } else {
        setDeleteMessage('Error: ' + (data.message || 'Failed to delete user'));
      }
    } catch (err) {
      setDeleteMessage('Error deleting user: ' + err.message);
      console.error('Error deleting user:', err);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 1:
        return 'Admin';
      case 2:
        return 'App User';
      default:
        return 'Unknown';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 1:
        return 'danger';
      case 2:
        return 'success';
      default:
        return 'secondary';
    }
  };



  useEffect(() => {
    if (!user) {
      setMessage("Please login first!");
      setLoading(false);
    } else {
      fetchUser();
    }
  }, [user, id]);

  if (loading) {
    return (
      <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Container className="text-center" style={{ marginTop: '100px' }}>
          <Spinner animation="border" variant="primary" />
          <h4 className="mt-3" style={{ color: 'white' }}>Loading user details...</h4>
        </Container>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Container style={{ marginTop: '100px', paddingBottom: '40px' }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700',
              color: 'white',
              marginBottom: '8px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                         }}>
               <i className="fa-solid fa-user me-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
               {userData?.role === 1 ? (userData?.name || userData?.email || 'Admin User') : 'App User Details'}
             </h1>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '1rem',
              margin: 0,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}>
              View and manage user details
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="info" 
              onClick={() => navigate('/users')} 
              className="btn-modern d-flex align-items-center"
            >
              <i className="fa-solid fa-arrow-left me-2" />Back to Users
            </Button>
            {userData && (
              <Button 
                variant="danger" 
                onClick={() => setShowDeleteModal(true)}
                className="btn-modern d-flex align-items-center"
              >
                <i className="fa-solid fa-trash me-2" />Delete
              </Button>
            )}
          </div>
        </div>

        {message && (
          <Alert variant={message.includes('successfully') ? 'success' : 'danger'} className="mb-4">
            {message}
          </Alert>
        )}

        {userData && (
          <Row className="g-4">
            <Col lg={8}>
              {/* User Information Card */}
              <div className="modern-card">
                <div className="card-header">
                  <h4>
                    <i className="fa-solid fa-user me-2" style={{ color: 'var(--primary-color)' }} />
                    User Information
                  </h4>
                </div>
                <div className="card-body">
                  <Row className="g-4">
                    {/* Basic Info Section */}
                    <Col xs={12}>
                      <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                        <i className="fa-solid fa-info-circle me-2" style={{ color: 'var(--primary-color)' }} />
                        Basic Information
                      </h6>
                      <Row className="g-3">
                                                 {userData.role === 1 ? (
                           <>
                             <Col md={6}>
                               <div className="mb-3">
                                 <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Name</label>
                                 <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                                   {userData.name || 'Not provided'}
                                 </div>
                               </div>
                             </Col>
                             <Col md={6}>
                               <div className="mb-3">
                                 <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Email</label>
                                 <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                                   <i className="fa-solid fa-envelope me-2" style={{ color: 'var(--gray-500)' }} />
                                   {userData.email}
                                 </div>
                               </div>
                             </Col>
                           </>
                         ) : (
                           <Col md={12}>
                             <div className="mb-3">
                               <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>User Type</label>
                               <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                                 <i className="fa-solid fa-mobile-alt me-2" style={{ color: 'var(--gray-500)' }} />
                                 <span style={{ color: 'var(--gray-700)' }}>Mobile App User</span>
                                 <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '4px', fontStyle: 'italic' }}>
                                   This user accesses the app without registration
                                 </div>
                               </div>
                             </div>
                           </Col>
                         )}
                        <Col md={6}>
                          <div className="mb-3">
                            <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Role</label>
                            <div style={{ marginTop: '8px' }}>
                              <Badge 
                                bg={getRoleBadgeColor(userData.role)}
                                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                              >
                                <i className="fa-solid fa-user-tag me-1" />
                                {getRoleLabel(userData.role)}
                              </Badge>
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="mb-3">
                            <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Status</label>
                            <div style={{ marginTop: '8px' }}>
                              <Badge 
                                bg="success"
                                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                              >
                                <i className="fa-solid fa-check me-1" />
                                Active
                              </Badge>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Col>

                    {/* Device Information Section */}
                    <Col xs={12}>
                      <h6 style={{ color: 'var(--gray-700)', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid var(--info-color)', paddingBottom: '8px' }}>
                        <i className="fa-solid fa-mobile-alt me-2" style={{ color: 'var(--info-color)' }} />
                        Device Information
                      </h6>
                      <Row className="g-3">
                        <Col md={12}>
                          <div className="mb-3">
                            <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Device ID</label>
                            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                              {userData.device_id ? (
                                <code style={{ 
                                  fontSize: '0.85rem',
                                  color: 'var(--gray-600)',
                                  backgroundColor: 'var(--gray-100)',
                                  padding: '4px 8px',
                                  borderRadius: '4px'
                                }}>
                                  {userData.device_id}
                                </code>
                              ) : (
                                <span style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>No device ID available</span>
                              )}
                            </div>
                          </div>
                        </Col>
                        <Col md={12}>
                          <div className="mb-3">
                            <label style={{ fontWeight: '600', color: 'var(--gray-700)', fontSize: '0.9rem' }}>Last Login</label>
                            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginTop: '4px' }}>
                              {userData.last_login ? (
                                <>
                                  <i className="fa-solid fa-clock me-2" style={{ color: 'var(--gray-500)' }} />
                                  {formatLastLogin(userData.last_login)}
                                </>
                              ) : (
                                <span style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>Never logged in</span>
                              )}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>

            {/* User Metadata */}
            <Col lg={4}>
              <div className="modern-card">
                <div className="card-header">
                  <h5>
                    <i className="fa-solid fa-clock me-2" style={{ color: 'var(--info-color)' }} />
                    Metadata
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label style={{ 
                      fontWeight: '600', 
                      color: 'var(--gray-700)', 
                      marginBottom: '4px',
                      display: 'block',
                      fontSize: '0.9rem'
                    }}>
                      User ID
                    </label>
                    <div style={{ 
                      fontSize: '0.85rem',
                      color: 'var(--gray-600)',
                      fontFamily: 'monospace',
                      backgroundColor: 'var(--gray-100)',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      wordBreak: 'break-all'
                    }}>
                      {userData._id}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label style={{ 
                      fontWeight: '600', 
                      color: 'var(--gray-700)', 
                      marginBottom: '4px',
                      display: 'block',
                      fontSize: '0.9rem'
                    }}>
                      Created At
                    </label>
                    <div style={{ 
                      fontSize: '0.85rem',
                      color: 'var(--gray-600)'
                    }}>
                      <i className="fa-solid fa-calendar-plus me-2" style={{ color: 'var(--gray-500)' }} />
                      {formatDate(userData.created_at)}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      fontWeight: '600', 
                      color: 'var(--gray-700)', 
                      marginBottom: '4px',
                      display: 'block',
                      fontSize: '0.9rem'
                    }}>
                      Last Updated
                    </label>
                    <div style={{ 
                      fontSize: '0.85rem',
                      color: 'var(--gray-600)'
                    }}>
                      <i className="fa-solid fa-calendar-edit me-2" style={{ color: 'var(--gray-500)' }} />
                      {formatDate(userData.updated_at)}
                    </div>
                  </div>
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
              Delete User
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '24px' }}>
            {deleteMessage ? (
              <Alert variant={deleteMessage.includes('successfully') ? 'success' : 'danger'}>
                {deleteMessage}
              </Alert>
            ) : (
                             <div style={{ color: 'var(--gray-700)' }}>
                 Are you sure you want to delete this <strong>{userData?.role === 1 ? 'admin user' : 'app user'}</strong>? This action will mark the user as deleted.
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
              {deleteMessage.includes('Deleting') ? 'Deleting...' : 'Delete User'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Container>
  );
};

export default UserView; 