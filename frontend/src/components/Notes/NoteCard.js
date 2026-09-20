import React, { useState } from 'react';

import { notesAPI } from '../../services/api';

import '../../styles/NoteCard.css';

export default function NoteCard({ note, onView }) {
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);

      if (isSaved) {
        await notesAPI.unsave(note.id);
        setIsSaved(false);
      } else {
        await notesAPI.save(note.id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      alert(error.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="note-card">

      <h3>{note.title}</h3>

      <p>By {note.author?.name || 'Unknown'}</p>

      <p>{note.subject}</p>

      <p>{note.courseCode}</p>

      <p>
        {(note.content || '').substring(0, 120)}...
      </p>

      <div>
        {(note.tags || []).map((tag) => (
          <span key={tag}>#{tag} </span>
        ))}
      </div>

      <p>
        👁️ {note.views} views | ⬇️ {note.downloads} downloads
      </p>

      <p>{note.createdAt}</p>

      <div className="note-card-actions">

        <button onClick={onView}>
          View Full Note →
        </button>

        <button
          className={`save-note-card-button ${
            isSaved ? 'saved' : ''
          }`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? 'Saving...'
            : isSaved
              ? '🔖 Saved'
              : '🔖 Save Note'}
        </button>

      </div>

    </div>
  );
}