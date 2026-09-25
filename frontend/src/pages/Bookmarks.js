import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumAPI, listingsAPI, notesAPI } from '../services/api';
import Pagination from '../components/Pagination';
import '../styles/Bookmarks.css';

const tabs = [
  { id: 'all', label: 'All saved' },
  { id: 'notes', label: 'Notes' },
  { id: 'listings', label: 'Listings' },
  { id: 'forums', label: 'Forums' },
];

const PAGE_SIZE = 6;

const collectionMeta = {
  all: {
    label: 'All saved',
    eyebrow: 'Collection',
    icon: '✦',
    description: 'Everything you have saved in one place.',
  },
  notes: {
    label: 'Study notes',
    eyebrow: 'Notes',
    icon: '▤',
    description: 'Reference material for your next study session.',
  },
  listings: {
    label: 'Marketplace listings',
    eyebrow: 'Marketplace',
    icon: '◇',
    description: 'Items you are keeping an eye on.',
  },
  forums: {
    label: 'Forum discussions',
    eyebrow: 'Forum',
    icon: '☷',
    description: 'Conversations worth returning to.',
  },
};

export default function Bookmarks() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState({ notes: [], listings: [], forums: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const visibleSections = useMemo(() => {
    if (activeTab !== 'all') return [{ key: activeTab, items: saved[activeTab] }];
    return [
      { key: 'notes', items: saved.notes },
      { key: 'listings', items: saved.listings },
      { key: 'forums', items: saved.forums },
    ];
  }, [activeTab, saved]);

  const visibleItems = useMemo(
    () => visibleSections.flatMap((section) => section.items.map((item) => ({ ...item, savedType: section.key }))),
    [visibleSections]
  );
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
  const paginatedItems = visibleItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const removeSaved = async (type, id) => {
    try {
      const remove = type === 'notes' ? notesAPI.unsave : type === 'listings' ? listingsAPI.unsave : forumAPI.unsave;
      await remove(id);
      setSaved((current) => ({ ...current, [type]: current[type].filter((item) => item.id !== id) }));
      setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil((visibleItems.length - 1) / PAGE_SIZE))));
    } catch (err) {
      alert(err.message || 'Unable to remove saved item.');
    }
  };

  const openItem = (type, item) => {
    if (type === 'notes') navigate('/notes', { state: { openNoteId: item.id } });
    if (type === 'listings') navigate(`/marketplace/listing/${item.id}`);
    if (type === 'forums') navigate('/forum', { state: { openPostId: item.id } });
  };

  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || 'All saved';
  const visibleItemCount = visibleItems.length;

  if (loading) {
    return <div className="bookmarks-page"><div className="bookmarks-loading"><div className="loading-spinner" /><p>Loading your collection...</p></div></div>;
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-container">
        <header className="bookmarks-hero">
          <div className="bookmarks-hero-copy">
            <span className="bookmarks-label"><span className="bookmarks-label-mark">✦</span> YOUR COLLECTION</span>
            <h1>Your saved space</h1>
            <p>Keep useful notes, materials, and conversations close at hand.</p>
          </div>
          <div className="saved-total-card">
            <span className="saved-total-label">Saved across Ed-Bridge</span>
            <strong>{totalSaved}</strong>
            <span className="saved-total-caption">resources ready when you are</span>
          </div>
        </header>

        <div className="saved-stat-grid" aria-label="Saved item summary">
          {Object.entries(collectionMeta).map(([key, meta]) => (
            <button
              type="button"
              key={key}
              className={`saved-stat-card saved-stat-card-${key} ${activeTab === key ? 'active' : ''}`}
              onClick={() => handleTabChange(key)}
            >
              <span className={`saved-stat-icon saved-stat-icon-${key}`} aria-hidden="true">{meta.icon}</span>
              <span className="saved-stat-copy">
                <strong>{key === 'all' ? totalSaved : saved[key].length}</strong>
                <span>{meta.label}</span>
              </span>
              <span className="saved-stat-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>

        <div className="saved-toolbar">
          <div className="saved-toolbar-copy">
            <span className="saved-toolbar-label">BROWSE COLLECTION</span>
            <p>{activeTabLabel} <span>·</span> {visibleItemCount} {visibleItemCount === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        {error && <div className="bookmarks-error">{error}</div>}
        {!error && totalSaved === 0 && (
          <div className="empty-bookmarks">
            <div className="empty-icon" aria-hidden="true">✦</div>
            <h2>Your collection is empty</h2>
            <p>Save notes, listings, and forum discussions to find them here later.</p>
            <button className="browse-notes-button" onClick={() => navigate('/notes')}>Explore resources</button>
          </div>
        )}

        {!error && totalSaved > 0 && visibleItemCount === 0 && (
          <div className="empty-bookmarks filtered-empty">
            <div className="empty-icon" aria-hidden="true">◇</div>
            <h2>No {activeTabLabel.toLowerCase()} yet</h2>
            <p>When you save something from this area, it will appear here for quick access.</p>
            <button className="browse-notes-button" onClick={() => handleTabChange('all')}>View all saved items</button>
          </div>
        )}

        {!error && totalSaved > 0 && visibleItemCount > 0 && (
          <section className="saved-results-section" aria-label={`${activeTabLabel} results`}>
            <div className="saved-items-grid">
              {paginatedItems.map((item) => (
                <article className={`saved-item-card saved-item-card-${item.savedType}`} key={`${item.savedType}-${item.id}`}>
                  <div className={`saved-item-visual saved-${item.savedType}-visual`}>
                    {item.savedType === 'notes' && (item.thumbnailPath ? <img src={`http://localhost:5180/${item.thumbnailPath}`} alt="" /> : <span className="saved-visual-placeholder">▤</span>)}
                    {item.savedType === 'listings' && <img src={item.imageUrl || 'https://via.placeholder.com/640x420?text=No+Image'} alt="" />}
                    {item.savedType === 'forums' && <span className="saved-visual-placeholder">☷</span>}
                    <div className="saved-visual-topline">
                      <span>{collectionMeta[item.savedType].eyebrow}</span>
                      <span aria-hidden="true">{collectionMeta[item.savedType].icon}</span>
                    </div>
                    <span className="saved-ribbon">Saved</span>
                  </div>
                  <div className="saved-item-body">
                    <span className="saved-item-type">{collectionMeta[item.savedType].description}</span>
                    <h3>{item.title}</h3>
                    <p>{item.savedType === 'forums' ? item.content : item.savedType === 'listings' ? item.description : item.courseTitle || item.content}</p>
                    <div className="saved-item-meta">
                      {item.savedType === 'listings' && <span className="saved-item-highlight">৳{Number(item.askingPrice || 0).toLocaleString()}</span>}
                      {item.savedType === 'notes' && <span>◉ {item.viewCount || 0} views</span>}
                      {item.savedType === 'forums' && <span>▲ {item.upvoteCount || 0} upvotes</span>}
                      <span>{item.author?.name || item.seller?.name || 'EdBridge community'}</span>
                    </div>
                    <div className="saved-item-actions">
                      <button type="button" className="view-saved-button" onClick={() => openItem(item.savedType, item)}>Open item <span aria-hidden="true">↗</span></button>
                      <button type="button" className="remove-saved-button" onClick={() => removeSaved(item.savedType, item.id)} aria-label={`Remove ${item.title} from saved items`}>Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </section>
        )}
      </div>
    </div>
  );
}
