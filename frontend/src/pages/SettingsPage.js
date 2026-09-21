import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/SettingsPage.css';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      await authAPI.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage('Password changed successfully.');
    } catch (error) {
      setPasswordError(error.message || 'Could not change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;

    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/', { replace: true });
    } catch (error) {
      setPasswordError(error.message || 'Could not delete account.');
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

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

      {user && (
        <>
          <section className="settings-section">
            <h2>Change password</h2>
            <p className="settings-description">Use a new password to keep your account secure.</p>
            <form className="password-settings-form" onSubmit={handlePasswordChange}>
              <input type="password" placeholder="Current password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} required />
              <input type="password" placeholder="New password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} required />
              <input type="password" placeholder="Confirm new password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} required />
              <button type="submit" className="btn-settings-link" disabled={savingPassword}>{savingPassword ? 'Updating…' : 'Change Password'}</button>
            </form>
            {passwordMessage && <p className="settings-success">{passwordMessage}</p>}
            {passwordError && <p className="settings-error">{passwordError}</p>}
          </section>

          <section className="settings-section danger-settings-section">
            <h2>Delete account</h2>
            <p className="settings-description">Permanently remove your Ed-Bridge account and personal data.</p>
            <button type="button" className="delete-account-button" onClick={handleDeleteAccount}>Delete My Account</button>
          </section>
        </>
      )}
    </div>
  );
}
