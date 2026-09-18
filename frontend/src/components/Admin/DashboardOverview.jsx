import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';

export default function DashboardOverview({ refreshTrigger }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, [refreshTrigger]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!dashboard) {
    return <div>No data</div>;
  }

  return (
    <div className="dashboard-overview">
      <h2>Overview</h2>

      <div className="stats-grid">
        {/* USERS */}
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{dashboard.totalUsers}</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-subtext">
              {dashboard.suspendedUsers} suspended
            </div>
          </div>
        </div>

        {/* LISTINGS */}
        <div className="stat-card listings">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{dashboard.totalListings}</div>
            <div className="stat-label">Total Listings</div>
            <div className="stat-subtext">
              {dashboard.activeListings} active
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div className="stat-card notes">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{dashboard.totalNotes}</div>
            <div className="stat-label">Total Notes</div>
            <div className="stat-subtext">
              {dashboard.reportedNotes} reported
            </div>
          </div>
        </div>

        {/* FORUMS */}
        <div className="stat-card forums">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{dashboard.totalPosts}</div>
            <div className="stat-label">Forum Posts</div>
            <div className="stat-subtext">
              {dashboard.reportedPosts} reported
            </div>
          </div>
        </div>

        {/* REPORTS */}
        <div className="stat-card reports">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{dashboard.totalReports}</div>
            <div className="stat-label">Total Reports</div>
            <div className="stat-subtext">
              {dashboard.pendingReports} pending
            </div>
          </div>
        </div>
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="status-breakdown">
        <h3>Listings Status</h3>
        <div className="status-items">
          <div className="status-item">
            <span className="status-label">Active</span>
            <span className="status-count">{dashboard.activeListings}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Under Investigation</span>
            <span className="status-count">{dashboard.underInvestigationListings}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Sold</span>
            <span className="status-count">{dashboard.soldListings}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Removed</span>
            <span className="status-count">{dashboard.removedListings}</span>
          </div>
        </div>
      </div>
    </div>
  );
}