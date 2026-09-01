import React from 'react';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Ed-Bridge</h3>
          <p>Empowering students through affordable access to knowledge</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#marketplace">Marketplace</a></li>
            <li><a href="#forum">Forum</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#twitter">Twitter</a>
            <a href="#github">GitHub</a>
            <a href="#linkedin">LinkedIn</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 Ed-Bridge. All rights reserved.</p>
      </div>
    </footer>
  );
}