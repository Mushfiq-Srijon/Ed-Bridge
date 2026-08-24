import React from "react";
import "../../styles/ListingCard.css";

export default function ListingCard({ listing, onClick }) {
  return (
    <div className="listing-card" onClick={() => onClick(listing)}>
      <div className="listing-image-container">
        <img
          src={listing.image}
          alt={listing.title}
          className="listing-image"
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
          {listing.subjectTags.slice(0, 2).map((tag) => (
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
            <span className="seller-name">
              {listing.seller.name}

              {listing.seller.verified && (
                <span className="verified-badge">✓</span>
              )}
            </span>

            <span className="seller-rating">
              ⭐ {listing.seller.rating} ({listing.seller.reviews})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}