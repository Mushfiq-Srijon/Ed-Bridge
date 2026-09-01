import React from 'react';

export default function PostCard({ post, onSelect }) {
  return (
    <div className="post-card" onClick={() => onSelect(post)}>
      <div className="post-stats">
        <div className="stat">
          <span className="stat-number">{post.upvotes - post.downvotes}</span>
          <span className="stat-label">votes</span>
        </div>
        <div className="stat">
          <span className="stat-number">{post.replies.length}</span>
          <span className="stat-label">replies</span>
        </div>
        <div className="stat">
          <span className="stat-number">{post.views}</span>
          <span className="stat-label">views</span>
        </div>
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-excerpt">{post.content.substring(0, 150)}...</p>

        <div className="post-meta">
          <span className="meta-item">
            {post.isAnonymous ? '🔒 Anonymous' : `👤 ${post.author.name}`}
          </span>
          <span className="subject-badge">{post.subject}</span>
          <span className="meta-time">{post.createdAt}</span>
        </div>

        <div className="post-tags">
          {post.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      </div>

      <button className="btn-open">View Discussion →</button>
    </div>
  );
}