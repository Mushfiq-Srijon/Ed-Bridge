import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfileDropdown.css';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        title={user?.name}
      >
        👤 {user?.name?.split(' ')[0]}
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p className="user-email">{user?.email}</p>
          </div>

          <div className="dropdown-divider"></div>

          <button
            className="dropdown-item"
            onClick={() => handleMenuClick('/profile')}
          >
            👤 My Profile
          </button>

          <button
            className="dropdown-item"
            onClick={() => handleMenuClick('/dashboard')}
          >
            📊 My Dashboard
          </button>

          <button
            className="dropdown-item"
            onClick={() => handleMenuClick('/my-listings')}
          >
            📦 My Listings
          </button>

          <button
            className="dropdown-item"
            onClick={() => handleMenuClick('/settings')}
          >
            ⚙️ Settings
          </button>

          <button
            className="dropdown-item"
            onClick={() => handleMenuClick('/bookmarks')}
          >
            🔖 Saved Items
          </button>

          <div className="dropdown-divider"></div>

          <button
            className="dropdown-item logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}