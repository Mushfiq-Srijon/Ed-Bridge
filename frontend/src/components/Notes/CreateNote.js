import React, { useState, useEffect } from 'react';
import { notesAPI } from '../../services/api';
import '../../styles/CreateNote.css';

export default function CreateNote({ onBack }) {
  const [formData, setFormData] = useState({
    title: '',
    subjectTagId: '',
    courseCode: '',
    content: '',
  });

  const [subjects, setSubjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await notesAPI.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.subjectTagId) {
      newErrors.subjectTagId = 'Subject is required';
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      await notesAPI.create({
        title: formData.title,
        content: formData.content,
        courseCode: formData.courseCode,
        subjectTagIds: [parseInt(formData.subjectTagId, 10)],
      });

      alert('Note created successfully!');
      onBack();
    } catch (err) {
      console.error('Failed to create note:', err);
      setServerError(err.message || 'Failed to create note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-note-page">
      <button onClick={onBack}>← Back</button>

      <h1>Create New Note</h1>

      {serverError && <p className="error-banner">{serverError}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Note Title *</label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={submitting}
          />

          {errors.title && <p>{errors.title}</p>}
        </div>

        <div>
          <label>Subject *</label>

          <select
            name="subjectTagId"
            value={formData.subjectTagId}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="">Select a subject</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          {errors.subjectTagId && <p>{errors.subjectTagId}</p>}
        </div>

        <div>
          <label>Course Code *</label>

          <input
            type="text"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            disabled={submitting}
          />

          {errors.courseCode && <p>{errors.courseCode}</p>}
        </div>

        <div>
          <label>Content *</label>

          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="10"
            disabled={submitting}
          />

          {errors.content && <p>{errors.content}</p>}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Note'}
        </button>
        <button type="button" onClick={onBack} disabled={submitting}>
          Cancel
        </button>
      </form>
    </div>
  );
}