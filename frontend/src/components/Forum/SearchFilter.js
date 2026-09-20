import React, { useState, useEffect } from 'react';
import { forumAPI } from '../../services/api';

// A sentinel keeps the custom filter distinct from real subject names.
export const OTHER_SUBJECT_FILTER = '__other_subject__';

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedSubject,
  customSubject,
  onSubjectChange,
}) {
  const [subjects, setSubjects] = useState([]);
  const [otherSubject, setOtherSubject] = useState(customSubject || '');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await forumAPI.getSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]);
    }
  };

  const isOtherSelected = selectedSubject === OTHER_SUBJECT_FILTER;

  const handleOtherChange = (event) => {
    const value = event.target.value;
    setOtherSubject(value);
    onSubjectChange(OTHER_SUBJECT_FILTER, value);
  };

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
              onClick={() => onSubjectChange(null, '')}
            >
              All Subjects
            </button>
            {Array.isArray(subjects) && subjects.length > 0 ? (
              subjects.map(subject => (
                <button
                  key={subject.id}
                  className={`filter-btn ${selectedSubject === subject.name ? 'active' : ''}`}
                  onClick={() => onSubjectChange(subject.name, '')}
                >
                  {subject.name}
                </button>
              ))
            ) : (
              <p className="filter-loading">Loading subjects...</p>
            )}
            <button
              type="button"
              className={`filter-btn filter-btn-other ${isOtherSelected ? 'active' : ''}`}
              onClick={() => onSubjectChange(OTHER_SUBJECT_FILTER, otherSubject)}
              aria-pressed={isOtherSelected}
            >
              Other
            </button>
          </div>
          {isOtherSelected && (
            <div className="other-filter-control">
              <input
                type="text"
                value={otherSubject}
                onChange={handleOtherChange}
                className="other-filter-input"
                placeholder="Type a subject to filter, e.g. Linear Algebra"
                aria-label="Custom subject filter"
                autoFocus
              />
              <span className="other-filter-hint">Matches subject names and tags as you type.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
