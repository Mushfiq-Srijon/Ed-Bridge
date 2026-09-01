import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const handleScrollToSection = (sectionId) => {
    const scrollToSection = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (window.location.pathname === '/') {
      scrollToSection();
      return;
    }

    navigate('/');
    setTimeout(scrollToSection, 150);
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
          <li>
            <button
              type="button"
              className="nav-link nav-button-link"
              onClick={() => {
                if (window.location.pathname === '/') {
                  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  return;
                }
                navigate('/');
                setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }), 150);
              }}
            >
              Home
            </button>
          </li>
          <li>
            <button
              type="button"
              className="nav-link nav-button-link"
              onClick={() => handleScrollToSection('features')}
            >
              Features
            </button>
          </li>
          <li>
            <Link to="/marketplace" className="nav-link">
              Marketplace
            </Link>
          </li>

          <li>
            <Link to="/notes" className="nav-link">
              Notes
            </Link>
          </li>
          <li>
            <Link to="/forum" className="nav-link">Forum</Link>
          </li>
          <li>
            <button
              type="button"
              className="nav-link nav-button-link"
              onClick={() => handleScrollToSection('footer')}
            >
              About
            </button>
          </li>
        </ul>

        <div className="nav-buttons">
          {token && user ? (
            <ProfileDropdown />
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