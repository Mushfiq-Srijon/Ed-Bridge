import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';
import { BeatLoader } from 'react-spinners';

export default function ReportsManagement({ onRefresh, refreshTrigger }) {
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({ All: 0, Pending: 0, Resolved: 0, Dismissed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load counts for all statuses
  const loadCounts = async () => {
    try {
      const allReports = await adminAPI.getReports(null);
      const pending = await adminAPI.getReports('Pending');
      const resolved = await adminAPI.getReports('Resolved');
      const dismissed = await adminAPI.getReports('Dismissed');

      setCounts({
        All: allReports.length,
        Pending: pending.length,
        Resolved: resolved.length,
        Dismissed: dismissed.length
      });
    } catch (err) {
      console.error('Failed to load counts:', err);
    }
  };

  // Load filtered reports
  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getReports(statusFilter);
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
    loadReports();
  }, [statusFilter, refreshTrigger]);

  const handleDismiss = async (reportId) => {
    try {
      setActionLoading(true);
      await adminAPI.dismissReport(reportId);
      setSelectedReport(null);
      loadCounts();
      loadReports();
      onRefresh();
    } catch (err) {
      alert('Failed to dismiss report: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (reportId, suspendUser) => {
    try {
      setActionLoading(true);
      const action = suspendUser ? 'ResolveSuspend' : 'Resolve';
      await adminAPI.resolveReport(reportId, action);
      setSelectedReport(null);
      loadCounts();
      loadReports();
      onRefresh();
    } catch (err) {
      alert('Failed to resolve report: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !selectedReport) {
    return (
      <div className="loading-spinner">
        <BeatLoader color="#3b82f6" size={12} />
      </div>
    );
  }

  return (
    <div className="reports-management">
      <h2>Reports Management</h2>

      {error && <div className="error-message">{error}</div>}

      {/* FILTER BUTTONS */}
      <div className="filter-tabs">
        <button
          className={`filter-btn ${!statusFilter ? 'active' : ''}`}
          onClick={() => setStatusFilter(null)}
        >
          All Reports ({counts.All})
        </button>
        <button
          className={`filter-btn ${statusFilter === 'Pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Pending')}
        >
          Pending ({counts.Pending})
        </button>
        <button
          className={`filter-btn ${statusFilter === 'Resolved' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Resolved')}
        >
          Resolved ({counts.Resolved})
        </button>
        <button
          className={`filter-btn ${statusFilter === 'Dismissed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Dismissed')}
        >
          Dismissed ({counts.Dismissed})
        </button>
      </div>

      {/* REPORTS LIST OR DETAIL */}
      {selectedReport ? (
        <div className="report-detail">
          <button className="back-btn" onClick={() => setSelectedReport(null)}>
            Back
          </button>

          <div className="detail-card">
            <h3>{selectedReport.reportedItemTitle}</h3>
            <p className="detail-meta">
              <span>Type: {selectedReport.type}</span>
              <span>Status: {selectedReport.status}</span>
            </p>

            <div className="detail-section">
              <h4>Reported By</h4>
              <p>{selectedReport.reportedByName} ({selectedReport.reportedByEmail})</p>
            </div>

            <div className="detail-section">
              <h4>Reason</h4>
              <p>{selectedReport.reason}</p>
            </div>

            <div className="detail-section">
              <h4>Details</h4>
              <p>{selectedReport.details}</p>
            </div>

            <div className="detail-section">
              <h4>Content</h4>
              <p className="content-preview">{selectedReport.reportedItemContent}</p>
            </div>

            {selectedReport.status === 'Pending' && (
              <div className="action-buttons">
                <button
                  className="btn-dismiss"
                  onClick={() => handleDismiss(selectedReport.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Dismiss Report'}
                </button>
                <button
                  className="btn-resolve"
                  onClick={() => handleResolve(selectedReport.id, false)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Resolve & Remove'}
                </button>
                <button
                  className="btn-suspend"
                  onClick={() => handleResolve(selectedReport.id, true)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Resolve & Suspend User'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="reports-list">
          {reports.length === 0 ? (
            <div className="empty-state">No reports found</div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="report-item" onClick={() => setSelectedReport(report)}>
                <div className="report-header">
                  <h4>{report.reportedItemTitle}</h4>
                  <span className={`status-badge status-${report.status.toLowerCase()}`}>
                    {report.status}
                  </span>
                </div>
                <p className="report-type">{report.type}</p>
                <p className="report-reason">Reason: {report.reason}</p>
                <p className="report-by">Reported by: {report.reportedByEmail}</p>
                <p className="report-date">{new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}