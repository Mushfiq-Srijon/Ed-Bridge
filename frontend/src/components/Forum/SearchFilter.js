import React from 'react';
import { COMMON_SUBJECTS } from '../../data/forumMockData';

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
}) {
  return (
    <div className="forum-search-section">
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search questions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Subject</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${!selectedSubject ? 'active' : ''}`}
              onClick={() => onSubjectChange(null)}
            >
              All Subjects
            </button>
            {COMMON_SUBJECTS.map(subject => (
              <button
                key={subject}
                className={`filter-btn ${selectedSubject === subject ? 'active' : ''}`}
                onClick={() => onSubjectChange(subject)}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}