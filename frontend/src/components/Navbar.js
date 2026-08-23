import React, { useState } from 'react';
import '../styles/Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <li><a href="#marketplace" className="nav-link">Marketplace</a></li>
          <li><a href="#forum" className="nav-link">Forum</a></li>
          <li><a href="#footer" className="nav-link">About</a></li>
        </ul>

        <div className="nav-buttons">
          <a href="#login" className="btn-login">Login</a>
          <a href="#register" className="btn-signup">Sign Up</a>
        </div>
      </div>
    </nav>
  );
}