import React from 'react';
import '../../styles/NoteCard.css';
export default function NoteCard({ note, onView }) {
  return (
    <div className="note-card">
      <h3>{note.title}</h3>

      <p>By {note.author}</p>

      <p>{note.subject}</p>

      <p>{note.courseCode}</p>

      <p>{note.content.substring(0, 120)}...</p>

      <div>
        {note.tags.map((tag) => (
          <span key={tag}>#{tag} </span>
        ))}
      </div>

      <p>
        👁️ {note.views} views | ⬇️ {note.downloads} downloads
      </p>

      <p>{note.createdAt}</p>

      <button onClick={onView}>
        View Full Note →
      </button>
    </div>
  );
}