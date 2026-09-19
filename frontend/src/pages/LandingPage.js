import React from 'react';

import Hero from '../components/Hero';

import Features from '../components/Features';

import CTA from '../components/CTA';

import Footer from '../components/Footer';

import '../styles/LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Hero />

      <Features />

      <CTA />

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-heading">
            <span className="about-label">ABOUT ED-BRIDGE</span>
            <h2>One place for students to learn, share and connect.</h2>
            <p>
              Ed-Bridge is a student-focused platform that brings academic
              resources and support together in one place.
            </p>
          </div>

          <div className="about-content">
            <div className="about-card">
              <h3>📚 Learn & Share</h3>
              <p>
                Students can discover and share free academic notes, making
                useful learning resources easier to find and reuse.
              </p>
            </div>

            <div className="about-card">
              <h3>🛍️ Academic Marketplace</h3>
              <p>
                Students can buy and sell used academic materials, helping
                reduce unnecessary spending and encouraging resource reuse.
              </p>
            </div>

            <div className="about-card">
              <h3>💬 Ask & Connect</h3>
              <p>
                The academic Q&A forum gives students a space to ask
                questions, share knowledge and get academic support.
              </p>
            </div>
          </div>

          <div className="about-impact">
            <h3>Our broader impact</h3>
            <p>
              Ed-Bridge is designed around accessible education, reduced
              inequalities and responsible reuse of resources.
            </p>

            <div className="impact-tags">
              <span>SDG 4 · Quality Education</span>
              <span>SDG 10 · Reduced Inequalities</span>
              <span>SDG 12 · Responsible Consumption</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}