import React, { useState } from 'react';
import CommentSection from './CommentSection';
import { forumAPI } from '../../services/api';
import { transformPost } from '../../utils/forumAdapter';
import { useAuth } from '../../context/AuthContext';

export default function PostDetail({ post, onBack, onDeleted }) {
  const { user } = useAuth();
  const [currentPost, setCurrentPost] = useState(post);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);

  const isOwner = user && currentPost.authorId === user.id;

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
          // If user had downvoted, backend removed that downvote — reflect it here too
          downvotes: prev.userHasDownvoted ? Math.max(0, prev.downvotes - 1) : prev.downvotes,
          userHasDownvoted: false,
        }));
      }
    } catch (error) {
      console.error('Failed to update vote:', error);
      alert(error.message || 'Failed to update vote');
    }
  };

  const handleDownvote = async () => {
    try {
      if (currentPost.userHasDownvoted) {
        await forumAPI.removeDownvote(currentPost.id);
        setCurrentPost((prev) => ({
          ...prev,
          downvotes: Math.max(0, prev.downvotes - 1),
          userHasDownvoted: false,
        }));
      } else {
        await forumAPI.downvotePost(currentPost.id);
        setCurrentPost((prev) => ({
          ...prev,
          downvotes: prev.downvotes + 1,
          userHasDownvoted: true,
          // If user had upvoted, backend removed that upvote — reflect it here too
          upvotes: prev.userHasUpvoted ? Math.max(0, prev.upvotes - 1) : prev.upvotes,
          userHasUpvoted: false,
        }));
      }
    } catch (error) {
      console.error('Failed to update downvote:', error);
      alert(error.message || 'Failed to update downvote');
    }
  };

  const handleFollow = async () => {
    try {
      if (currentPost.userIsFollowing) {
        await forumAPI.unfollowPost(currentPost.id);
        setCurrentPost((prev) => ({ ...prev, userIsFollowing: false }));
      } else {
        await forumAPI.followPost(currentPost.id);
        setCurrentPost((prev) => ({ ...prev, userIsFollowing: true }));
      }
    } catch (error) {
      console.error('Failed to update follow status:', error);
      alert(error.message || 'Failed to update follow status');
    }
  };

  const handleReply = async (replyData) => {
    try {
      await forumAPI.addReply(currentPost.id, {
        content: replyData.content,
        isAnonymous: replyData.isAnonymous,
      });
      const updatedPost = await forumAPI.getPost(currentPost.id);
      setCurrentPost(transformPost(updatedPost));
    } catch (error) {
      console.error('Failed to add reply:', error);
      alert(error.message || 'Failed to add reply');
    }
  };

  const handleUpvoteComment = async (commentId) => {
    try {
      const reply = currentPost.replies.find(r => r.id === commentId);
      if (!reply) return;

      if (reply.userHasUpvoted) {
        await forumAPI.removeReplyUpvote(currentPost.id, commentId);
      } else {
        await forumAPI.upvoteReply(currentPost.id, commentId);
      }

      // Refresh the post to get accurate counts
      const updatedPost = await forumAPI.getPost(currentPost.id);
      setCurrentPost(transformPost(updatedPost));
    } catch (error) {
      console.error('Failed to upvote reply:', error);
      alert(error.message || 'Failed to upvote reply');
    }
  };

  const handleDownvoteComment = async (commentId) => {
    try {
      const reply = currentPost.replies.find(r => r.id === commentId);
      if (!reply) return;

      if (reply.userHasDownvoted) {
        await forumAPI.removeReplyDownvote(currentPost.id, commentId);
      } else {
        await forumAPI.downvoteReply(currentPost.id, commentId);
      }

      // Refresh the post to get accurate counts
      const updatedPost = await forumAPI.getPost(currentPost.id);
      setCurrentPost(transformPost(updatedPost));
    } catch (error) {
      console.error('Failed to downvote reply:', error);
      alert(error.message || 'Failed to downvote reply');
    }
  };

  const handleEditClick = () => {
    setEditTitle(currentPost.title);
    setEditContent(currentPost.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Title and content cannot be empty');
      return;
    }
    try {
      await forumAPI.updatePost(currentPost.id, {
        title: editTitle,
        content: editContent,
      });
      setCurrentPost((prev) => ({
        ...prev,
        title: editTitle,
        content: editContent,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert(error.message || 'Failed to update post');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this post? This cannot be undone.');
    if (!confirmed) return;

    try {
      await forumAPI.deletePost(currentPost.id);
      if (onDeleted) onDeleted();
      else onBack();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert(error.message || 'Failed to delete post');
    }
  };

  const handleReportPost = async () => {
    const reason = prompt('Why are you reporting this post?');
    if (!reason || reason.trim() === '') return;

    try {
      await forumAPI.reportPost(currentPost.id, reason);
      alert('Post reported successfully. Admin will review it.');
    } catch (error) {
      console.error('Failed to report post:', error);
      alert(error.message || 'Failed to report post');
    }
  };

  const handleReportComment = async (commentId) => {
    const reason = prompt('Why are you reporting this reply?');
    if (!reason || reason.trim() === '') return;

    try {
      await forumAPI.reportReply(currentPost.id, commentId, reason);
      alert('Reply reported successfully. Admin will review it.');
    } catch (error) {
      console.error('Failed to report reply:', error);
      alert(error.message || 'Failed to report reply');
    }
  };

  const authorLabel = currentPost.isAnonymous
    ? '🔒 Anonymous'
    : '👤 ' + (currentPost.author && currentPost.author.name ? currentPost.author.name : 'Unknown User');

  return (
    <div className="post-detail">
      <button className="btn-back" onClick={onBack}>
        ← Back to Forum
      </button>

      <div className="post-detail-header">
        {isEditing ? (
          <input
            type="text"
            className="edit-title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Post title"
          />
        ) : (
          <h1>{currentPost.title}</h1>
        )}

        <div className="post-detail-meta">
          <span className="meta-item">{authorLabel}</span>
          <span className="meta-item">📅 {currentPost.createdAt}</span>
          <span className="meta-item">👁️ {currentPost.views} views</span>
          <span className="subject-badge">{currentPost.subject}</span>
        </div>
      </div>

      {isEditing ? (
        <div className="edit-form">
          <textarea
            className="edit-content-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="6"
            placeholder="Post content"
          />
          <div className="edit-form-actions">
            <button className="btn-save-edit" onClick={handleSaveEdit}>
              Save Changes
            </button>
            <button className="btn-cancel-edit" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="post-detail-content">
          <p>{currentPost.content}</p>
        </div>
      )}

      <div className="post-tags">
        {(currentPost.tags || []).map((tag) => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
      </div>

      <div className="post-detail-actions">
        <button
          className={'action-btn upvote-btn ' + (currentPost.userHasUpvoted ? 'active' : '')}
          onClick={handleUpvote}
        >
          👍 Upvote ({currentPost.upvotes})
        </button>

        <button
          className={'action-btn downvote-btn ' + (currentPost.userHasDownvoted ? 'active' : '')}
          onClick={handleDownvote}
        >
          👎 Downvote ({currentPost.downvotes})
        </button>

        <button
          className={'action-btn follow-btn ' + (currentPost.userIsFollowing ? 'active' : '')}
          onClick={handleFollow}
        >
          🔔 Follow
        </button>

        {!isOwner && (
          <button className="action-btn report-btn" onClick={handleReportPost}>
            🚩 Report
          </button>
        )}

        {isOwner && !isEditing && (
          <React.Fragment>
            <button className="action-btn edit-btn" onClick={handleEditClick}>
              ✏️ Edit
            </button>
            <button className="action-btn delete-btn" onClick={handleDelete}>
              🗑️ Delete
            </button>
          </React.Fragment>
        )}
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