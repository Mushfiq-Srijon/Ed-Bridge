import React from 'react';
import '../../styles/NoteSearch.css';
export default function NoteSearch({
  searchTerm,
  onSearchChange,
  subjects,
  selectedSubject,
  onSubjectChange,
  tags,
  selectedTag,
  onTagChange,
}) {
  return (
    <div className="notes-search-section">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by title, author, or course code..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Subject</label>

        <div className="filter-buttons">
          <button onClick={() => onSubjectChange(null)}>
            All
          </button>

          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => onSubjectChange(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Tags</label>

        <div className="filter-buttons">
          <button onClick={() => onTagChange(null)}>
            All Tags
          </button>

          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}