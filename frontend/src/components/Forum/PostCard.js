import React, { useState } from 'react';
import { forumAPI } from '../../services/api';

export default function PostCard({ post, onSelect }) {
  const [isSaved, setIsSaved] = useState(Boolean(post.userHasSaved));
  const [saving, setSaving] = useState(false);

  const handleSave = async (event) => {
    event.stopPropagation();
    if (saving) return;

    try {
      setSaving(true);
      if (isSaved) await forumAPI.unsave(post.id);
      else await forumAPI.save(post.id);
      setIsSaved((saved) => !saved);
    } catch (error) {
      alert(error.message || 'Unable to update saved item.');
    } finally {
      setSaving(false);
    }
  };

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

      <div className="post-card-actions">
        <button className="btn-open" onClick={() => onSelect(post)}>View Discussion →</button>
        <button className={`post-save-button ${isSaved ? 'is-saved' : ''}`} onClick={handleSave} disabled={saving}>
          {isSaved ? '🔖 Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  );
}
