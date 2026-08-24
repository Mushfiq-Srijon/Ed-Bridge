import React from "react";
import "../../styles/MarketplaceSearch.css";

export default function MarketplaceSearch({
  searchTerm,
  setSearchTerm,
}) {
  return (
    <div className="marketplace-search">
      <span className="search-icon">⌕</span>

      <input
        type="text"
        placeholder="Search textbooks, lab equipment, instruments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {searchTerm && (
        <button
          className="clear-search"
          onClick={() => setSearchTerm("")}
        >
          ×
        </button>
      )}
    </div>
  );
}