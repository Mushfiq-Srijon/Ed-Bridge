import React from 'react';
import RegisterForm from '../components/Auth/RegisterForm';
import '../styles/Login.css';

export default function RegisterPage() {
  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <div className="auth-card">
          <RegisterForm />
        </div>
        <div className="auth-banner">
          <div className="banner-content">
            <h3>Join the Ed-Bridge Community</h3>
            <p>Connect with thousands of students sharing resources, helping each other, and learning together.</p>
            <ul className="features-list">
              <li>✓ 100% Free to Join</li>
              <li>✓ Verified Student Community</li>
              <li>✓ Safe & Secure Platform</li>
              <li>✓ Instant Access to Resources</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}