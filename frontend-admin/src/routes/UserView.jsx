import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const UserView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      } else {
        setError(data.message || 'Failed to fetch user');
      }
    } catch (err) {
      setError('Failed to fetch user details');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action will mark the user as deleted.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('User deleted successfully');
        // Refresh user data to show updated status
        await fetchUser();
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreUser = async () => {
    if (!window.confirm('Are you sure you want to restore this user?')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${id}/restore`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('User restored successfully');
        // Refresh user data to show updated status
        await fetchUser();
      } else {
        alert(data.message || 'Failed to restore user');
      }
    } catch (err) {
      alert('Failed to restore user');
      console.error('Error restoring user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 1:
        return 'Admin';
      case 2:
        return 'User';
      default:
        return 'Unknown';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 1:
        return 'badge bg-danger';
      case 2:
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
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

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
        <button onClick={() => navigate('/users')} className="btn btn-secondary">
          <i className="fas fa-arrow-left me-2"></i>Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning" role="alert">
          User not found
        </div>
        <button onClick={() => navigate('/users')} className="btn btn-secondary">
          <i className="fas fa-arrow-left me-2"></i>Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              User Details
            </h1>
            <div>
              <button 
                onClick={() => navigate('/')} 
                className="btn btn-outline-light me-2"
              >
                <i className="fas fa-tachometer-alt me-2"></i>Dashboard
              </button>
              <button 
                onClick={() => navigate('/users')} 
                className="btn btn-outline-light"
              >
                <i className="fas fa-arrow-left me-2"></i>Back to Users
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Information Card */}
      <div className="row">
        <div className="col-12">
          <div className="modern-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>User Information
              </h5>
              <div>
                {user.is_deleted ? (
                  <button
                    onClick={handleRestoreUser}
                    disabled={actionLoading}
                    className="btn btn-success btn-sm me-2"
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    ) : (
                      <i className="fas fa-undo me-1"></i>
                    )}
                    Restore User
                  </button>
                ) : (
                  <button
                    onClick={handleDeleteUser}
                    disabled={actionLoading}
                    className="btn btn-danger btn-sm"
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    ) : (
                      <i className="fas fa-trash me-1"></i>
                    )}
                    Delete User
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td className="fw-bold text-muted">User ID:</td>
                        <td>
                          <code className="text-dark">{user._id}</code>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted">Name:</td>
                        <td>{user.name || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted">Email:</td>
                        <td>
                          <i className="fas fa-envelope me-2"></i>
                          {user.email}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted">Role:</td>
                        <td>
                          <span className={getRoleBadgeClass(user.role)}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted">Status:</td>
                        <td>
                          {user.is_deleted ? (
                            <span className="badge bg-danger">
                              <i className="fas fa-times me-1"></i>Deleted
                            </span>
                          ) : (
                            <span className="badge bg-success">
                              <i className="fas fa-check me-1"></i>Active
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td className="fw-bold text-muted">Device ID:</td>
                        <td>
                          {user.device_id ? (
                            <code className="text-dark">
                              {user.device_id.length > 20 
                                ? `${user.device_id.substring(0, 20)}...` 
                                : user.device_id
                              }
                            </code>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted">Last Login:</td>
                        <td>
                          {user.last_login ? (
                            <>
                              <i className="fas fa-clock me-2"></i>
                              {formatDate(user.last_login)}
                            </>
                          ) : (
                            'Never'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted">Created:</td>
                        <td>
                          <i className="fas fa-calendar-plus me-2"></i>
                          {formatDate(user.created_at)}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted">Updated:</td>
                        <td>
                          <i className="fas fa-calendar-edit me-2"></i>
                          {formatDate(user.updated_at)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView; 