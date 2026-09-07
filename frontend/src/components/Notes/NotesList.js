import React, { useState, useEffect } from 'react';
import NoteCard from './NoteCard';
import NoteSearch from './NoteSearch';
import { notesAPI } from '../../services/api';
import { transformNote } from '../../utils/noteAdapter';
import '../../styles/NotesList.css';

export default function NotesList({ onViewNote, onCreateNote }) {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotes();
    loadSubjects();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await notesAPI.getAll();
      const formattedNotes = data.map(transformNote);

      setNotes(formattedNotes);
      setFilteredNotes(formattedNotes);
    } catch (err) {
      console.error('Failed to load notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await notesAPI.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
    filterNotes(query, selectedSubject);
  };

  const handleSubjectFilter = (subject) => {
    setSelectedSubject(subject);
    filterNotes(searchTerm, subject);
  };

  const filterNotes = (query, subject) => {
    let filtered = [...notes];

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          (note.author?.name || '').toLowerCase().includes(lowerQuery) ||
          note.courseCode.toLowerCase().includes(lowerQuery)
      );
    }

    if (subject) {
      filtered = filtered.filter((note) => note.subject === subject);
    }

    setFilteredNotes(filtered);
  };

  if (loading) {
    return (
      <div className="notes-list-page">
        <p>Loading notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notes-list-page">
        <p>{error}</p>
        <button onClick={loadNotes}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="notes-list-page">
      <h1>📚 Study Notes Repository</h1>

      <button onClick={onCreateNote}>+ Create Note</button>

      <NoteSearch
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        subjects={subjects.map((s) => s.name)}
        selectedSubject={selectedSubject}
        onSubjectChange={handleSubjectFilter}
      />

      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          <p>No notes found.</p>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onView={() => onViewNote(note.id)} />
          ))
        )}
      </div>
    </div>
  );
}