import React from 'react';
import '../styles/Hero.css';

export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Connect. Share. <span className="highlight">Learn.</span>
          </h1>
          <p className="hero-subtitle">
            Join a thriving community of students sharing knowledge, resources, and opportunities.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Start Learning</button>
            <button className="btn btn-secondary">Browse Resources</button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card card-1">
            <div className="card-icon">💬</div>
            <h3>Forum</h3>
            <p>Ask questions, share ideas, and learn from discussions</p>
          </div>

          <div className="visual-card card-2">
            <div className="card-icon">📝</div>
            <h3>Notes</h3>
            <p>Share and access detailed study notes from classmates</p>
          </div>

          <div className="visual-card card-3">
            <div className="card-icon">🏪</div>
            <h3>Marketplace</h3>
            <p>Buy and sell notes, books, and study materials</p>
          </div>
        </div>
      </div>
    </div>
  );
}