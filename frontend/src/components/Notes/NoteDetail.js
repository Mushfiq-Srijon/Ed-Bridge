import React, { useState, useEffect } from 'react';
import { notesAPI } from '../../services/api';
import { transformNote } from '../../utils/noteAdapter';
import { useAuth } from '../../context/AuthContext';
import '../../styles/NoteDetail.css';
const viewedNotes = new Set();
const API_BASE = 'http://localhost:5180';

function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={(hovered || value) >= star ? 'active' : ''}
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

  const [isSaved, setIsSaved] = useState(false);
  const [saveSubmitting, setSaveSubmitting] = useState(false);

  const [downloadSubmitting, setDownloadSubmitting] = useState(false);

  useEffect(() => {
    loadNote();
  }, [noteId]);

  const loadNote = async () => {
  try {
    setLoading(true);
    setError('');

    // Check if already viewed in this session
    const alreadyViewed = viewedNotes.has(noteId);
const data = await notesAPI.getById(noteId, !alreadyViewed);
    const formatted = transformNote(data);

    setNote(formatted);
    setEditTitle(formatted.title);
    setEditContent(formatted.content);
    setEditCourseCode(formatted.courseCode);

    if (data.userRating) setUserRating(data.userRating);

    // Mark as viewed in this session
    if (!alreadyViewed) {
  viewedNotes.add(noteId);
}
  } catch (err) {
    console.error('Failed to load note:', err);
    setError(err.message || 'Failed to load note');
  } finally {
    setLoading(false);
  }
};

  const isOwner =
    Boolean(user) &&
    Boolean(note) &&
    Number(note.authorId) === Number(user.id);

  const handleSaveNote = async () => {
    if (saveSubmitting) return;

    try {
      setSaveSubmitting(true);

      if (isSaved) {
        await notesAPI.unsave(note.id);
        setIsSaved(false);
      } else {
        await notesAPI.save(note.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      alert(err.message || 'Failed to update saved note.');
    } finally {
      setSaveSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (downloadSubmitting) return;

    try {
      setDownloadSubmitting(true);

      const result = await notesAPI.download(note.id);

      if (result?.downloaded) {
        setNote((prev) => ({
          ...prev,
          downloads: (prev.downloads || 0) + 1,
        }));

        return;
      }

      alert(result?.message || 'No PDF available for this note.');
    } catch (err) {
      console.error('Failed to download note:', err);
      alert(err.message || 'Failed to download note.');
    } finally {
      setDownloadSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (
      !editTitle.trim() ||
      !editContent.trim() ||
      !editCourseCode.trim()
    ) {
      alert('Title, content, and course code cannot be empty.');
      return;
    }

    try {
      await notesAPI.update(note.id, {
        title: editTitle,
        content: editContent,
        courseCode: editCourseCode,
      });

      setNote((prev) => ({
        ...prev,
        title: editTitle,
        content: editContent,
        courseCode: editCourseCode,
      }));

      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update note.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await notesAPI.delete(note.id);
      onBack();
    } catch (err) {
      alert(err.message || 'Failed to delete note.');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    setCommentSubmitting(true);

    try {
      const res = await notesAPI.addComment(
        note.id,
        commentText.trim()
      );

      setNote((prev) => ({
        ...prev,
        comments: [res.comment, ...(prev.comments || [])],
      }));

      setCommentText('');
    } catch (err) {
      alert(err.message || 'Failed to add comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleRate = async (star) => {
    if (!user) {
      alert('Please login to rate this note.');
      return;
    }

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
      alert(err.message || 'Failed to rate note.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert('Please enter a reason.');
      return;
    }

    setReportSubmitting(true);

    try {
      await notesAPI.report(
        note.id,
        reportReason.trim()
      );

      alert('Report submitted successfully.');

      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      alert(err.message || 'Failed to submit report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="note-detail-page">
        <div className="note-detail-loading">
          <div className="note-loading-spinner"></div>
          <p>Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="note-detail-page">
        <div className="note-detail-error">
          <h2>Unable to load note</h2>
          <p>{error || 'Note not found.'}</p>
          <button onClick={onBack}>← Back to Notes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-detail-page">
      <div className="note-detail-container">

        {/* Back button */}
        <button
          className="note-back-button"
          onClick={onBack}
        >
          ← Back to Notes
        </button>

        {/* Main header */}
        <section className="note-header-card">

          <div className="note-header-content">

            <div className="note-badges">
              {note.educationLevel && (
                <span className="note-education-badge">
                  📚 {note.educationLevel}
                </span>
              )}

              {note.subject && (
                <span className="note-subject-badge">
                  {note.subject}
                </span>
              )}
            </div>

            {isEditing ? (
              <input
                className="note-edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Note title"
              />
            ) : (
              <h1>{note.title}</h1>
            )}

            <div className="note-author">
              <span className="author-icon">👤</span>
              <span>
                By <strong>{note.author?.name || 'Unknown'}</strong>
              </span>
            </div>

            <div className="note-meta-grid">

              {note.courseCode && (
                <div className="note-meta-item">
                  <span className="meta-label">Course Code</span>
                  <strong>{note.courseCode}</strong>
                </div>
              )}

              {note.courseTitle && (
                <div className="note-meta-item">
                  <span className="meta-label">Course</span>
                  <strong>{note.courseTitle}</strong>
                </div>
              )}

              {note.department && (
                <div className="note-meta-item">
                  <span className="meta-label">Department</span>
                  <strong>{note.department}</strong>
                </div>
              )}

              {note.className && (
                <div className="note-meta-item">
                  <span className="meta-label">Class</span>
                  <strong>{note.className}</strong>
                </div>
              )}

              {note.group && (
                <div className="note-meta-item">
                  <span className="meta-label">Group</span>
                  <strong>{note.group}</strong>
                </div>
              )}

              {note.yearSemester && (
                <div className="note-meta-item">
                  <span className="meta-label">Year / Semester</span>
                  <strong>{note.yearSemester}</strong>
                </div>
              )}

            </div>

            {/* Tags */}
            {(note.tags || []).length > 0 && (
              <div className="note-tags">
                {note.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            )}

          </div>

          {/* Thumbnail */}
          <div className="note-thumbnail-section">
            {note.thumbnailPath ? (
              <img
                src={`${API_BASE}/${note.thumbnailPath}`}
                alt={note.title}
                className="note-thumbnail"
              />
            ) : (
              <div className="note-thumbnail-placeholder">
                <span>📚</span>
                <p>No thumbnail</p>
              </div>
            )}
          </div>

        </section>

        {/* Stats */}
        <section className="note-stats-card">

          <div className="note-stat">
            <span className="stat-icon">👁️</span>
            <div>
              <strong>{note.views || 0}</strong>
              <span>Views</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="note-stat">
            <span className="stat-icon">⬇️</span>
            <div>
              <strong>{note.downloads || 0}</strong>
              <span>Downloads</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="note-stat">
            <span className="stat-icon">⭐</span>
            <div>
              <strong>
                {note.averageRating
                  ? Number(note.averageRating).toFixed(1)
                  : '—'}
              </strong>
              <span>
                {note.ratingCount || 0} Ratings
              </span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="note-stat">
            <span className="stat-icon">📅</span>
            <div>
              <strong>
                {note.createdAt
                  ? new Date(note.createdAt).toLocaleDateString()
                  : '—'}
              </strong>
              <span>Created</span>
            </div>
          </div>

        </section>

        {/* Actions */}
        <section className="note-actions-card">

          <div className="primary-note-actions">

            <button
              className={`save-note-button ${
                isSaved ? 'saved' : ''
              }`}
              onClick={handleSaveNote}
              disabled={saveSubmitting}
            >
              {saveSubmitting
                ? 'Saving...'
                : isSaved
                  ? '🔖 Saved'
                  : '🔖 Save Note'}
            </button>

            <button
              className="download-note-button"
              onClick={handleDownload}
              disabled={downloadSubmitting}
            >
              {downloadSubmitting
                ? 'Downloading...'
                : note.hasPdf
                  ? '⬇️ Download PDF'
                  : '⬇️ No PDF Available'}
            </button>

            {user && !isOwner && (
              <button
                className="report-note-button"
                onClick={() => setShowReportModal(true)}
              >
                🚩 Report
              </button>
            )}

          </div>

          {isOwner && !isEditing && (
            <div className="owner-note-actions">
              <button
                className="edit-note-button"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Note
              </button>

              <button
                className="delete-note-button"
                onClick={handleDelete}
              >
                🗑️ Delete Note
              </button>
            </div>
          )}

        </section>

        {/* Content */}
        <section className="note-content-card">

          <div className="section-heading">
            <span>📖</span>
            <div>
              <h2>Note Content</h2>
              <p>Read the complete study material below.</p>
            </div>
          </div>

          {isEditing ? (
            <>
              <input
                className="note-edit-field"
                type="text"
                value={editCourseCode}
                onChange={(e) =>
                  setEditCourseCode(e.target.value)
                }
                placeholder="Course code"
              />

              <textarea
                className="note-edit-content"
                value={editContent}
                onChange={(e) =>
                  setEditContent(e.target.value)
                }
                rows="16"
                placeholder="Note content"
              />

              <div className="edit-actions">
                <button
                  className="save-edit-button"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>

                <button
                  className="cancel-edit-button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="note-content">
              {note.content}
            </div>
          )}

        </section>

        {/* Rating */}
        <section className="note-rating-card">

          <div className="section-heading">
            <span>⭐</span>
            <div>
              <h2>Rate This Note</h2>
              <p>
                Share your experience with this study material.
              </p>
            </div>
          </div>

          <div className="rating-content">

            <div className="average-rating">
              <strong>
                {note.averageRating
                  ? Number(note.averageRating).toFixed(1)
                  : '0.0'}
              </strong>

              <StarRating
                value={Math.round(
                  note.averageRating || 0
                )}
                readOnly
              />

              <span>
                {note.ratingCount || 0} ratings
              </span>
            </div>

            {user && !isOwner && (
              <div className="your-rating">
                <span>Your rating</span>

                <StarRating
                  value={userRating}
                  onChange={handleRate}
                  readOnly={ratingSubmitting}
                />
              </div>
            )}

          </div>

        </section>

        {/* Comments */}
        <section className="note-comments-card">

          <div className="section-heading">
            <span>💬</span>
            <div>
              <h2>Comments</h2>
              <p>
                {note.comments?.length || 0} comments
              </p>
            </div>
          </div>

          {user && (
            <div className="comment-form">

              <textarea
                value={commentText}
                onChange={(e) =>
                  setCommentText(e.target.value)
                }
                rows="3"
                placeholder="Write a comment..."
              />

              <button
                onClick={handleAddComment}
                disabled={
                  commentSubmitting ||
                  !commentText.trim()
                }
              >
                {commentSubmitting
                  ? 'Posting...'
                  : 'Post Comment'}
              </button>

            </div>
          )}

          <div className="comments-list">

            {(note.comments || []).length === 0 ? (
              <div className="no-comments">
                <span>💬</span>
                <p>No comments yet.</p>
                <small>
                  Be the first to share your thoughts.
                </small>
              </div>
            ) : (
              note.comments.map((comment) => (
                <div
                  className="comment-item"
                  key={comment.id}
                >
                  <div className="comment-avatar">
                    {(
                      comment.authorName || 'U'
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="comment-body">

                    <div className="comment-header">
                      <strong>
                        {comment.authorName}
                      </strong>

                      <span>
                        {comment.createdAt
                          ? new Date(
                              comment.createdAt
                            ).toLocaleDateString()
                          : ''}
                      </span>
                    </div>

                    <p>{comment.commentText}</p>

                  </div>
                </div>
              ))
            )}

          </div>

        </section>

      </div>

      {/* Report modal */}
      {showReportModal && (
        <div className="report-modal-overlay">

          <div className="report-modal">

            <button
              className="report-modal-close"
              onClick={() =>
                setShowReportModal(false)
              }
            >
              ×
            </button>

            <div className="report-modal-icon">
              🚩
            </div>

            <h2>Report Note</h2>

            <p>
              Tell us why you think this note should
              be reviewed.
            </p>

            <textarea
              value={reportReason}
              onChange={(e) =>
                setReportReason(e.target.value)
              }
              rows="5"
              placeholder="Enter your reason..."
            />

            <div className="report-modal-actions">

              <button
                className="cancel-report-button"
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
              >
                Cancel
              </button>

              <button
                className="submit-report-button"
                onClick={handleReport}
                disabled={
                  reportSubmitting ||
                  !reportReason.trim()
                }
              >
                {reportSubmitting
                  ? 'Submitting...'
                  : 'Submit Report'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}