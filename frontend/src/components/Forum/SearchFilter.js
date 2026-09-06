import React, { useState, useEffect } from 'react';
import { forumAPI } from '../../services/api';

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
}) {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await forumAPI.getSubjects();
      console.log('Subjects data:', data);
      console.log('Type:', typeof data, 'Is Array:', Array.isArray(data));
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]);
    }
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
              onClick={() => onSubjectChange(null)}
            >
              All Subjects
            </button>
            {Array.isArray(subjects) && subjects.length > 0 ? (
              subjects.map(subject => (
                <button
                  key={subject.id}
                  className={`filter-btn ${selectedSubject === subject.name ? 'active' : ''}`}
                  onClick={() => onSubjectChange(subject.name)}
                >
                  {subject.name}
                </button>
              ))
            ) : (
              <p style={{ color: '#999' }}>Loading subjects...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}