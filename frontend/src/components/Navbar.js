import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">Ed-Bridge</span>
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li><a href="#features" className="nav-link">Features</a></li>
          <li>
            <Link to="/marketplace" className="nav-link">
              Marketplace
            </Link>
          </li>
          <li><a href="#forum" className="nav-link">Forum</a></li>
          <li><a href="#footer" className="nav-link">About</a></li>
        </ul>

        <div className="nav-buttons">
          {token && user ? (
            <>
              <span className="nav-username">Hi, {user.name}</span>
              <button className="btn-login" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}