import React, { useState } from 'react';
import { COMMON_SUBJECTS, COMMON_TAGS } from '../../data/forumMockData';

export default function CreatePostModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: '',
    customSubject: '',
    tags: [],
    isAnonymous: false,
  });

  const [errors, setErrors] = useState({});
  const [showCustomSubject, setShowCustomSubject] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomSubject(true);
      setFormData(prev => ({ ...prev, subject: '' }));
    } else {
      setShowCustomSubject(false);
      setFormData(prev => ({ ...prev, subject: value }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
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

    const subject = showCustomSubject ? formData.customSubject : formData.subject;
    if (!subject) {
      newErrors.subject = 'Please select or enter a subject';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'Please select at least one tag';
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

    const subject = showCustomSubject ? formData.customSubject : formData.subject;

    onCreate({
      title: formData.title,
      content: formData.content,
      subject: subject,
      tags: formData.tags,
      isAnonymous: formData.isAnonymous,
      author: formData.isAnonymous ? null : { id: 1, name: 'You', email: 'your@email.com' },
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

          {/* Subject */}
          <div className="form-group">
            <label>Subject *</label>
            <select
              value={showCustomSubject ? 'custom' : formData.subject}
              onChange={handleSubjectChange}
              className={errors.subject ? 'input-error' : ''}
            >
              <option value="">Select a subject</option>
              {COMMON_SUBJECTS.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
              <option value="custom">+ Add custom subject</option>
            </select>

            {showCustomSubject && (
              <input
                type="text"
                name="customSubject"
                placeholder="Enter your subject (e.g., Advanced Physics)"
                value={formData.customSubject}
                onChange={handleChange}
                className="custom-subject-input"
              />
            )}
            {errors.subject && <span className="error-text">⚠️ {errors.subject}</span>}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags * (Select at least one)</label>
            <div className="tags-selection">
              {COMMON_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-btn ${formData.tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
            {errors.tags && <span className="error-text">⚠️ {errors.tags}</span>}
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