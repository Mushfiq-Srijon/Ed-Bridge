import React, { useState } from 'react';
import CommentCard from './CommentCard';

export default function CommentSection({ postId, replies, onReply, onUpvoteComment, onDownvoteComment, onReportComment }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;

    onReply({
      content: replyContent,
      isAnonymous,
    });

    setReplyContent('');
    setIsAnonymous(false);
    setShowReplyForm(false);
  };

  return (
    <div className="comment-section">
      <h3 className="comments-title">
        💬 {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
      </h3>

      <button
        className="btn-add-reply"
        onClick={() => setShowReplyForm(!showReplyForm)}
      >
        {showReplyForm ? '✕ Cancel' : '+ Add Reply'}
      </button>

      {showReplyForm && (
        <div className="reply-form">
          <textarea
            placeholder="Share your thoughts..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows="4"
            className="reply-textarea"
          />

          <div className="reply-options">
            <label className="anonymous-checkbox">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>Post anonymously 🔒</span>
            </label>

            <button
              className="btn-submit-reply"
              onClick={handleSubmitReply}
              disabled={!replyContent.trim()}
            >
              Post Reply
            </button>
          </div>
        </div>
      )}

      <div className="comments-list">
        {replies.length === 0 ? (
          <p className="no-replies">No replies yet. Be the first to reply!</p>
        ) : (
          replies.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onUpvote={() => onUpvoteComment(comment.id)}
              onDownvote={() => onDownvoteComment(comment.id)}
              onReport={() => onReportComment(comment.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}