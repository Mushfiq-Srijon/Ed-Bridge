import React, { useState, useEffect } from 'react';
import { notesAPI } from '../../services/api';
import '../../styles/CreateNote.css';

const EDUCATION_LEVELS = ['School', 'College', 'University'];
const SCHOOL_CLASSES = ['1','2','3','4','5','6','7','8','9','10'];
const COLLEGE_CLASSES = ['11','12'];
const GROUPS = ['Science', 'Commerce', 'Arts'];

export default function CreateNote({ onBack }) {
  const [formData, setFormData] = useState({
    title: '',
    subjectTagId: '',
    courseCode: '',
    content: '',
    educationLevel: '',
    className: '',
    group: '',
    department: '',
    courseTitle: '',
    yearSemester: '',
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    // Reset dependent fields when education level changes
    if (name === 'educationLevel') {
      setFormData((prev) => ({
        ...prev,
        educationLevel: value,
        className: '',
        group: '',
        department: '',
        courseTitle: '',
        yearSemester: '',
      }));
    }

    // Reset group when class changes for school
    if (name === 'className' && formData.educationLevel === 'School') {
      setFormData((prev) => ({ ...prev, className: value, group: '' }));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrors((prev) => ({ ...prev, pdf: 'Only PDF files allowed' }));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, pdf: 'PDF must be under 20MB' }));
      return;
    }
    setPdfFile(file);
    setErrors((prev) => ({ ...prev, pdf: '' }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, thumbnail: 'Only JPG, PNG, WEBP allowed' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, thumbnail: 'Image must be under 5MB' }));
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, thumbnail: '' }));
  };

  const needsGroup = () => {
    if (formData.educationLevel === 'College') return true;
    if (formData.educationLevel === 'School') {
      return formData.className === '9' || formData.className === '10';
    }
    return false;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.subjectTagId) newErrors.subjectTagId = 'Subject is required';
    if (!formData.courseCode.trim()) newErrors.courseCode = 'Course code is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';

    if (formData.educationLevel === 'School' || formData.educationLevel === 'College') {
      if (!formData.className) newErrors.className = 'Class is required';
      if (needsGroup() && !formData.group) newErrors.group = 'Group is required';
    }

    if (formData.educationLevel === 'University') {
      if (!formData.department.trim()) newErrors.department = 'Department is required';
      if (!formData.courseTitle.trim()) newErrors.courseTitle = 'Course title is required';
      if (!formData.yearSemester.trim()) newErrors.yearSemester = 'Year/Semester is required';
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
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('content', formData.content);
      fd.append('courseCode', formData.courseCode);
      fd.append('educationLevel', formData.educationLevel);
      if (formData.className) fd.append('className', formData.className);
      if (formData.group) fd.append('group', formData.group);
      if (formData.department) fd.append('department', formData.department);
      if (formData.courseTitle) fd.append('courseTitle', formData.courseTitle);
      if (formData.yearSemester) fd.append('yearSemester', formData.yearSemester);
      fd.append('subjectTagIds[0]', parseInt(formData.subjectTagId, 10));
      if (pdfFile) fd.append('pdfFile', pdfFile);
      if (thumbnailFile) fd.append('thumbnailFile', thumbnailFile);

      await notesAPI.create(fd);
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

        {/* Title */}
        <div className="form-group">
          <label>Note Title *</label>
          <input type="text" name="title" value={formData.title}
            onChange={handleChange} disabled={submitting} />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        {/* Subject */}
        <div className="form-group">
          <label>Subject *</label>
          <select name="subjectTagId" value={formData.subjectTagId}
            onChange={handleChange} disabled={submitting}>
            <option value="">Select a subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.subjectTagId && <p className="field-error">{errors.subjectTagId}</p>}
        </div>

        {/* Course Code */}
        <div className="form-group">
          <label>Course Code *</label>
          <input type="text" name="courseCode" value={formData.courseCode}
            onChange={handleChange} disabled={submitting} />
          {errors.courseCode && <p className="field-error">{errors.courseCode}</p>}
        </div>

        {/* Education Level */}
        <div className="form-group">
          <label>Education Level *</label>
          <select name="educationLevel" value={formData.educationLevel}
            onChange={handleChange} disabled={submitting}>
            <option value="">Select education level</option>
            {EDUCATION_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          {errors.educationLevel && <p className="field-error">{errors.educationLevel}</p>}
        </div>

        {/* School / College fields */}
        {(formData.educationLevel === 'School' || formData.educationLevel === 'College') && (
          <>
            <div className="form-group">
              <label>Class *</label>
              <select name="className" value={formData.className}
                onChange={handleChange} disabled={submitting}>
                <option value="">Select class</option>
                {(formData.educationLevel === 'School' ? SCHOOL_CLASSES : COLLEGE_CLASSES).map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
              {errors.className && <p className="field-error">{errors.className}</p>}
            </div>

            {needsGroup() && (
              <div className="form-group">
                <label>Group *</label>
                <select name="group" value={formData.group}
                  onChange={handleChange} disabled={submitting}>
                  <option value="">Select group</option>
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.group && <p className="field-error">{errors.group}</p>}
              </div>
            )}
          </>
        )}

        {/* University fields */}
        {formData.educationLevel === 'University' && (
          <>
            <div className="form-group">
              <label>Department *</label>
              <input type="text" name="department" value={formData.department}
                onChange={handleChange} disabled={submitting} />
              {errors.department && <p className="field-error">{errors.department}</p>}
            </div>

            <div className="form-group">
              <label>Course Title *</label>
              <input type="text" name="courseTitle" value={formData.courseTitle}
                placeholder="e.g. Discrete Mathematics"
                onChange={handleChange} disabled={submitting} />
              {errors.courseTitle && <p className="field-error">{errors.courseTitle}</p>}
            </div>

            <div className="form-group">
              <label>Year / Semester *</label>
              <input type="text" name="yearSemester" value={formData.yearSemester}
                placeholder="e.g. 3rd Year, 1st Semester"
                onChange={handleChange} disabled={submitting} />
              {errors.yearSemester && <p className="field-error">{errors.yearSemester}</p>}
            </div>
          </>
        )}

        {/* PDF Upload */}
        <div className="form-group">
          <label>PDF File (optional)</label>
          <input type="file" accept=".pdf" onChange={handlePdfChange} disabled={submitting} />
          {pdfFile && <p className="file-selected">✅ {pdfFile.name}</p>}
          {errors.pdf && <p className="field-error">{errors.pdf}</p>}
        </div>

        {/* Thumbnail Upload */}
        <div className="form-group">
          <label>Thumbnail Image (optional)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp"
            onChange={handleThumbnailChange} disabled={submitting} />
          {thumbnailPreview && (
            <img src={thumbnailPreview} alt="Preview"
              style={{ width: '120px', height: '80px', objectFit: 'cover', marginTop: '8px', borderRadius: '4px' }} />
          )}
          {errors.thumbnail && <p className="field-error">{errors.thumbnail}</p>}
        </div>

        {/* Content */}
        <div className="form-group">
          <label>Content *</label>
          <textarea name="content" value={formData.content}
            onChange={handleChange} rows="10" disabled={submitting} />
          {errors.content && <p className="field-error">{errors.content}</p>}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Note'}
        </button>
        <button type="button" onClick={onBack} disabled={submitting}>Cancel</button>
      </form>
    </div>
  );
}