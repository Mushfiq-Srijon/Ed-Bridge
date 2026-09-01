import React, { useState, useEffect } from 'react';
import PostList from '../components/Forum/PostList';
import CreatePostModal from '../components/Forum/CreatePostModal';
import SearchFilter from '../components/Forum/SearchFilter';
import { forumAPI } from '../services/api';
import { transformPost } from '../utils/forumAdapter';
import '../styles/Forum.css';

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await forumAPI.getPosts();

      const formattedPosts = data.map(transformPost);

      setPosts(formattedPosts);
      setFilteredPosts(formattedPosts);

    } catch (error) {
      console.error('Failed to load posts:', error);
      setError(error.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterPosts(query, selectedSubject);
  };

  const handleSubjectFilter = (subject) => {
    setSelectedSubject(subject);
    filterPosts(searchQuery, subject);
  };

  const filterPosts = (query, subject) => {
    let filtered = [...posts];

    if (query) {
      const lowerQuery = query.toLowerCase();

      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(lowerQuery) ||
          post.content.toLowerCase().includes(lowerQuery)
      );
    }

    if (subject) {
      filtered = filtered.filter(
        (post) =>
          post.subject === subject ||
          post.tags.includes(subject)
      );
    }

    setFilteredPosts(filtered);
  };

  const handleCreatePost = async (postData) => {
    try {
      const response = await forumAPI.createPost(postData);

      const newPost = transformPost(response.post);

      setPosts((prev) => [newPost, ...prev]);
      setFilteredPosts((prev) => [newPost, ...prev]);

      setIsCreateModalOpen(false);

    } catch (error) {
      console.error('Failed to create post:', error);
      alert(error.message || 'Failed to create post');
    }
  };

  if (loading) {
    return (
      <div className="forum-page">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p>Loading forum posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forum-page">
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>

          <button
            className="btn-create-post"
            onClick={loadPosts}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-page">

      {/* HERO */}
      <section className="forum-hero">
        <div className="hero-content">
          <div className="hero-icon">💬</div>

          <h1>Academic Forum</h1>

          <p>
            Ask questions, share insights, and learn together
            from the community.
          </p>

          <button
            className="hero-create-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span>＋</span>
            Ask a Question
          </button>
        </div>
      </section>

      {/* SEARCH & FILTER */}
      <section className="forum-search-wrapper">
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectFilter}
        />
      </section>

      {/* POSTS */}
      <main className="forum-content">
        <div className="posts-heading">
          <div>
            <h2>Recent Discussions</h2>
            <p>
              Explore questions and discussions from students
            </p>
          </div>

          <span className="post-count">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'Post' : 'Posts'}
          </span>
        </div>

        <PostList
          posts={filteredPosts}
          onSelectPost={() => {}}
        />
      </main>

      {/* CREATE POST MODAL */}
      {isCreateModalOpen && (
        <CreatePostModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreatePost}
        />
      )}

    </div>
  );
}