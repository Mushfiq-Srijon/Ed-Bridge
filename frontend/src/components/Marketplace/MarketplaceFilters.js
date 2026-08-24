import React from "react";
import "../../styles/MarketplaceFilters.css";

export default function MarketplaceFilters({
  filters,
  setFilters,
  categories,
  areas,
}) {
  const updateFilter = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "All",
      condition: "All",
      area: "All",
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <aside className="marketplace-filters">
      <div className="filters-header">
        <h3>Filters</h3>

        <button onClick={clearFilters}>
          Clear All
        </button>
      </div>

      <div className="filter-group">
        <label>Category</label>

        <select
          value={filters.category}
          onChange={(e) =>
            updateFilter("category", e.target.value)
          }
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Condition</label>

        <select
          value={filters.condition}
          onChange={(e) =>
            updateFilter("condition", e.target.value)
          }
        >
          <option value="All">All Conditions</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Area</label>

        <select
          value={filters.area}
          onChange={(e) =>
            updateFilter("area", e.target.value)
          }
        >
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Price Range</label>

        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) =>
              updateFilter("minPrice", e.target.value)
            }
          />

          <span>—</span>

          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) =>
              updateFilter("maxPrice", e.target.value)
            }
          />
        </div>
      </div>
    </aside>
  );
}