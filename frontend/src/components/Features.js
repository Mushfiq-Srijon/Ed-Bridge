import React from 'react';
import '../styles/Features.css';

export default function Features() {
  const features = [
    {
      icon: '🛒',
      title: 'Smart Marketplace',
      description: 'Buy and sell used academic materials at affordable prices. Extend resource lifecycle, reduce waste.'
    },
    {
      icon: '📝',
      title: 'Notes Repository',
      description: 'Access quality lecture notes and study guides shared by peers. Free, organized, and searchable.'
    },
    {
      icon: '💬',
      title: 'Academic Forum',
      description: 'Ask questions, share insights, and learn together. Post anonymously if you prefer.'
    },
    {
      icon: '🔐',
      title: 'Secure & Private',
      description: 'Your data is secure. Seller verification, user reports, and admin moderation.'
    },
    {
      icon: '⭐',
      title: 'Ratings & Reviews',
      description: 'Build trust through transparent seller ratings and community feedback.'
    },
    {
      icon: '🌍',
      title: 'Open to Everyone',
      description: 'No institutional restrictions. Students from any background welcome.'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="features-container">
        <h2 className="section-title">Why Ed-Bridge?</h2>
        <p className="section-subtitle">Everything you need, in one platform</p>
        
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}