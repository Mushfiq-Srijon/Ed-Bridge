import React, { useState } from 'react';
import DashboardOverview from '../components/Admin/DashboardOverview';
import ReportsManagement from '../components/Admin/ReportsManagement';
import UsersManagement from '../components/Admin/UsersManagement';
import ListingsManagement from '../components/Admin/ListingsManagement';
import AnalyticsDashboard from '../components/Admin/AnalyticsDashboard';
import '../styles/Admin.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <span className="admin-icon">⚙️</span>
            <h1>Admin Dashboard</h1>
          </div>
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <nav className="admin-nav">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          🚨 Reports
        </button>
        <button
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`nav-tab ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          📦 Listings
        </button>
        <button
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </nav>

      {/* CONTENT */}
      <main className="admin-content">
        {activeTab === 'dashboard' && (
          <DashboardOverview refreshTrigger={refreshTrigger} />
        )}
        {activeTab === 'reports' && (
          <ReportsManagement onRefresh={handleRefresh} refreshTrigger={refreshTrigger} />
        )}
        {activeTab === 'users' && (
          <UsersManagement onRefresh={handleRefresh} refreshTrigger={refreshTrigger} />
        )}
        {activeTab === 'listings' && (
          <ListingsManagement onRefresh={handleRefresh} refreshTrigger={refreshTrigger} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard refreshTrigger={refreshTrigger} />
        )}
      </main>
    </div>
  );
}