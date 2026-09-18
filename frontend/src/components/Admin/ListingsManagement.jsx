import React, { useState, useEffect } from 'react';
import { BeatLoader } from 'react-spinners';
import { adminAPI } from '../../services/adminAPI';

export default function ListingsManagement({ onRefresh, refreshTrigger }) {
  const [listings, setListings] = useState([]);
  const [listingCounts, setListingCounts] = useState({ All: 0, Active: 0, Sold: 0, Removed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadListings();
  }, [statusFilter, search, refreshTrigger]);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError('');
      const allListings = await adminAPI.getListings(null, null);
      setListingCounts({
        All: allListings.length,
        Active: allListings.filter(listing => listing.status === 'Active').length,
        Sold: allListings.filter(listing => listing.status === 'Sold').length,
        Removed: allListings.filter(listing => listing.status === 'Removed').length,
      });
      const data = await adminAPI.getListings(search || null, statusFilter);
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleRemove = async (listingId) => {
    try {
      setActionLoading(true);
      await adminAPI.removeListing(listingId);
      setSelectedListing(null);
      loadListings();
      onRefresh();
    } catch (err) {
      alert('Failed to remove listing: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !selectedListing) {
    return (
      <div className="loading-spinner">
        <BeatLoader color="#3b82f6" size={12} />
      </div>
    );
  }

  return (
    <div className="listings-management">
      <h2>Listings Management</h2>

      {error && <div className="error-message">{error}</div>}

      {/* SEARCH & FILTER */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={handleSearch}
          onKeyUp={() => loadListings()}
          className="search-input"
        />
        <div className="filter-tabs">
          <button
            className={`filter-btn ${!statusFilter ? 'active' : ''}`}
            onClick={() => setStatusFilter(null)}
          >
            All ({listingCounts.All})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'Active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Active')}
          >
            Active ({listingCounts.Active})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'Sold' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Sold')}
          >
            Sold ({listingCounts.Sold})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'Removed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Removed')}
          >
            Removed ({listingCounts.Removed})
          </button>
        </div>
      </div>

      {/* LISTING DETAIL OR LIST */}
      {selectedListing ? (
        <div className="listing-detail">
          <button className="back-btn" onClick={() => setSelectedListing(null)}>
            ← Back
          </button>

          <div className="detail-card">
            <h3>{selectedListing.title}</h3>
            <p className="detail-meta">
              <span>Status: {selectedListing.status}</span>
              <span>Category: {selectedListing.category}</span>
            </p>

            {selectedListing.imageUrl && (
              <img src={selectedListing.imageUrl} alt={selectedListing.title} className="listing-image" />
            )}

            <div className="detail-section">
              <h4>Description</h4>
              <p>{selectedListing.description}</p>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Price</span>
                <span>৳{selectedListing.price}</span>
              </div>
              <div className="detail-item">
                <span className="label">Condition</span>
                <span>{selectedListing.condition}</span>
              </div>
              <div className="detail-item">
                <span className="label">Area</span>
                <span>{selectedListing.area}</span>
              </div>
              <div className="detail-item">
                <span className="label">Education Level</span>
                <span>{selectedListing.educationLevel || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Seller</h4>
              <p>{selectedListing.sellerName}</p>
              <p className="seller-email">{selectedListing.sellerEmail}</p>
            </div>

            <div className="detail-section">
              <h4>Posted</h4>
              <p>{new Date(selectedListing.createdAt).toLocaleDateString()}</p>
            </div>

            {selectedListing.status === 'Active' && (
              <div className="action-buttons">
                <button
                  className="btn-remove"
                  onClick={() => handleRemove(selectedListing.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Remove Listing'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="listings-list">
          {listings.length === 0 ? (
            <div className="empty-state">No listings found</div>
          ) : (
            listings.map(listing => (
              <div key={listing.id} className="listing-item" onClick={() => setSelectedListing(listing)}>
                <div className="listing-header">
                  <h4>{listing.title}</h4>
                  <span className={`status-badge status-${listing.status.toLowerCase()}`}>
                    {listing.status}
                  </span>
                </div>
                <p className="listing-price">৳{listing.price}</p>
                <p className="listing-category">{listing.category} | {listing.condition}</p>
                <p className="listing-seller">By: {listing.sellerName}</p>
                <p className="listing-reports">Reports: {listing.reportsCount}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}