import React, { useState } from 'react';
import NotesList from '../components/Notes/NotesList';
import NoteDetail from '../components/Notes/NoteDetail';
import CreateNote from '../components/Notes/CreateNote';

export default function NotesPage() {
  const [view, setView] = useState('list');
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const handleCreateNote = () => {
    setView('create');
  };

  const handleViewNote = (noteId) => {
    setSelectedNoteId(noteId);
    setView('detail');
  };

  return (
    <div className="notes-page">
      {view === 'list' && (
        <NotesList
          onViewNote={handleViewNote}
          onCreateNote={handleCreateNote}
        />
      )}

      {view === 'detail' && (
        <NoteDetail
          noteId={selectedNoteId}
          onBack={() => {
            setView('list');
            setSelectedNoteId(null);
          }}
        />
      )}

      {view === 'create' && (
        <CreateNote
          onBack={() => {
            setView('list');
            setSelectedNoteId(null);
          }}
        />
      )}
    </div>
  );
}