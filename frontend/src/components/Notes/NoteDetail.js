import React, { useState, useEffect } from 'react';
import { notesAPI } from '../../services/api';
import { transformNote } from '../../utils/noteAdapter';
import { useAuth } from '../../context/AuthContext';
import '../../styles/NoteDetail.css';

const API_BASE = 'http://localhost:5180';

function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px', cursor: readOnly ? 'default' : 'pointer' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ fontSize: '24px', color: (hovered || value) >= star ? '#f5a623' : '#ccc' }}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onChange && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function NoteDetail({ noteId, onBack }) {
  const { user } = useAuth();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCourseCode, setEditCourseCode] = useState('');

  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

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
      if (data.userRating) setUserRating(data.userRating);
    } catch (err) {
      setError(err.message || 'Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = Boolean(user) && Boolean(note) && note.authorId === user.id;

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
      setNote((prev) => ({ ...prev, title: editTitle, content: editContent, courseCode: editCourseCode }));
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update note');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await notesAPI.delete(note.id);
      onBack();
    } catch (err) {
      alert(err.message || 'Failed to delete note');
    }
  };

  const handleDownload = async () => {
    try {
      const result = await notesAPI.download(note.id);
      if (result && !result.downloaded) {
        alert(result.message || 'No PDF available for this note.');
      }
      setNote((prev) => ({ ...prev, downloads: prev.downloads + 1 }));
    } catch (err) {
      alert(err.message || 'Failed to download');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await notesAPI.addComment(note.id, commentText);
      setNote((prev) => ({
        ...prev,
        comments: [res.comment, ...(prev.comments || [])],
      }));
      setCommentText('');
    } catch (err) {
      alert(err.message || 'Failed to add comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleRate = async (star) => {
    if (!user) { alert('Please login to rate'); return; }
    setRatingSubmitting(true);
    try {
      const res = await notesAPI.rate(note.id, star);
      setUserRating(star);
      setNote((prev) => ({
        ...prev,
        averageRating: res.averageRating,
        ratingCount: res.ratingCount,
      }));
    } catch (err) {
      alert(err.message || 'Failed to rate');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) { alert('Please enter a reason'); return; }
    setReportSubmitting(true);
    try {
      await notesAPI.report(note.id, reportReason);
      alert('Report submitted successfully');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) return <div className="note-detail-page"><button onClick={onBack}>← Back</button><p>Loading...</p></div>;
  if (error || !note) return <div className="note-detail-page"><button onClick={onBack}>← Back</button><p>{error || 'Note not found.'}</p></div>;

  return (
    <div className="note-detail-page">
      <button onClick={onBack}>← Back to Notes</button>

      {/* Thumbnail */}
      {note.thumbnailPath && (
        <img
          src={`${API_BASE}/${note.thumbnailPath}`}
          alt="Note thumbnail"
          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
        />
      )}

      {/* Title */}
      {isEditing ? (
        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Note title" />
      ) : (
        <h1>{note.title}</h1>
      )}

      <p>By {note.author?.name || 'Unknown'}</p>

      {/* Education info */}
      {note.educationLevel && (
        <p>
          📚 {note.educationLevel}
          {note.className && ` • Class ${note.className}`}
          {note.group && ` • ${note.group}`}
          {note.department && ` • ${note.department}`}
          {note.courseTitle && ` • ${note.courseTitle}`}
          {note.yearSemester && ` • ${note.yearSemester}`}
        </p>
      )}

      {/* Course code */}
      {isEditing ? (
        <input type="text" value={editCourseCode} onChange={(e) => setEditCourseCode(e.target.value)} placeholder="Course code" />
      ) : (
        <p>{note.courseCode}</p>
      )}

      {/* Tags */}
      <div>{(note.tags || []).map((tag) => <span key={tag}>#{tag} </span>)}</div>

      {/* Stats */}
      <p>👁️ {note.views} views | ⬇️ {note.downloads} downloads</p>

      {/* Rating display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
        <StarRating value={Math.round(note.averageRating || 0)} readOnly />
        <span>{note.averageRating ? `${note.averageRating} / 5` : 'No ratings yet'}
          {note.ratingCount > 0 && ` (${note.ratingCount} ratings)`}
        </span>
      </div>

      {/* User rating */}
      {user && !isOwner && (
        <div style={{ margin: '8px 0' }}>
          <p style={{ marginBottom: '4px' }}>Your rating:</p>
          <StarRating value={userRating} onChange={handleRate} readOnly={ratingSubmitting} />
        </div>
      )}

      <p>{note.createdAt}</p>
      <hr />

      {/* Content */}
      {isEditing ? (
        <div>
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows="10" />
          <button onClick={handleSaveEdit}>Save Changes</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div><p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p></div>
      )}

      <hr />

      {/* Actions */}
      <div className="note-actions">
        <button onClick={handleDownload}>
          {note.hasPdf ? '⬇️ Download PDF' : '⬇️ Download (No PDF)'}
        </button>

        {user && !isOwner && (
          <button onClick={() => setShowReportModal(true)}>🚩 Report</button>
        )}

        {isOwner && !isEditing && (
          <>
            <button onClick={() => setIsEditing(true)}>✏️ Edit</button>
            <button onClick={handleDelete}>🗑️ Delete</button>
          </>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h3>Report Note</h3>
            <p>Why are you reporting this note?</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows="4"
              style={{ width: '100%', marginBottom: '12px' }}
              placeholder="Enter reason..."
            />
            <button onClick={handleReport} disabled={reportSubmitting}>
              {reportSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button onClick={() => setShowReportModal(false)} style={{ marginLeft: '8px' }}>Cancel</button>
          </div>
        </div>
      )}

      <hr />

      {/* Comments */}
      <div>
        <h3>Comments</h3>

        {user && (
          <div style={{ marginBottom: '16px' }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows="3"
              placeholder="Write a comment..."
              style={{ width: '100%' }}
            />
            <button onClick={handleAddComment} disabled={commentSubmitting || !commentText.trim()}>
              {commentSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        )}

        {(note.comments || []).length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          (note.comments || []).map((c) => (
            <div key={c.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
              <strong>{c.authorName}</strong>
              <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
              <p style={{ margin: '4px 0' }}>{c.commentText}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}