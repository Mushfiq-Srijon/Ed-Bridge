import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import NotesPage from './pages/NotesPage';
import ForumPage from './pages/ForumPage';

import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/marketplace/listing/:id" element={<ListingDetailsPage />} />
          <Route path="/forum" element={<ForumPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;