import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import MessagingModal from "../components/Marketplace/MessagingModal";
import "../styles/ListingDetails.css";

export default function ListingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  useEffect(() => {
    listingsAPI.getById(id)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = user && listing && listing.seller?.id === user.id;

  const handleEdit = () => {
    navigate(`/marketplace/listing/${id}/edit`);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this listing? This cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await listingsAPI.delete(id);
      alert('Listing deleted successfully');
      navigate('/marketplace');
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert(error.message || 'Failed to delete listing');
    }
  };

  const handleMarkSold = async () => {
    const confirmed = window.confirm('Mark this listing as sold?');

    if (!confirmed) return;

    try {
      await listingsAPI.updateStatus(id, 'Sold');
      setListing(prev => ({ ...prev, status: 'Sold' }));
      alert('Listing marked as sold');
    } catch (error) {
      console.error('Failed to mark as sold:', error);
      alert(error.message || 'Failed to mark as sold');
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      alert('Please login to contact the seller');
      navigate('/login');
      return;
    }
    setIsMessagingOpen(true);
  };

  const handleReportListing = async () => {
    const reason = prompt('Why are you reporting this listing?');
    if (!reason || reason.trim() === '') return;

    try {
      alert('Listing reported successfully. Admin will review it.');
    } catch (error) {
      console.error('Failed to report listing:', error);
      alert(error.message || 'Failed to report listing');
    }
  };

  if (loading) {
    return <div className="listing-loading">Loading listing...</div>;
  }

  if (!listing) {
    return (
      <div className="listing-not-found">
        <h2>Listing Not Found</h2>
        <p>The academic material you are looking for does not exist.</p>
        <button onClick={() => navigate("/marketplace")}>
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="listing-details-page">
      <div className="listing-details-container">
        <button
          className="back-to-marketplace"
          onClick={() => navigate("/marketplace")}
        >
          ← Back to Marketplace
        </button>

        <div className="listing-details-card">
          {/* Image */}
          <div className="listing-details-image-section">
            <img
              src={listing.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={listing.title}
              className="listing-details-image"
            />

            <span
              className={`details-condition-badge ${listing.condition
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {listing.condition}
            </span>

            {listing.status && listing.status !== 'Active' && (
              <span className={`status-badge ${listing.status.toLowerCase()}`}>
                {listing.status}
              </span>
            )}
          </div>

          {/* Information */}
          <div className="listing-details-info">
            <span className="details-category">{listing.category}</span>

            <h1>{listing.title}</h1>

            <div className="details-price-section">
              <span className="details-asking-price">
                ৳{listing.askingPrice.toLocaleString()}
              </span>
              <span className="details-original-price">
                ৳{listing.originalPrice.toLocaleString()}
              </span>
            </div>

            <div className="details-location">📍 {listing.area}</div>

            {listing.educationLevel && (
              <div className="details-education">🎓 {listing.educationLevel}</div>
            )}

            {/* Tags */}
            <div className="details-tags">
              {listing.subjectTags && listing.subjectTags.map((tag) => (
                <span key={tag} className="details-tag">
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="details-description">
              <h2>Description</h2>
              <p>{listing.description}</p>
            </div>

            {/* Seller */}
            <div className="seller-details-card">
              <div className="seller-details-avatar">
                {listing.seller?.name?.charAt(0)}
              </div>

              <div className="seller-details-info">
                <div className="seller-details-name">
                  {listing.seller?.name}
                </div>

                {listing.seller?.institution && (
                  <div className="seller-details-institution">
                    {listing.seller.institution}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="listing-details-actions">
              {isOwner ? (
                <>
                  {listing.status === 'Active' && (
                    <button
                      className="action-btn mark-sold-btn"
                      onClick={handleMarkSold}
                    >
                      ✓ Mark as Sold
                    </button>
                  )}

                  <button
                    className="action-btn edit-btn"
                    onClick={handleEdit}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="action-btn delete-btn"
                    onClick={handleDelete}
                  >
                    🗑️ Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="action-btn contact-btn"
                    onClick={handleContactSeller}
                  >
                    💬 Contact Seller
                  </button>

                  <button
                    className="action-btn report-btn"
                    onClick={handleReportListing}
                  >
                    🚩 Report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messaging Modal */}
      {isMessagingOpen && (
        <MessagingModal
          listing={listing}
          onClose={() => setIsMessagingOpen(false)}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}