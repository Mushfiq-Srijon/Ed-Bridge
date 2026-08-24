import React from 'react';
import '../../styles/NoteDetail.css';
const MOCK_NOTE_DETAIL = {
  1: {
    id: 1,
    title: "Physics 101 - Newton's Laws",
    author: 'Ahmed Khan',
    subject: 'Physics',
    courseCode: 'PHY101',
    content: [
      "Newton's Laws of Motion",
      '',
      'First Law (Law of Inertia)',
      'An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.',
      '',
      'Examples:',
      '- A car suddenly braking causes passengers to move forward',
      '- A book on a table remains there until pushed',
      '',
      'Second Law (F = ma)',
      'The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.',
      '',
      'Formula: F = ma',
      '- F: Force (Newtons)',
      '- m: Mass (kg)',
      '- a: Acceleration (m/s²)',
      '',
      'Third Law (Action-Reaction)',
      'For every action, there is an equal and opposite reaction.',
    ],
    tags: ['Physics', 'Mechanics', 'Science'],
    views: 156,
    downloads: 34,
    createdAt: '2024-08-20',
  },
};

export default function NoteDetail({ noteId, onBack }) {
  const note = MOCK_NOTE_DETAIL[noteId];

  if (!note) {
    return (
      <div className="note-detail-page">
        <button onClick={onBack}>← Back to Notes</button>
        <p>Note not found.</p>
      </div>
    );
  }

  return (
    <div className="note-detail-page">
      <button onClick={onBack}>← Back to Notes</button>

      <h1>{note.title}</h1>

      <p>By {note.author}</p>
      <p>{note.subject}</p>
      <p>{note.courseCode}</p>

      <div>
        {note.tags.map((tag) => (
          <span key={tag}>#{tag} </span>
        ))}
      </div>

      <p>
        👁️ {note.views} views | ⬇️ {note.downloads} downloads
      </p>

      <p>{note.createdAt}</p>

      <hr />

      <div>
        {note.content.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
}