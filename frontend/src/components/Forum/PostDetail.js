import React, { useState } from 'react';
import CommentSection from './CommentSection';

export default function PostDetail({ post, onBack }) {
  const [currentPost, setCurrentPost] = useState(post);
  const [showOptions, setShowOptions] = useState(false);

  const score = currentPost.upvotes - currentPost.downvotes;

  const handleUpvote = () => {
    setCurrentPost(prev => ({
      ...prev,
      upvotes: prev.userHasUpvoted ? prev.upvotes - 1 : prev.upvotes + 1,
      userHasUpvoted: !prev.userHasUpvoted,
      userHasDownvoted: false,
    }));
  };

  const handleDownvote = () => {
    setCurrentPost(prev => ({
      ...prev,
      downvotes: prev.userHasDownvoted ? prev.downvotes - 1 : prev.downvotes + 1,
      userHasDownvoted: !prev.userHasDownvoted,
      userHasUpvoted: false,
    }));
  };

  const handleFollow = () => {
    setCurrentPost(prev => ({
      ...prev,
      followers: prev.userIsFollowing ? prev.followers - 1 : prev.followers + 1,
      userIsFollowing: !prev.userIsFollowing,
    }));
  };

  const handleReply = (replyData) => {
    const newReply = {
      id: currentPost.replies.length + 1,
      content: replyData.content,
      author: replyData.isAnonymous 
        ? null 
        : { id: 99, name: 'You', email: 'your@email.com' },
      isAnonymous: replyData.isAnonymous,
      upvotes: 0,
      downvotes: 0,
      createdAt: 'just now',
      isMarkedBest: false,
      userHasUpvoted: false,
    };

    setCurrentPost(prev => ({
      ...prev,
      replies: [...prev.replies, newReply],
    }));
  };

  const handleUpvoteComment = (commentId) => {
    setCurrentPost(prev => ({
      ...prev,
      replies: prev.replies.map(reply =>
        reply.id === commentId
          ? {
              ...reply,
              upvotes: reply.userHasUpvoted ? reply.upvotes - 1 : reply.upvotes + 1,
              userHasUpvoted: !reply.userHasUpvoted,
              userHasDownvoted: false,
            }
          : reply
      ),
    }));
  };

  const handleDownvoteComment = (commentId) => {
    setCurrentPost(prev => ({
      ...prev,
      replies: prev.replies.map(reply =>
        reply.id === commentId
          ? {
              ...reply,
              downvotes: reply.userHasDownvoted ? reply.downvotes - 1 : reply.downvotes + 1,
              userHasDownvoted: !reply.userHasDownvoted,
              userHasUpvoted: false,
            }
          : reply
      ),
    }));
  };

  const handleReportComment = (commentId) => {
    alert(`Comment ${commentId} reported! Admin will review it.`);
  };

  return (
    <div className="post-detail">
      <button className="btn-back" onClick={onBack}>
        ← Back to Forum
      </button>

      <div className="post-detail-header">
        <h1>{currentPost.title}</h1>
        <div className="post-detail-meta">
          <span className="meta-item">
            {currentPost.isAnonymous ? '🔒 Anonymous' : `👤 ${currentPost.author.name}`}
          </span>
          <span className="meta-item">📅 {currentPost.createdAt}</span>
          <span className="meta-item">👁️ {currentPost.views} views</span>
          <span className="subject-badge">{currentPost.subject}</span>
        </div>
      </div>

      <div className="post-detail-content">
        <p>{currentPost.content}</p>
      </div>

      <div className="post-tags">
        {currentPost.tags.map(tag => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
      </div>

      <div className="post-detail-actions">
        <button
          className={`action-btn upvote-btn ${currentPost.userHasUpvoted ? 'active' : ''}`}
          onClick={handleUpvote}
        >
          👍 Upvote ({currentPost.upvotes})
        </button>

        <button
          className={`action-btn downvote-btn ${currentPost.userHasDownvoted ? 'active' : ''}`}
          onClick={handleDownvote}
        >
          👎 Downvote ({currentPost.downvotes})
        </button>

        <button
          className={`action-btn follow-btn ${currentPost.userIsFollowing ? 'active' : ''}`}
          onClick={handleFollow}
        >
          🔔 Follow ({currentPost.followers})
        </button>

        <button
          className="action-btn report-btn"
          onClick={() => alert('Post reported!')}
        >
          🚩 Report
        </button>
      </div>

      <hr />

      <CommentSection
        postId={currentPost.id}
        replies={currentPost.replies}
        onReply={handleReply}
        onUpvoteComment={handleUpvoteComment}
        onDownvoteComment={handleDownvoteComment}
        onReportComment={handleReportComment}
      />
    </div>
  );
}