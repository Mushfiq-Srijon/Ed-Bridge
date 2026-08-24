import React, { useState } from 'react';
import '../../styles/CreateNote.css';
export default function CreateNote({ onBack }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    courseCode: '',
    content: '',
    tags: '',
  });

  const [errors, setErrors] = useState({});

  const subjects = [
    'Mathematics',
    'Physics',
    'Biology',
    'Chemistry',
    'English',
    'History',
    'Economics',
    'Computer Science',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      console.log('Note submitted:', formData);
      alert('Note created successfully!');
      onBack();
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="create-note-page">
      <button onClick={onBack}>← Back</button>

      <h1>Create New Note</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Note Title *</label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />

          {errors.title && <p>{errors.title}</p>}
        </div>

        <div>
          <label>Subject *</label>

          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
          >
            <option value="">Select a subject</option>

            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          {errors.subject && <p>{errors.subject}</p>}
        </div>

        <div>
          <label>Course Code *</label>

          <input
            type="text"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
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
          />

          {errors.content && <p>{errors.content}</p>}
        </div>

        <div>
          <label>Tags</label>

          <input
            type="text"
            name="tags"
            placeholder="Physics, Mechanics, Science"
            value={formData.tags}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Create Note</button>
        <button type="button" onClick={onBack}>
          Cancel
        </button>
      </form>
    </div>
  );
}