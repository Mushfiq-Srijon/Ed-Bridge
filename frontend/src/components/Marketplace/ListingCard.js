
import React, { useState } from "react";
import { listingsAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/ListingCard.css";

export default function ListingCard({ listing, onClick }) {
  const [isSaved, setIsSaved] = useState(Boolean(listing.isSaved));
  const [saving, setSaving] = useState(false);

  const { addToCart, isInCart } = useCart();
  const { token } = useAuth();

  const alreadyInCart = isInCart(listing.id);

  const handleAddToCart = (event) => {
    event.stopPropagation();

    if (!token) {
      alert("Please log in to add items to your cart.");
      return;
    }

    const result = addToCart(listing);
    alert(result.message);
  };

  const handleSave = async (event) => {
    event.stopPropagation();

    if (saving) return;

    try {
      setSaving(true);

      if (isSaved) {
        await listingsAPI.unsave(listing.id);
      } else {
        await listingsAPI.save(listing.id);
      }

      setIsSaved((saved) => !saved);
    } catch (error) {
      alert(error.message || "Unable to update saved item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="listing-card"
      onClick={() => onClick(listing)}
    >
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

        <span
          className={`condition-badge ${
            (listing.condition || "")
              .toLowerCase()
              .replace(" ", "-")
          }`}
        >
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
            ৳{Number(listing.askingPrice || 0).toLocaleString("en-BD")}
          </span>

          <span className="original-price">
            ৳{Number(listing.originalPrice || 0).toLocaleString("en-BD")}
          </span>
        </div>

        <div className="listing-meta">
          <span>📍 {listing.area}</span>
        </div>

        <div className="listing-tags">
          {(listing.subjectTags || [])
            .slice(0, 2)
            .map((tag, index) => (
              <span key={`${tag}-${index}`} className="subject-tag">
                {tag}
              </span>
            ))}
        </div>

        <div className="seller-info">
          <div className="seller-avatar">
            {(listing.seller?.name || "U").charAt(0)}
          </div>

          <div className="seller-details">
            <span className="seller-name">
              {listing.seller?.name || "Unknown seller"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="listing-add-cart-button"
          onClick={handleAddToCart}
          disabled={alreadyInCart}
        >
          {alreadyInCart ? "✓ Added to Cart" : "🛒 Add to Cart"}
        </button>

        <button
          type="button"
          className={`listing-save-button ${
            isSaved ? "is-saved" : ""
          }`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : isSaved
              ? "🔖 Saved"
              : "🔖 Save listing"}
        </button>
      </div>
    </div>
  );
}