import React, { useState } from 'react';
import PostCard from './PostCard';
import PostDetail from './PostDetail';
import '../../styles/Forum.css';

export default function PostList({ posts, onSelectPost }) {
  const [selectedPost, setSelectedPost] = useState(null);

  const handleSelectPost = (post) => {
    setSelectedPost(post);
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
  };

  if (selectedPost) {
    return <PostDetail post={selectedPost} onBack={handleCloseDetail} />;
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
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onSelect={handleSelectPost}
        />
      ))}
    </div>
  );
}