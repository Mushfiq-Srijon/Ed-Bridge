import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumAPI, listingsAPI, notesAPI } from '../services/api';
import '../styles/Bookmarks.css';

const tabs = [
  { id: 'all', label: 'All saved' },
  { id: 'notes', label: 'Notes' },
  { id: 'listings', label: 'Listings' },
  { id: 'forums', label: 'Forums' },
];

export default function Bookmarks() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState({ notes: [], listings: [], forums: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSavedItems = async () => {
      try {
        setLoading(true);
        const [notes, listings, forums] = await Promise.all([
          notesAPI.getSaved(),
          listingsAPI.getSaved(),
          forumAPI.getSaved(),
        ]);
        setSaved({ notes: notes || [], listings: listings || [], forums: forums || [] });
      } catch (err) {
        setError(err.message || 'Failed to load your saved items.');
      } finally {
        setLoading(false);
      }
    };
    loadSavedItems();
  }, []);

  const totalSaved = saved.notes.length + saved.listings.length + saved.forums.length;
  const visibleSections = useMemo(() => {
    if (activeTab === 'notes') return [{ key: 'notes', label: 'Saved notes', items: saved.notes }];
    if (activeTab === 'listings') return [{ key: 'listings', label: 'Saved marketplace listings', items: saved.listings }];
    if (activeTab === 'forums') return [{ key: 'forums', label: 'Saved forum discussions', items: saved.forums }];
    return [
      { key: 'notes', label: 'Saved notes', items: saved.notes },
      { key: 'listings', label: 'Saved marketplace listings', items: saved.listings },
      { key: 'forums', label: 'Saved forum discussions', items: saved.forums },
    ];
  }, [activeTab, saved]);

  const removeSaved = async (type, id) => {
    try {
      const remove = type === 'notes' ? notesAPI.unsave : type === 'listings' ? listingsAPI.unsave : forumAPI.unsave;
      await remove(id);
      setSaved((current) => ({ ...current, [type]: current[type].filter((item) => item.id !== id) }));
    } catch (err) {
      alert(err.message || 'Unable to remove saved item.');
    }
  };

  const openItem = (type, item) => {
    if (type === 'notes') navigate('/notes', { state: { openNoteId: item.id } });
    if (type === 'listings') navigate(`/marketplace/listing/${item.id}`);
    if (type === 'forums') navigate('/forum', { state: { openPostId: item.id } });
  };

  if (loading) {
    return <div className="bookmarks-page"><div className="bookmarks-loading"><div className="loading-spinner" /><p>Loading your collection...</p></div></div>;
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-container">
        <div className="bookmarks-header">
          <div>
            <span className="bookmarks-label">YOUR COLLECTION</span>
            <h1>🔖 Saved items</h1>
            <p>Keep useful notes, materials, and conversations close at hand.</p>
          </div>
          <div className="saved-count"><strong>{totalSaved}</strong><span> items saved</span></div>
        </div>

        <nav className="saved-tabs" aria-label="Saved item types">
          {tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
        </nav>

        {error && <div className="bookmarks-error">{error}</div>}
        {!error && totalSaved === 0 && (
          <div className="empty-bookmarks">
            <div className="empty-icon">🔖</div>
            <h2>Your collection is empty</h2>
            <p>Save notes, listings, and forum discussions to find them here later.</p>
            <button className="browse-notes-button" onClick={() => navigate('/notes')}>Explore resources</button>
          </div>
        )}

        {!error && totalSaved > 0 && visibleSections.map((section) => section.items.length > 0 && (
          <section className="saved-section" key={section.key}>
            <div className="saved-section-heading"><h2>{section.label}</h2><span>{section.items.length}</span></div>
            <div className={`saved-items-grid saved-${section.key}-grid`}>
              {section.items.map((item) => (
                <article className="saved-item-card" key={item.id}>
                  {section.key === 'notes' && <div className="saved-item-visual saved-note-visual">{item.thumbnailPath ? <img src={`http://localhost:5180/${item.thumbnailPath}`} alt="" /> : <span>📚</span>}</div>}
                  {section.key === 'listings' && <div className="saved-item-visual saved-listing-visual"><img src={item.imageUrl || 'https://via.placeholder.com/640x420?text=No+Image'} alt="" /></div>}
                  {section.key === 'forums' && <div className="saved-item-visual saved-forum-visual">💬</div>}
                  <div className="saved-item-body">
                    <span className="saved-item-type">{section.key === 'notes' ? 'NOTE' : section.key === 'listings' ? 'MARKETPLACE' : 'FORUM'}</span>
                    <h3>{item.title}</h3>
                    <p>{section.key === 'forums' ? item.content : section.key === 'listings' ? item.description : item.courseTitle || item.content}</p>
                    <div className="saved-item-meta">
                      {section.key === 'listings' && <span>৳{Number(item.askingPrice || 0).toLocaleString()}</span>}
                      {section.key === 'notes' && <span>👁️ {item.viewCount || 0}</span>}
                      {section.key === 'forums' && <span>▲ {item.upvoteCount || 0}</span>}
                      <span>{item.author?.name || item.seller?.name || 'EdBridge community'}</span>
                    </div>
                    <div className="saved-item-actions"><button className="view-saved-button" onClick={() => openItem(section.key, item)}>Open</button><button className="remove-saved-button" onClick={() => removeSaved(section.key, item.id)}>Remove</button></div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
