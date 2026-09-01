import React, { useState } from 'react';
import PostList from '../components/Forum/PostList';
import CreatePostModal from '../components/Forum/CreatePostModal';
import SearchFilter from '../components/Forum/SearchFilter';
import { MOCK_POSTS } from '../data/forumMockData';
import '../styles/Forum.css';

export default function ForumPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [filteredPosts, setFilteredPosts] = useState(MOCK_POSTS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterPosts(query, selectedSubject);
  };

  const handleSubjectFilter = (subject) => {
    setSelectedSubject(subject);
    filterPosts(searchQuery, subject);
  };

  const filterPosts = (query, subject) => {
    let filtered = posts;

    if (query) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (subject) {
      filtered = filtered.filter(post => post.subject === subject);
    }

    setFilteredPosts(filtered);
  };

  const handleCreatePost = (newPost) => {
    const post = {
      id: posts.length + 1,
      ...newPost,
      views: 0,
      upvotes: 0,
      downvotes: 0,
      createdAt: 'just now',
      userHasUpvoted: false,
      userHasDownvoted: false,
      userIsFollowing: false,
      followers: 0,
      replies: []
    };
    setPosts([post, ...posts]);
    setFilteredPosts([post, ...filteredPosts]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="forum-page">
      <div className="forum-header">
        <div className="forum-title-section">
          <h1>💬 Academic Forum</h1>
          <p>Ask questions, share insights, and learn together from the community</p>
        </div>
        <button 
          className="btn-create-post"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Ask Question
        </button>
      </div>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectFilter}
      />

      <PostList 
        posts={filteredPosts}
        onSelectPost={setSelectedPost}
      />

      {isCreateModalOpen && (
        <CreatePostModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreatePost}
        />
      )}
    </div>
  );
}