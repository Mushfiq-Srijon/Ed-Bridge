import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listingsAPI } from "../services/api";
import "../styles/ListingDetails.css";

export default function ListingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsAPI.getById(id)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="listing-loading">Loading listing...</div>;
  }

  if (!listing) {
    return (
      <div className="listing-not-found">
        <h2>Listing Not Found</h2>
        <p>
          The academic material you are looking for does not exist.
        </p>

        <button onClick={() => navigate("/marketplace")}>
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="listing-details-page">

      {/* Back button */}
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
              src={listing.imageUrl}
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
          </div>

          {/* Information */}
          <div className="listing-details-info">

            <span className="details-category">
              {listing.category}
            </span>

            <h1>{listing.title}</h1>

            <div className="details-price-section">
              <span className="details-asking-price">
                ৳{listing.askingPrice.toLocaleString()}
              </span>

              <span className="details-original-price">
                ৳{listing.originalPrice.toLocaleString()}
              </span>
            </div>

            <div className="details-location">
              📍 {listing.area}
            </div>

            {listing.educationLevel && (
              <div className="details-education">
                🎓 {listing.educationLevel}
              </div>
            )}

            {/* Tags */}
            <div className="details-tags">
              {listing.subjectTags.map((tag) => (
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

            {/* Contact button */}
            <button
              className="contact-seller-button"
              onClick={() =>
                alert(
                  `Messaging ${listing.seller?.name} about "${listing.title}"`
                )
              }
            >
              Contact Seller
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}