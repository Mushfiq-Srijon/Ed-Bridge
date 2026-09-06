import React, { useState, useEffect } from 'react';
import { forumAPI } from '../../services/api';

export default function CreatePostModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subjectTagIds: [],
    isAnonymous: false,
  });

  const [subjects, setSubjects] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await forumAPI.getSubjects();
      console.log('Subjects data:', data);
      console.log('Type:', typeof data, 'Is Array:', Array.isArray(data));
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubjectToggle = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      subjectTagIds: prev.subjectTagIds.includes(subjectId)
        ? prev.subjectTagIds.filter(id => id !== subjectId)
        : [...prev.subjectTagIds, subjectId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Question title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title should be at least 10 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Question details are required';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Please provide more details (at least 20 characters)';
    }

    if (formData.subjectTagIds.length === 0) {
      newErrors.subject = 'Please select at least one subject';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreate({
      title: formData.title,
      content: formData.content,
      subjectTagIds: formData.subjectTagIds,
      isAnonymous: formData.isAnonymous,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>❓ Ask a Question</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          {/* Title */}
          <div className="form-group">
            <label>Question Title *</label>
            <input
              type="text"
              name="title"
              placeholder="What's your question? (Be specific and concise)"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
              maxLength="200"
            />
            <div className="input-counter">
              {formData.title.length}/200
            </div>
            {errors.title && <span className="error-text">⚠️ {errors.title}</span>}
          </div>

          {/* Content */}
          <div className="form-group">
            <label>Question Details *</label>
            <textarea
              name="content"
              placeholder="Provide more context and details about your question..."
              value={formData.content}
              onChange={handleChange}
              rows="6"
              className={errors.content ? 'input-error' : ''}
            />
            {errors.content && <span className="error-text">⚠️ {errors.content}</span>}
          </div>

          {/* Subjects */}
          <div className="form-group">
            <label>Subjects * (Select at least one)</label>
            <div className="tags-selection">
              {Array.isArray(subjects) && subjects.length > 0 ? (
                subjects.map(subject => (
                  <button
                    key={subject.id}
                    type="button"
                    className={`tag-btn ${formData.subjectTagIds.includes(subject.id) ? 'active' : ''}`}
                    onClick={() => handleSubjectToggle(subject.id)}
                  >
                    {subject.name}
                  </button>
                ))
              ) : (
                <p style={{ color: '#999', fontSize: '14px' }}>Loading subjects...</p>
              )}
            </div>
            {errors.subject && <span className="error-text">⚠️ {errors.subject}</span>}
          </div>

          {/* Anonymous Option */}
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleChange}
            />
            <label htmlFor="isAnonymous">Post anonymously 🔒</label>
            <p className="checkbox-hint">Your name won't be shown, but your question will still be helpful to others.</p>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Post Question
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}