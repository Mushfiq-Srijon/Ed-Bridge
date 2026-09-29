
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';
import ProfileDropdown from './ProfileDropdown';
import { listingsAPI } from '../services/api';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [unreadConversations, setUnreadConversations] = useState(0);

  useEffect(() => {
    if (!token) {
      setUnreadConversations(0);
      return undefined;
    }

    let active = true;

    const loadUnreadCount = async () => {
      try {
        const response = await listingsAPI.getUnreadConversationCount();

        if (active) {
          setUnreadConversations(response.count || 0);
        }
      } catch (error) {
        console.error('Failed to load unread message count:', error);
      }
    };

    loadUnreadCount();

    const intervalId = window.setInterval(loadUnreadCount, 10000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  const handleScrollToSection = (sectionId) => {
    const scrollToSection = () => {
      const element = document.getElementById(sectionId);

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    };

    if (window.location.pathname === '/') {
      scrollToSection();
      return;
    }

    navigate('/');
    setTimeout(scrollToSection, 150);
  };

  const handleHomeClick = () => {
    setMobileMenuOpen(false);

    if (window.location.pathname === '/') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
      return;
    }

    navigate('/');
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 150);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-text">
            Ed-Bridge
          </Link>
        </div>

        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          ☰
        </button>

        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li>
            <button
              type="button"
              className="nav-link nav-button-link"
              onClick={handleHomeClick}
            >
              Home
            </button>
          </li>

          <li>
            <button
              type="button"
              className="nav-link nav-button-link"
              onClick={() => {
                setMobileMenuOpen(false);
                handleScrollToSection('features');
              }}
            >
              Features
            </button>
          </li>

          <li>
            <Link
              to="/marketplace"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
          </li>

          <li>
            <Link
              to="/cart"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cart
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </Link>
          </li>

          <li>
            <Link
              to="/notes"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Notes
            </Link>
          </li>

          <li>
            <Link
              to="/forum"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Forum
            </Link>
          </li>

          <li>
            <button
              type="button"
              className="nav-link nav-button-link"
              onClick={() => {
                setMobileMenuOpen(false);
                handleScrollToSection('about');
              }}
            >
              About
            </button>
          </li>

          <li>
            <button
              type="button"
              className="nav-link nav-button-link theme-menu-button"
              onClick={toggleTheme}
              aria-label={`Switch to ${
                theme === 'light' ? 'dark' : 'light'
              } mode`}
              title={`Switch to ${
                theme === 'light' ? 'dark' : 'light'
              } mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </li>

          {!token && (
            <li className="mobile-auth-links">
              <Link
                to="/login"
                className="mobile-auth-link mobile-auth-login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="mobile-auth-link mobile-auth-signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-buttons">
          {token && user ? (
            <ProfileDropdown
              unreadConversations={unreadConversations}
            />
          ) : (
            <>
              <Link to="/login" className="btn-login">
                Login
              </Link>

              <Link to="/register" className="btn-signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}