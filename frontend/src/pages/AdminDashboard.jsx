import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import DashboardOverview from '../components/Admin/DashboardOverview';
import ReportsManagement from '../components/Admin/ReportsManagement';
import UsersManagement from '../components/Admin/UsersManagement';
import ListingsManagement from '../components/Admin/ListingsManagement';
import NotesManagement from '../components/Admin/NotesManagement';
import ForumsManagement from '../components/Admin/ForumsManagement';
import AnalyticsDashboard from '../components/Admin/AnalyticsDashboard';
import '../styles/Admin.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { theme } = useTheme();

  // Keeping the navigation data in one place makes the control plane easier to
  // scan and prevents each tab from drifting into a different visual pattern.
  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: '⌂' },
    { id: 'reports', label: 'Reports', icon: '!' },
    { id: 'users', label: 'Users', icon: '◉' },
    { id: 'listings', label: 'Listings', icon: '▣' },
    { id: 'notes', label: 'Notes', icon: '≡' },
    { id: 'forums', label: 'Forums', icon: '◌' },
    { id: 'analytics', label: 'Analytics', icon: '↗' },
  ];

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-grid" aria-hidden="true" />

      {/* Command-center header: visual only, all existing actions remain intact. */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-brand-block">
            <div className="admin-logo">
              <span className="admin-icon" aria-hidden="true">⌘</span>
              <div>
                <span className="admin-kicker">ED-BRIDGE / CONTROL PLANE</span>
                <h1>Admin Dashboard</h1>
              </div>
            </div>
            <p className="admin-header-caption">Moderate the learning network. Keep the signal clean.</p>
          </div>
          <div className="admin-header-actions">
            <span className="theme-status" title={`Current theme: ${theme}`}>
              <span className="status-dot" /> {theme} mode
            </span>
            <button className="refresh-btn" onClick={handleRefresh}>
              <span className="refresh-symbol" aria-hidden="true">↻</span>
              Sync data
            </button>
          </div>
        </div>
      </header>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Navigation stays keyboard-friendly while gaining a compact terminal-like treatment. */}
      <nav className="admin-nav" aria-label="Admin sections">
        <div className="admin-nav-inner">
          <span className="nav-label">MODULES</span>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="nav-tab-icon" aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENT */}
      <main className="admin-content">
        <div className="admin-content-meta">
          <span className="breadcrumb">/ admin / {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()}</span>
          <span className="live-indicator"><span className="status-dot" /> SYSTEM ONLINE</span>
        </div>
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
        {activeTab === 'notes' && (
          <NotesManagement onRefresh={handleRefresh} refreshTrigger={refreshTrigger} />
        )}
        {activeTab === 'forums' && (
          <ForumsManagement onRefresh={handleRefresh} refreshTrigger={refreshTrigger} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard refreshTrigger={refreshTrigger} />
        )}
      </main>
    </div>
  );
}
