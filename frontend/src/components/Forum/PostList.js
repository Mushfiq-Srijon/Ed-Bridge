import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import PostDetail from './PostDetail';
import { forumAPI } from '../../services/api';
import { transformPost } from '../../utils/forumAdapter';
import '../../styles/Forum.css';

export default function PostList({ posts, onPostDeleted, onDetailStateChange, initialPostId }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);

  const handleSelectPost = async (post) => {
    try {
      setLoadingPost(true);
      const data = await forumAPI.getPost(post.id);
      const formattedPost = transformPost(data);
      setSelectedPost(formattedPost);
      onDetailStateChange?.(true);
    } catch (error) {
      console.error('Failed to load post:', error);
      alert(error.message || 'Failed to load post');
    } finally {
      setLoadingPost(false);
    }
  };

  useEffect(() => {
    if (initialPostId) handleSelectPost({ id: initialPostId });
    // The initial dashboard link should open once when the forum mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPostId]);

  const handleCloseDetail = () => {
    setSelectedPost(null);
    onDetailStateChange?.(false);
    // Re-fetch after returning so a vote made in the detail view immediately
    // participates in the score-based discussion order.
    if (onPostDeleted) onPostDeleted();
  };

  const handlePostDeleted = () => {
    setSelectedPost(null);
    onDetailStateChange?.(false);
    if (onPostDeleted) onPostDeleted(); // Refresh parent's post list
  };

  if (loadingPost) {
    return (
      <div className="empty-state">
        <p>Loading post...</p>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        onBack={handleCloseDetail}
        onDeleted={handlePostDeleted}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p>😴 No posts found. Be the first to ask!</p>
      </div>
    );
  }

  return (
    <div className="posts-list">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onSelect={handleSelectPost}
        />
      ))}
    </div>
  );
}
