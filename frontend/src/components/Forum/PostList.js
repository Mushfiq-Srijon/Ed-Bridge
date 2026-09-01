import React, { useState } from 'react';
import PostCard from './PostCard';
import PostDetail from './PostDetail';
import { forumAPI } from '../../services/api';
import { transformPost } from '../../utils/forumAdapter';
import '../../styles/Forum.css';

export default function PostList({ posts }) {
  const [selectedPost, setSelectedPost] = useState(null);

  const [loadingPost, setLoadingPost] = useState(false);

  const handleSelectPost = async (post) => {
    try {
      setLoadingPost(true);

      const data = await forumAPI.getPost(post.id);

      const formattedPost = transformPost(data);

      setSelectedPost(formattedPost);

    } catch (error) {
      console.error('Failed to load post:', error);

      alert(error.message || 'Failed to load post');

    } finally {
      setLoadingPost(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
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