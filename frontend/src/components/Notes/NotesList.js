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
      const formatted = data.map(transformNote);
      setNotes(formatted);
      setFilteredNotes(formatted);
    } catch (err) {
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

  const filterNotes = (query, subject) => {
    let filtered = [...notes];
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.author?.name || '').toLowerCase().includes(q) ||
          n.courseCode.toLowerCase().includes(q)
      );
    }
    if (subject) {
      filtered = filtered.filter((n) => n.subject === subject);
    }
    setFilteredNotes(filtered);
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
    filterNotes(query, selectedSubject);
  };

  const handleSubjectFilter = (subject) => {
    setSelectedSubject(subject);
    filterNotes(searchTerm, subject);
  };

  if (loading) {
    return (
      <div className="notes-list-page">
        <div className="notes-loading">
          <p>Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notes-list-page">
        <div className="notes-empty">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={loadNotes}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-list-page">
      <div className="notes-list-header">
        <h1>📚 Study Notes</h1>
        <p>Find, explore and share academic notes with your peers.</p>
      </div>

      <div className="notes-list-top-bar">
        <NoteSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          subjects={subjects.map((s) => s.name)}
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectFilter}
        />
        <button className="btn-create-note" onClick={onCreateNote}>
          + Create Note
        </button>
      </div>

      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          <div className="notes-empty">
            <span>📭</span>
            <p>No notes found.</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onView={() => onViewNote(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}