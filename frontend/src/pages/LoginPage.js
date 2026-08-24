import React from 'react';
import LoginForm from '../components/Auth/LoginForm';
import '../styles/Login.css';

export default function LoginPage() {
  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <div className="auth-card">
          <LoginForm />
        </div>
        <div className="auth-banner">
          <div className="banner-content">
            <h3>Learn Together, Grow Together</h3>
            <p>Access affordable study materials, share knowledge, and connect with students worldwide.</p>
            <ul className="features-list">
              <li>✓ Buy & sell used materials</li>
              <li>✓ Access free notes & resources</li>
              <li>✓ Get help in the forum</li>
              <li>✓ Join a supportive community</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}