import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import { useAuth } from '../../context/AuthContext';
import AdminLoading from './AdminLoading';

export default function UsersManagement({ onRefresh, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ All: 0, Active: 0, Suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { user: currentUser } = useAuth();
  const isCurrentAdmin = selectedUser?.id === currentUser?.id;

  // Load counts for all statuses
  const loadCounts = async () => {
    try {
      const allUsers = await adminAPI.getUsers(search || null, null);
      const active = await adminAPI.getUsers(search || null, 'active');
      const suspended = await adminAPI.getUsers(search || null, 'suspended');

      setCounts({
        All: allUsers.length,
        Active: active.length,
        Suspended: suspended.length
      });
    } catch (err) {
      console.error('Failed to load counts:', err);
    }
  };

  // Load filtered users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getUsers(search || null, statusFilter);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    // Debouncing keeps the input mounted while the API catches up, so typing
    // naturally remains in one uninterrupted focus session.
    const searchTimer = setTimeout(() => {
      loadCounts();
      loadUsers();
    }, 280);

    return () => clearTimeout(searchTimer);
  }, [search, statusFilter, refreshTrigger]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSuspend = async (userId) => {
    try {
      setActionLoading(true);
      await adminAPI.suspendUser(userId);
      setSelectedUser(null);
      loadCounts();
      loadUsers();
      onRefresh();
    } catch (err) {
      alert('Failed to suspend user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReinstate = async (userId) => {
    try {
      setActionLoading(true);
      await adminAPI.reinstateUser(userId);
      setSelectedUser(null);
      loadCounts();
      loadUsers();
      onRefresh();
    } catch (err) {
      alert('Failed to reinstate user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !selectedUser && !hasLoaded) {
    return (
      <AdminLoading label="Loading users" />
    );
  }

  return (
    <div className="users-management">
      <h2>Users Management</h2>

      {error && <div className="error-message">{error}</div>}

      {/* SEARCH & FILTER */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
        {loading && <span className="admin-search-status">Updating results...</span>}
        <div className="filter-tabs">
          <button
            className={`filter-btn ${!statusFilter ? 'active' : ''}`}
            onClick={() => setStatusFilter(null)}
          >
            All Users ({counts.All})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active ({counts.Active})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'suspended' ? 'active' : ''}`}
            onClick={() => setStatusFilter('suspended')}
          >
            Suspended ({counts.Suspended})
          </button>
        </div>
      </div>

      {/* USER DETAIL OR LIST */}
      {selectedUser ? (
        <div className="user-detail">
          <button className="back-btn" onClick={() => setSelectedUser(null)}>
            Back
          </button>

          <div className="detail-card">
            <h3>{selectedUser.name}</h3>
            <p className="detail-email">{selectedUser.email}</p>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Status</span>
                <span className={`status ${selectedUser.isSuspended ? 'suspended' : 'active'}`}>
                  {selectedUser.isSuspended ? 'Suspended' : 'Active'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Institution</span>
                <span>{selectedUser.institution || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Education Level</span>
                <span>{selectedUser.educationLevel || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone</span>
                <span>{selectedUser.phone || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Listings</span>
                <span>{selectedUser.listingsCount}</span>
              </div>
              <div className="detail-item">
                <span className="label">Sold</span>
                <span>{selectedUser.soldCount}</span>
              </div>
              <div className="detail-item">
                <span className="label">Reports</span>
                <span>{selectedUser.reportsCount}</span>
              </div>
              <div className="detail-item">
                <span className="label">Joined</span>
                <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="action-buttons">
              {selectedUser.isSuspended ? (
                <button
                  className="btn-reinstate"
                  onClick={() => handleReinstate(selectedUser.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Reinstate User'}
                </button>
              ) : (
                <button
                  className="btn-suspend"
                  onClick={() => handleSuspend(selectedUser.id)}
                  disabled={actionLoading || isCurrentAdmin}
                >
                  {isCurrentAdmin ? 'Cannot Suspend Own Account' : actionLoading ? 'Processing...' : 'Suspend User'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="users-list">
          {users.length === 0 ? (
            <div className="empty-state">No users found</div>
          ) : (
            users.map(user => (
              <div key={user.id} className="user-item" onClick={() => setSelectedUser(user)}>
                <div className="user-header">
                  <h4>{user.name}</h4>
                  <span className={`status-badge ${user.isSuspended ? 'suspended' : 'active'}`}>
                    {user.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
                <p className="user-email">{user.email}</p>
                <p className="user-stats">
                  Listings: {user.listingsCount} | Sold: {user.soldCount}
                </p>
                <p className="user-date">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
