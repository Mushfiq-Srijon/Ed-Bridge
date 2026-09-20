import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notesAPI } from '../services/api';
import '../styles/Bookmarks.css';

export default function Bookmarks() {
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadSavedNotes();
  }, []);

  const loadSavedNotes = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await notesAPI.getSaved();
      setSavedNotes(data || []);
    } catch (err) {
      console.error('Failed to load saved notes:', err);
      setError(err.message || 'Failed to load saved notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (noteId) => {
    try {
      await notesAPI.unsave(noteId);

      setSavedNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== noteId)
      );
    } catch (err) {
      console.error('Failed to remove saved note:', err);
      alert(err.message || 'Failed to remove saved note.');
    }
  };

  const handleViewNote = (noteId) => {
    navigate('/notes', {
      state: {
        openNoteId: noteId,
      },
    });
  };

  if (loading) {
    return (
      <div className="bookmarks-page">
        <div className="bookmarks-loading">
          <div className="loading-spinner"></div>
          <p>Loading your saved notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-container">

        <div className="bookmarks-header">
          <div>
            <span className="bookmarks-label">YOUR COLLECTION</span>
            <h1>🔖 Saved Items</h1>
            <p>
              Notes you saved for later are collected here.
            </p>
          </div>

          <div className="saved-count">
            {savedNotes.length}
            <span>
              {savedNotes.length === 1
                ? ' Saved Note'
                : ' Saved Notes'}
            </span>
          </div>
        </div>

        {error && (
          <div className="bookmarks-error">
            {error}
          </div>
        )}

        {!error && savedNotes.length === 0 && (
          <div className="empty-bookmarks">
            <div className="empty-icon">🔖</div>

            <h2>No saved notes yet</h2>

            <p>
              When you save a note, it will appear here so you
              can easily find it later.
            </p>

            <button
              className="browse-notes-button"
              onClick={() => navigate('/notes')}
            >
              Browse Notes
            </button>
          </div>
        )}

        {!error && savedNotes.length > 0 && (
          <div className="saved-notes-grid">
            {savedNotes.map((note) => (
              <article
                className="saved-note-card"
                key={note.id}
              >
                <div className="saved-note-image">

                  {note.thumbnailPath ? (
                    <img
                      src={`http://localhost:5180/${note.thumbnailPath}`}
                      alt={note.title}
                    />
                  ) : (
                    <div className="saved-note-placeholder">
                      📚
                    </div>
                  )}

                  <span className="saved-badge">
                    🔖 Saved
                  </span>
                </div>

                <div className="saved-note-content">

                  <div className="saved-note-top">
                    <span className="education-badge">
                      {note.educationLevel || 'Education'}
                    </span>

                    {note.subject && (
                      <span className="subject-badge">
                        {note.subject}
                      </span>
                    )}
                  </div>

                  <h2>{note.title}</h2>

                  {note.courseTitle && (
                    <p className="saved-course">
                      {note.courseTitle}
                    </p>
                  )}

                  {note.courseCode && (
                    <p className="saved-course-code">
                      {note.courseCode}
                    </p>
                  )}

                  <div className="saved-note-author">
                    <span>👤</span>
                    <span>
                      {note.author?.name || 'Unknown author'}
                    </span>
                  </div>

                  <div className="saved-note-stats">
                    <span>👁️ {note.viewCount || 0}</span>
                    <span>⬇️ {note.downloadCount || 0}</span>
                  </div>

                  <div className="saved-note-actions">
                    <button
                      className="view-saved-button"
                      onClick={() => handleViewNote(note.id)}
                    >
                      View Note
                    </button>

                    <button
                      className="remove-saved-button"
                      onClick={() => handleUnsave(note.id)}
                    >
                      🔖 Remove
                    </button>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}