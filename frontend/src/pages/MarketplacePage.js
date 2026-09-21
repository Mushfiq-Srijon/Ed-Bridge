import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import MarketplaceSearch from "../components/Marketplace/MarketplaceSearch";
import MarketplaceFilters from "../components/Marketplace/MarketplaceFilters";
import ListingCard from "../components/Marketplace/ListingCard";
import CreateListingModal from "../components/Marketplace/CreateListingModal";

import { listingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";

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
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalListings, setTotalListings] = useState(0);
  const [availableCategories, setAvailableCategories] = useState(["All"]);
  const [availableAreas, setAvailableAreas] = useState(["All"]);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadListings(currentPage), searchTerm ? 300 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [filters, searchTerm, sortOption, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, sortOption]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categories, areas] = await Promise.all([
          listingsAPI.getCategories(),
          listingsAPI.getAreas(),
        ]);
        setAvailableCategories(["All", ...(categories || [])]);
        setAvailableAreas(["All", ...(areas || [])]);
      } catch (optionError) {
        console.error("Failed to load marketplace filter options:", optionError);
      }
    };

    loadFilterOptions();
  }, []);

  const loadListings = async (page = 1) => {
    try {
      setLoading((previous) => previous && listings.length === 0);
      setRefreshing(true);
      const result = await listingsAPI.getAll(
        { ...filters, search: searchTerm, sort: sortOption },
        page,
        6
      );
      setListings(result.items || []);
      setTotalListings(result.total || 0);
      setError(null);
    } catch (err) {
      setError("Could not load listings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateListing = async (listingData) => {
    try {
      await listingsAPI.create(listingData);
      setIsCreateModalOpen(false);
      setCurrentPage(1);
      await loadListings(1);
      alert("Listing created successfully!");
    } catch (error) {
      console.error("Failed to create listing:", error);
      throw error;
    }
  };

  const categories = availableCategories;
  const areas = availableAreas;
  const filteredListings = useMemo(() => listings, [listings]);
  const totalPages = Math.max(1, Math.ceil(totalListings / 6));

  const handleListingClick = (listing) => {
    navigate(`/marketplace/listing/${listing.id}`);
  };

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
          <section className="marketplace-results" ref={resultsRef}>

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

            {loading && filteredListings.length === 0 ? (
              <div className="marketplace-loading-card">
                <div className="marketplace-spinner" aria-hidden="true" />
                <p>Finding the best materials...</p>
              </div>
            ) : filteredListings.length > 0 ? (

              <div className={`listing-results-shell ${refreshing ? 'is-refreshing' : ''}`}>
                {refreshing && (
                  <div className="listing-refresh-indicator" aria-live="polite">
                    <span className="marketplace-spinner small" aria-hidden="true" />
                    Updating listings
                  </div>
                )}
                <div className="listing-grid">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onClick={handleListingClick}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
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
