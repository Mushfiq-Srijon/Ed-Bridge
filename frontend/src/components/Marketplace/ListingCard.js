import React, { useState } from "react";
import { listingsAPI } from "../../services/api";
import "../../styles/ListingCard.css";

export default function ListingCard({ listing, onClick }) {
  const [isSaved, setIsSaved] = useState(Boolean(listing.isSaved));
  const [saving, setSaving] = useState(false);

  const handleSave = async (event) => {
    event.stopPropagation();
    if (saving) return;

    try {
      setSaving(true);
      if (isSaved) await listingsAPI.unsave(listing.id);
      else await listingsAPI.save(listing.id);
      setIsSaved((saved) => !saved);
    } catch (error) {
      alert(error.message || "Unable to update saved item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="listing-card" onClick={() => onClick(listing)}>
      <div className="listing-image-container">
       <img
  src={
    listing.imageUrl ||
    "https://via.placeholder.com/800x600?text=No+Image"
  }
  alt={listing.title}
  className="listing-image"
  onError={(event) => {
    event.currentTarget.src =
      "https://via.placeholder.com/800x600?text=Image+Unavailable";
  }}
/>

        <span className={`condition-badge ${listing.condition.toLowerCase().replace(" ", "-")}`}>
          {listing.condition}
        </span>
      </div>

      <div className="listing-card-content">
        <div className="listing-category">
          {listing.category}
        </div>

        <h3 className="listing-title">
          {listing.title}
        </h3>

        <div className="listing-price-section">
          <span className="asking-price">
            ৳{listing.askingPrice.toLocaleString()}
          </span>

          <span className="original-price">
            ৳{listing.originalPrice.toLocaleString()}
          </span>
        </div>

        <div className="listing-meta">
          <span>📍 {listing.area}</span>
        </div>

        <div className="listing-tags">
          {(listing.subjectTags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="subject-tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="seller-info">
          <div className="seller-avatar">
            {listing.seller.name.charAt(0)}
          </div>

          <div className="seller-details">
            <span className="seller-name">{listing.seller?.name}</span>
          </div>
        </div>

        <button className={`listing-save-button ${isSaved ? "is-saved" : ""}`} onClick={handleSave} disabled={saving}>
          {isSaved ? "🔖 Saved" : "🔖 Save listing"}
        </button>
      </div>
    </div>
  );
}
