import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import '../styles/SettingsPage.css';

export default function SettingsPage() {
  const { theme, setLightTheme, setDarkTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>Appearance</h2>
        <p className="settings-description">Choose how Ed-Bridge looks to you.</p>

        <div className="theme-options">
          <button
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={setLightTheme}
          >
            <span className="theme-icon">☀️</span>
            <span>Light</span>
          </button>

          <button
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={setDarkTheme}
          >
            <span className="theme-icon">🌙</span>
            <span>Dark</span>
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2>Account</h2>
        <p className="settings-description">Manage your account details.</p>

        {user ? (
          <div className="settings-row">
            <div>
              <p className="settings-row-title">Profile Information</p>
              <p className="settings-row-subtitle">Update your name, institution, and photo</p>
            </div>
            <a href="/profile" className="btn-settings-link">Go to Profile</a>
          </div>
        ) : (
          <p className="settings-description">Log in to manage account details.</p>
        )}

        {user && <div className="settings-row">
          <div>
            <p className="settings-row-title">Email</p>
            <p className="settings-row-subtitle">{user?.email}</p>
          </div>
        </div>}
      </div>
    </div>
  );
}