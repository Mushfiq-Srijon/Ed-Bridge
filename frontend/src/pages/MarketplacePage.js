import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MarketplaceSearch from "../components/Marketplace/MarketplaceSearch";
import MarketplaceFilters from "../components/Marketplace/MarketplaceFilters";
import ListingCard from "../components/Marketplace/ListingCard";

import mockListings from "../data/mockListing";

import "../styles/Marketplace.css";

export default function MarketplacePage() {
    const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    category: "All",
    condition: "All",
    area: "All",
    minPrice: "",
    maxPrice: "",
  });

  const [sortOption, setSortOption] = useState("newest");

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(mockListings.map((listing) => listing.category)),
    ];

    return ["All", ...uniqueCategories];
  }, []);

  const areas = useMemo(() => {
    const uniqueAreas = [
      ...new Set(mockListings.map((listing) => listing.area)),
    ];

    return ["All", ...uniqueAreas];
  }, []);

  const filteredListings = useMemo(() => {
    let results = mockListings.filter(
      (listing) => listing.status === "Active"
    );

    // Search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      results = results.filter((listing) => {
        return (
          listing.title.toLowerCase().includes(search) ||
          listing.description.toLowerCase().includes(search) ||
          listing.category.toLowerCase().includes(search) ||
          listing.area.toLowerCase().includes(search) ||
          listing.subjectTags.some((tag) =>
            tag.toLowerCase().includes(search)
          )
        );
      });
    }

    // Category
    if (filters.category !== "All") {
      results = results.filter(
        (listing) => listing.category === filters.category
      );
    }

    // Condition
    if (filters.condition !== "All") {
      results = results.filter(
        (listing) => listing.condition === filters.condition
      );
    }

    // Area
    if (filters.area !== "All") {
      results = results.filter(
        (listing) => listing.area === filters.area
      );
    }

    // Minimum price
    if (filters.minPrice !== "") {
      results = results.filter(
        (listing) =>
          listing.askingPrice >= Number(filters.minPrice)
      );
    }

    // Maximum price
    if (filters.maxPrice !== "") {
      results = results.filter(
        (listing) =>
          listing.askingPrice <= Number(filters.maxPrice)
      );
    }

    // Sorting
    if (sortOption === "price-low") {
      results.sort(
        (a, b) => a.askingPrice - b.askingPrice
      );
    }

    if (sortOption === "price-high") {
      results.sort(
        (a, b) => b.askingPrice - a.askingPrice
      );
    }

    if (sortOption === "rating") {
      results.sort(
        (a, b) =>
          b.seller.rating - a.seller.rating
      );
    }

    return results;
  }, [searchTerm, filters, sortOption]);

  const handleListingClick = (listing) => {
  navigate(`/marketplace/listing/${listing.id}`);
};

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

                <option value="rating">
                  Seller Rating
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
    </div>
  );
}