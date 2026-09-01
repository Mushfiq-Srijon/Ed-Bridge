import React, { useState } from 'react';

export default function CommentCard({ comment, onUpvote, onDownvote, onReport }) {
  const [showOptions, setShowOptions] = useState(false);

  const score = comment.upvotes - comment.downvotes;

  return (
    <div className="comment-card">
      <div className="comment-header">
        <div className="comment-author">
          <span className="author-avatar">👤</span>
          <div>
            <p className="author-name">
              {comment.isAnonymous ? '🔒 Anonymous' : comment.author.name}
            </p>
            <span className="comment-time">{comment.createdAt}</span>
          </div>
        </div>
        {comment.isMarkedBest && (
          <span className="best-answer-badge">✓ Best Answer</span>
        )}
        <button
          className="options-btn"
          onClick={() => setShowOptions(!showOptions)}
        >
          ⋮
        </button>
      </div>

      <p className="comment-content">{comment.content}</p>

      <div className="comment-footer">
        <div className="comment-actions">
          <button
            className={`action-btn upvote-btn ${comment.userHasUpvoted ? 'active' : ''}`}
            onClick={() => onUpvote(comment.id)}
          >
            👍 {comment.upvotes > 0 ? comment.upvotes : ''}
          </button>
          <button
            className={`action-btn downvote-btn ${comment.userHasDownvoted ? 'active' : ''}`}
            onClick={() => onDownvote(comment.id)}
          >
            👎 {comment.downvotes > 0 ? comment.downvotes : ''}
          </button>
        </div>

        {showOptions && (
          <button className="report-btn" onClick={() => onReport(comment.id)}>
            🚩 Report
          </button>
        )}
      </div>
    </div>
  );
}