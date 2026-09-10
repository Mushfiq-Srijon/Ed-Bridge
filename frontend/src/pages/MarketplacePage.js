import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import MarketplaceSearch from "../components/Marketplace/MarketplaceSearch";
import MarketplaceFilters from "../components/Marketplace/MarketplaceFilters";
import ListingCard from "../components/Marketplace/ListingCard";
import CreateListingModal from "../components/Marketplace/CreateListingModal";

import { listingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

import "../styles/Marketplace.css";

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: "All",
    condition: "All",
    area: "All",
    minPrice: "",
    maxPrice: "",
  });

  const [sortOption, setSortOption] = useState("newest");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadListings();
  }, [filters, searchTerm, sortOption]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const result = await listingsAPI.getAll(
        { ...filters, search: searchTerm, sort: sortOption },
        1,
        50
      );
      setListings(result.items);
      setError(null);
    } catch (err) {
      setError("Could not load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (listingData) => {
    try {
      await listingsAPI.create(listingData);
      setIsCreateModalOpen(false);
      await loadListings();
      alert("Listing created successfully!");
    } catch (error) {
      console.error("Failed to create listing:", error);
      alert(error.message || "Failed to create listing");
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(listings.map((listing) => listing.category)),
    ];

    return ["All", ...uniqueCategories];
  }, [listings]);

  const areas = useMemo(() => {
    const uniqueAreas = [
      ...new Set(listings.map((listing) => listing.area)),
    ];

    return ["All", ...uniqueAreas];
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings;
  }, [listings]);

  const handleListingClick = (listing) => {
    navigate(`/marketplace/listing/${listing.id}`);
  };

  if (loading) {
    return <div className="marketplace-loading">Loading listings...</div>;
  }

  if (error) {
    return <div className="marketplace-error">{error}</div>;
  }

  return (
    <div className="marketplace-page">

      {/* Hero Section */}
      <section className="marketplace-hero">
        <div className="marketplace-hero-content">
          <span className="marketplace-label">
            ED-BRIDGE MARKETPLACE
          </span>

          <h1>
            Find What You Need.
            <br />
            Share What You Have.
          </h1>

          <p>
            Buy and sell academic materials with students
            in your community.
          </p>

          <MarketplaceSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {user && (
            <button
              className="hero-create-btn"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <span>＋</span>
              Post a Listing
            </button>
          )}
        </div>
      </section>

      {/* Main Marketplace */}
      <main className="marketplace-container">

        {/* Category Navigation */}
        <div className="category-navigation">
          {categories.map((category) => (
            <button
              key={category}
              className={
                filters.category === category
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() =>
                setFilters((previous) => ({
                  ...previous,
                  category,
                }))
              }
            >
              {category}
            </button>
          ))}
        </div>

        <div className="marketplace-layout">

          {/* Filters */}
          <MarketplaceFilters
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            areas={areas}
          />

          {/* Listings */}
          <section className="marketplace-results">

            <div className="results-header">

              <div>
                <h2>Academic Materials</h2>

                <p>
                  {filteredListings.length}{" "}
                  {filteredListings.length === 1
                    ? "listing"
                    : "listings"}{" "}
                  found
                </p>
              </div>

              <select
                className="sort-select"
                value={sortOption}
                onChange={(e) =>
                  setSortOption(e.target.value)
                }
              >
                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>

            </div>

            {filteredListings.length > 0 ? (

              <div className="listing-grid">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={handleListingClick}
                  />
                ))}
              </div>

            ) : (

              <div className="no-results">
                <div className="no-results-icon">
                  🔍
                </div>

                <h3>No listings found</h3>

                <p>
                  Try changing your search or filters.
                </p>

                <button
                  onClick={() => {
                    setSearchTerm("");

                    setFilters({
                      category: "All",
                      condition: "All",
                      area: "All",
                      minPrice: "",
                      maxPrice: "",
                    });
                  }}
                >
                  Clear Filters
                </button>
              </div>

            )}

          </section>

        </div>
      </main>

      {/* Create Listing Modal */}
      {isCreateModalOpen && (
        <CreateListingModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateListing}
        />
      )}

    </div>
  );
}