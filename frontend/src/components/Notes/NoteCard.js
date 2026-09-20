import React, { useState } from 'react';
import { notesAPI } from '../../services/api';
import '../../styles/NoteCard.css';

const API_BASE = 'http://localhost:5180';

export default function NoteCard({ note, onView }) {
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await notesAPI.unsave(note.id);
        setIsSaved(false);
      } else {
        await notesAPI.save(note.id);
        setIsSaved(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="note-card">
      {note.thumbnailPath ? (
        <img
          className="note-card-thumbnail"
          src={`${API_BASE}/${note.thumbnailPath}`}
          alt={note.title}
        />
      ) : (
        <div className="note-card-thumbnail-placeholder">📚</div>
      )}

      <div className="note-card-body">
        <div className="note-card-badges">
          {note.educationLevel && (
            <span className="note-edu-badge">{note.educationLevel}</span>
          )}
          {note.subject && (
            <span className="note-subject-badge">{note.subject}</span>
          )}
        </div>

        <h3 className="note-card-title">{note.title}</h3>
        <p className="note-card-author">By {note.author?.name || 'Unknown'}</p>
        <p className="note-card-course">{note.courseCode}</p>
        <p className="note-card-preview">{(note.content || '').substring(0, 100)}</p>

        {(note.tags || []).length > 0 && (
          <div className="note-card-tags">
            {note.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className="note-card-stats">
          <span>👁️ {note.views || 0} views</span>
          <span>⬇️ {note.downloads || 0} downloads</span>
          {note.averageRating > 0 && (
            <span>⭐ {Number(note.averageRating).toFixed(1)}</span>
          )}
        </div>

        <p className="note-card-date">{formatDate(note.createdAt)}</p>
      </div>

      <div className="note-card-actions">
        <button className="btn-view-note" onClick={onView}>
          View Note →
        </button>
        <button
          className={`btn-save-note ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '...' : isSaved ? '🔖 Saved' : '🔖 Save'}
        </button>
      </div>
    </div>
  );
}