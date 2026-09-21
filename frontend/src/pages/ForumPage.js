import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PostList from '../components/Forum/PostList';
import CreatePostModal from '../components/Forum/CreatePostModal';
import SearchFilter, { OTHER_SUBJECT_FILTER } from '../components/Forum/SearchFilter';
import Pagination from '../components/Pagination';
import { forumAPI } from '../services/api';
import { transformPost } from '../utils/forumAdapter';
import '../styles/Forum.css';

export default function ForumPage() {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [customSubjectFilter, setCustomSubjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const pageSize = 6;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Forum discussions are ranked by community score, with newer discussions
  // winning ties. Keeping this rule in the UI also makes newly-created posts
  // and filtered results feel consistent before the next server refresh.
  const sortPosts = (items) => [...items].sort((a, b) => {
    const scoreDifference = (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    if (scoreDifference !== 0) return scoreDifference;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await forumAPI.getPosts(1, 100);

      const formattedPosts = sortPosts(data.map(transformPost));

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
    setCurrentPage(1);
    filterPosts(query, selectedSubject, customSubjectFilter);
  };

  const handleSubjectFilter = (subject, customSubject = '') => {
    setSelectedSubject(subject);
    setCustomSubjectFilter(customSubject);
    setCurrentPage(1);
    filterPosts(searchQuery, subject, customSubject);
  };

  const filterPosts = (query, subject, customSubject = '') => {
    let filtered = [...posts];

    if (query) {
      const lowerQuery = query.toLowerCase();

      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(lowerQuery) ||
          post.content.toLowerCase().includes(lowerQuery)
      );
    }

    if (subject === OTHER_SUBJECT_FILTER) {
      const lowerCustomSubject = customSubject.trim().toLowerCase();

      if (lowerCustomSubject) {
        filtered = filtered.filter((post) => {
          const subjectAndTags = [post.subject, ...(post.tags || [])].join(' ').toLowerCase();
          return subjectAndTags.includes(lowerCustomSubject);
        });
      }
    } else if (subject) {
      filtered = filtered.filter(
        (post) =>
          post.subject === subject ||
          post.tags.includes(subject)
      );
    }

    setFilteredPosts(sortPosts(filtered));
  };

  const handleCreatePost = async (postData) => {
    try {
      const response = await forumAPI.createPost(postData);

      const newPost = transformPost(response.post);

      const nextPosts = sortPosts([...posts, newPost]);
      setPosts(nextPosts);
      setFilteredPosts(sortPosts(nextPosts.filter(post => {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSearch = !lowerQuery || post.title.toLowerCase().includes(lowerQuery) || post.content.toLowerCase().includes(lowerQuery);
        const lowerCustomSubject = customSubjectFilter.trim().toLowerCase();
        const subjectAndTags = [post.subject, ...(post.tags || [])].join(' ').toLowerCase();
        const matchesSubject = selectedSubject === OTHER_SUBJECT_FILTER
          ? !lowerCustomSubject || subjectAndTags.includes(lowerCustomSubject)
          : !selectedSubject || post.subject === selectedSubject || post.tags.includes(selectedSubject);
        return matchesSearch && matchesSubject;
      })));

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
          customSubject={customSubjectFilter}
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
          posts={filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          onSelectPost={() => { }}
          onPostDeleted={loadPosts}
          onDetailStateChange={setIsPostDetailOpen}
          initialPostId={location.state?.openPostId}
        />
        {!isPostDetailOpen && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(filteredPosts.length / pageSize))}
            onPageChange={setCurrentPage}
          />
        )}
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
