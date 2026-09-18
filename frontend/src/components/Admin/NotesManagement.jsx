import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';

export default function NotesManagement({ onRefresh, refreshTrigger }) {
    const [notes, setNotes] = useState([]);
    const [counts, setCounts] = useState({ All: 0, Reported: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');

    const loadCounts = async () => {
        try {
            const allNotes = await adminAPI.getNotes();
            const reported = allNotes.filter(n => n.reportsCount > 0);

            setCounts({
                All: allNotes.length,
                Reported: reported.length
            });
        } catch (err) {
            console.error('Failed to load counts:', err);
        }
    };

    const loadNotes = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await adminAPI.getNotes(search || null);
            setNotes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCounts();
        loadNotes();
    }, [search, refreshTrigger]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleRemoveNote = async (noteId) => {
        try {
            setActionLoading(true);
            await adminAPI.removeNote(noteId);
            setSelectedNote(null);
            loadCounts();
            loadNotes();
            onRefresh();
        } catch (err) {
            alert('Failed to remove note: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !selectedNote) {
        return <div className="loading-spinner">Loading notes...</div>;
    }

    const displayNotes = statusFilter === 'Reported'
        ? notes.filter(note => note.reportsCount > 0)
        : notes;

    return (
        <div className="notes-management">
            <h2>Notes Management</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search notes by title or course code..."
                    value={search}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            <div className="filter-tabs">
                <button className={`filter-btn ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => setStatusFilter('All')}>
                    All Notes ({counts.All})
                </button>
                <button className={`filter-btn ${statusFilter === 'Reported' ? 'active' : ''}`} onClick={() => setStatusFilter('Reported')}>
                    Reported ({counts.Reported})
                </button>
            </div>

            {selectedNote ? (
                <div className="note-detail">
                    <button className="back-btn" onClick={() => setSelectedNote(null)}>
                        Back
                    </button>

                    <div className="detail-card">
                        <h3>{selectedNote.title}</h3>
                        <p className="detail-meta">
                            <span>Course: {selectedNote.courseCode}</span>
                            <span>Subject: {selectedNote.subject}</span>
                        </p>

                        <div className="detail-section">
                            <h4>Author</h4>
                            <p>{selectedNote.authorName} ({selectedNote.authorEmail})</p>
                        </div>

                        <div className="detail-section">
                            <h4>Details</h4>
                            <p><strong>Education Level:</strong> {selectedNote.educationLevel}</p>
                            <p><strong>Department:</strong> {selectedNote.department}</p>
                            <p><strong>Class:</strong> {selectedNote.className}</p>
                            <p><strong>Reports:</strong> {selectedNote.reportsCount}</p>
                        </div>

                        <div className="detail-section">
                            <h4>Content</h4>
                            <p className="content-preview">{selectedNote.content?.substring(0, 500)}...</p>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn-remove"
                                onClick={() => handleRemoveNote(selectedNote.id)}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Processing...' : 'Remove Note'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="items-list">
                    {displayNotes.length === 0 ? (
                        <div className="empty-state">No notes found</div>
                    ) : (
                        displayNotes.map(note => (
                            <div key={note.id} className="item-card" onClick={() => setSelectedNote(note)}>
                                <div className="item-header">
                                    <h4>{note.title}</h4>
                                    {note.reportsCount > 0 && (
                                        <span className="report-badge">{note.reportsCount} reports</span>
                                    )}
                                </div>
                                <p className="item-meta">
                                    <span>{note.courseCode}</span>
                                    <span>{note.subject}</span>
                                </p>
                                <p className="item-author">By: {note.authorName}</p>
                                <p className="item-date">{new Date(note.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}