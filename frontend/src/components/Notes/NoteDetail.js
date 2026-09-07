import React, { useState, useEffect } from 'react';
import { notesAPI } from '../../services/api';
import { transformNote } from '../../utils/noteAdapter';
import { useAuth } from '../../context/AuthContext';
import '../../styles/NoteDetail.css';

export default function NoteDetail({ noteId, onBack }) {
  const { user } = useAuth();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCourseCode, setEditCourseCode] = useState('');

  useEffect(() => {
    loadNote();
  }, [noteId]);

  const loadNote = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await notesAPI.getById(noteId);
      const formatted = transformNote(data);

      setNote(formatted);
      setEditTitle(formatted.title);
      setEditContent(formatted.content);
      setEditCourseCode(formatted.courseCode);
    } catch (err) {
      console.error('Failed to load note:', err);
      setError(err.message || 'Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = Boolean(user) && Boolean(note) && note.authorId === user.id;

  const handleEditClick = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCourseCode(note.courseCode);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim() || !editCourseCode.trim()) {
      alert('Title, content, and course code cannot be empty');
      return;
    }

    try {
      await notesAPI.update(note.id, {
        title: editTitle,
        content: editContent,
        courseCode: editCourseCode,
      });

      setNote(function (prev) {
        var updated = Object.assign({}, prev);
        updated.title = editTitle;
        updated.content = editContent;
        updated.courseCode = editCourseCode;
        return updated;
      });

      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update note:', err);
      alert(err.message || 'Failed to update note');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this note? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await notesAPI.delete(note.id);
      onBack();
    } catch (err) {
      console.error('Failed to delete note:', err);
      alert(err.message || 'Failed to delete note');
    }
  };

  const handleDownload = async () => {
    try {
      await notesAPI.download(note.id);

      setNote(function (prev) {
        var updated = Object.assign({}, prev);
        updated.downloads = prev.downloads + 1;
        return updated;
      });

      alert('Download counted! (No file system yet, this just tracks interest.)');
    } catch (err) {
      console.error('Failed to count download:', err);
      alert(err.message || 'Failed to count download');
    }
  };

  if (loading) {
    return (
      <div className="note-detail-page">
        <button onClick={onBack}>← Back to Notes</button>
        <p>Loading note...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="note-detail-page">
        <button onClick={onBack}>← Back to Notes</button>
        <p>{error || 'Note not found.'}</p>
      </div>
    );
  }

  return (
    <div className="note-detail-page">
      <button onClick={onBack}>← Back to Notes</button>

      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Note title"
        />
      ) : (
        <h1>{note.title}</h1>
      )}

      <p>By {note.author && note.author.name ? note.author.name : 'Unknown'}</p>
      <p>{note.subject}</p>

      {isEditing ? (
        <input
          type="text"
          value={editCourseCode}
          onChange={(e) => setEditCourseCode(e.target.value)}
          placeholder="Course code"
        />
      ) : (
        <p>{note.courseCode}</p>
      )}

      <div>
        {(note.tags || []).map((tag) => (
          <span key={tag}>#{tag} </span>
        ))}
      </div>

      <p>
        👁️ {note.views} views | ⬇️ {note.downloads} downloads
      </p>

      <p>{note.createdAt}</p>

      <hr />

      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="10"
          />
          <button onClick={handleSaveEdit}>Save Changes</button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </div>
      ) : (
        <div>
          <p>{note.content}</p>
        </div>
      )}

      <hr />

      <div className="note-actions">
        <button onClick={handleDownload}>⬇️ Download</button>

        {isOwner && !isEditing && (
          <React.Fragment>
            <button onClick={handleEditClick}>✏️ Edit</button>
            <button onClick={handleDelete}>🗑️ Delete</button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}