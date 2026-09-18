import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';

export default function ForumsManagement({ onRefresh, refreshTrigger }) {
    const [posts, setPosts] = useState([]);
    const [counts, setCounts] = useState({ All: 0, Reported: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');

    const loadCounts = async () => {
        try {
            const allPosts = await adminAPI.getPosts();
            const reported = allPosts.filter(p => p.reportsCount > 0);

            setCounts({
                All: allPosts.length,
                Reported: reported.length
            });
        } catch (err) {
            console.error('Failed to load counts:', err);
        }
    };

    const loadPosts = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await adminAPI.getPosts(search || null);
            setPosts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCounts();
        loadPosts();
    }, [search, refreshTrigger]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleRemovePost = async (postId, suspendAuthor) => {
        try {
            setActionLoading(true);
            const action = suspendAuthor ? 'RemoveSuspend' : 'Remove';
            await adminAPI.removePost(postId, action);
            setSelectedPost(null);
            loadCounts();
            loadPosts();
            onRefresh();
        } catch (err) {
            alert('Failed to remove post: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !selectedPost) {
        return <div className="loading-spinner">Loading forum posts...</div>;
    }

    const displayPosts = statusFilter === 'Reported'
        ? posts.filter(post => post.reportsCount > 0)
        : posts;

    return (
        <div className="forums-management">
            <h2>Forums Management</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search posts by title or content..."
                    value={search}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            <div className="filter-tabs">
                <button className={`filter-btn ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => setStatusFilter('All')}>
                    All Posts ({counts.All})
                </button>
                <button className={`filter-btn ${statusFilter === 'Reported' ? 'active' : ''}`} onClick={() => setStatusFilter('Reported')}>
                    Reported ({counts.Reported})
                </button>
            </div>

            {selectedPost ? (
                <div className="post-detail">
                    <button className="back-btn" onClick={() => setSelectedPost(null)}>
                        Back
                    </button>

                    <div className="detail-card">
                        <h3>{selectedPost.title}</h3>
                        <p className="detail-meta">
                            {selectedPost.isAnonymous ? (
                                <span>Anonymous</span>
                            ) : (
                                <span>By: {selectedPost.authorName}</span>
                            )}
                            <span>{selectedPost.reportsCount} reports</span>
                        </p>

                        <div className="detail-section">
                            <h4>Author</h4>
                            <p>{selectedPost.isAnonymous ? 'Anonymous' : `${selectedPost.authorName} (${selectedPost.authorEmail})`}</p>
                        </div>

                        <div className="detail-section">
                            <h4>Content</h4>
                            <p className="content-preview">{selectedPost.content}</p>
                        </div>

                        <div className="detail-section">
                            <h4>Stats</h4>
                            <p><strong>Replies:</strong> {selectedPost.repliesCount}</p>
                            <p><strong>Reports:</strong> {selectedPost.reportsCount}</p>
                        </div>

                        {!selectedPost.isAnonymous && (
                            <div className="action-buttons">
                                <button
                                    className="btn-remove"
                                    onClick={() => handleRemovePost(selectedPost.id, false)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : 'Remove Post'}
                                </button>
                                <button
                                    className="btn-suspend"
                                    onClick={() => handleRemovePost(selectedPost.id, true)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : 'Remove & Suspend Author'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="items-list">
                    {displayPosts.length === 0 ? (
                        <div className="empty-state">No posts found</div>
                    ) : (
                        displayPosts.map(post => (
                            <div key={post.id} className="item-card" onClick={() => setSelectedPost(post)}>
                                <div className="item-header">
                                    <h4>{post.title}</h4>
                                    {post.reportsCount > 0 && (
                                        <span className="report-badge">{post.reportsCount} reports</span>
                                    )}
                                </div>
                                <p className="item-author">
                                    {post.isAnonymous ? 'Anonymous' : `By: ${post.authorName}`}
                                </p>
                                <p className="item-preview">{post.content?.substring(0, 100)}...</p>
                                <p className="item-stats">Replies: {post.repliesCount}</p>
                                <p className="item-date">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}