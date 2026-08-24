import React, { useState } from 'react';
import NoteCard from './NoteCard';
import NoteSearch from './NoteSearch';
import '../../styles/NotesList.css';

const MOCK_NOTES = [
  {
    id: 1,
    title: "Physics 101 - Newton's Laws",
    author: 'Ahmed Khan',
    subject: 'Physics',
    courseCode: 'PHY101',
    content:
      "Complete notes on Newton's three laws of motion with real-world examples and applications in everyday life...",
    createdAt: '2024-08-20',
    tags: ['Physics', 'Mechanics', 'Science'],
    views: 156,
    downloads: 34,
  },
  {
    id: 2,
    title: 'Calculus - Derivatives & Chain Rule',
    author: 'Fatima Ahmed',
    subject: 'Mathematics',
    courseCode: 'MATH201',
    content:
      'Detailed calculus notes covering derivatives, chain rule, product rule, quotient rule and practical applications...',
    createdAt: '2024-08-19',
    tags: ['Mathematics', 'Calculus', 'Derivatives'],
    views: 243,
    downloads: 67,
  },
  {
    id: 3,
    title: 'Biology - Cell Structure & Functions',
    author: 'Rashid Hassan',
    subject: 'Biology',
    courseCode: 'BIO150',
    content:
      'Comprehensive guide to animal and plant cell structures, organelles, and their functions in cellular processes...',
    createdAt: '2024-08-18',
    tags: ['Biology', 'Cells', 'Science'],
    views: 189,
    downloads: 45,
  },
  {
    id: 4,
    title: 'English Literature - Shakespeare Analysis',
    author: 'Zara Khan',
    subject: 'English',
    courseCode: 'ENG301',
    content:
      "In-depth analysis of Shakespeare's major works including Hamlet, Romeo & Juliet, and A Midsummer Night's Dream...",
    createdAt: '2024-08-17',
    tags: ['English', 'Literature', 'Shakespeare'],
    views: 112,
    downloads: 28,
  },
];

export default function NotesList({ onViewNote, onCreateNote }) {
  const [notes] = useState(MOCK_NOTES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
  !selectedSubject || note.subject === selectedSubject;

const matchesTag =
  !selectedTag || note.tags.includes(selectedTag);

return matchesSearch && matchesSubject && matchesTag;
  });

  const subjects = [...new Set(notes.map((note) => note.subject))];
  const tags = [...new Set(notes.flatMap((note) => note.tags))];

  return (
    <div className="notes-list-page">
      <h1>📚 Study Notes Repository</h1>

      <button onClick={onCreateNote}>
  + Create Note
</button>

      <NoteSearch
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  subjects={subjects}
  selectedSubject={selectedSubject}
  onSubjectChange={setSelectedSubject}
  tags={tags}
  selectedTag={selectedTag}
  onTagChange={setSelectedTag}
/>

      <div className="notes-grid">
        {filteredNotes.map((note) => (
          <NoteCard
  key={note.id}
  note={note}
  onView={() => onViewNote(note.id)}
/>
        ))}
      </div>
    </div>
  );
}