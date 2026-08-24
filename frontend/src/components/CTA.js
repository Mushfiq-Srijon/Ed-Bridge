import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/CTA.css';

export default function CTA() {
  return (
    <section className="cta">
      <div className="cta-content">
        <h2>Ready to Transform Your Academic Journey?</h2>
        <p>Join thousands of students already saving money and sharing knowledge</p>
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary">Create Free Account</Link>
        </div>
      </div>
    </section>
  );
}