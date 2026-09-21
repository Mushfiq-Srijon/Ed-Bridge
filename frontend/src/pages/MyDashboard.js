import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Pagination from '../components/Pagination';
import '../styles/MyDashboard.css';

const PAGE_SIZE = 6;

export default function MyDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ listings: [], notes: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pages, setPages] = useState({ listings: 1, notes: 1, posts: 1 });

  useEffect(() => {
    userAPI.getDashboard()
      .then(setData)
      .catch((requestError) => setError(requestError.message || 'Could not load your dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const renderSection = (key, title, icon, items, openItem) => {
    const currentPage = pages[key];
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const visibleItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
      <section className="dashboard-section" key={key}>
        <div className="dashboard-section-heading"><div><span>{icon}</span><h2>{title}</h2></div><strong>{items.length}</strong></div>
        {visibleItems.length === 0 ? <p className="dashboard-empty">Nothing here yet.</p> : (
          <div className="dashboard-records">
            {visibleItems.map((item) => (
              <button type="button" className="dashboard-record" key={item.id} onClick={() => openItem(item)}>
                <span><strong>{item.title}</strong><small>{item.courseCode || item.status || new Date(item.createdAt).toLocaleDateString()}</small></span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setPages((current) => ({ ...current, [key]: page }))} />
      </section>
    );
  };

  if (loading) return <main className="my-dashboard"><div className="dashboard-state">Loading your dashboard…</div></main>;
  if (error) return <main className="my-dashboard"><div className="dashboard-state dashboard-error">{error}</div></main>;

  return (
    <main className="my-dashboard">
      <header className="dashboard-hero"><span>YOUR ACTIVITY</span><h1>My Dashboard</h1><p>Every listing, note, and forum question you have shared in one place.</p></header>
      <div className="dashboard-sections">
        {renderSection('listings', 'My Listings', '📦', data.listings, (item) => navigate(`/marketplace/listing/${item.id}`))}
        {renderSection('notes', 'My Notes', '📚', data.notes, (item) => navigate('/notes', { state: { openNoteId: item.id } }))}
        {renderSection('posts', 'My Forum Questions', '💬', data.posts, (item) => navigate('/forum', { state: { openPostId: item.id } }))}
      </div>
    </main>
  );
}
