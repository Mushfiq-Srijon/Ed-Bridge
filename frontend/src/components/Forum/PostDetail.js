import React, { useState } from 'react';
import CommentSection from './CommentSection';

import { forumAPI } from '../../services/api';
import { transformPost } from '../../utils/forumAdapter';

export default function PostDetail({ post, onBack }) {
  const [currentPost, setCurrentPost] = useState(post);
  const [showOptions, setShowOptions] = useState(false);

  const score = currentPost.upvotes - currentPost.downvotes;

  const handleUpvote = async () => {
  try {
    if (currentPost.userHasUpvoted) {
      await forumAPI.removeUpvote(currentPost.id);

      setCurrentPost((prev) => ({
        ...prev,
        upvotes: Math.max(0, prev.upvotes - 1),
        userHasUpvoted: false,
      }));

    } else {
      await forumAPI.upvotePost(currentPost.id);

      setCurrentPost((prev) => ({
        ...prev,
        upvotes: prev.upvotes + 1,
        userHasUpvoted: true,
      }));
    }

  } catch (error) {
    console.error('Failed to update vote:', error);

    alert(error.message || 'Failed to update vote');
  }
};

  const handleDownvote = () => {
  alert('Downvoting is not available yet.');
};

  const handleFollow = async () => {
  try {
    if (currentPost.userIsFollowing) {
      await forumAPI.unfollowPost(currentPost.id);

      setCurrentPost((prev) => ({
        ...prev,
        userIsFollowing: false,
      }));

    } else {
      await forumAPI.followPost(currentPost.id);

      setCurrentPost((prev) => ({
        ...prev,
        userIsFollowing: true,
      }));
    }

  } catch (error) {
    console.error('Failed to update follow status:', error);

    alert(error.message || 'Failed to update follow status');
  }
};

  const handleReply = async (replyData) => {
  try {
    await forumAPI.addReply(
      currentPost.id,
      {
        content: replyData.content,
        isAnonymous: replyData.isAnonymous,
      }
    );

    // Reload the complete post so we get the real reply
    const updatedPost = await forumAPI.getPost(currentPost.id);

    setCurrentPost(transformPost(updatedPost));

  } catch (error) {
    console.error('Failed to add reply:', error);

    alert(error.message || 'Failed to add reply');
  }
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