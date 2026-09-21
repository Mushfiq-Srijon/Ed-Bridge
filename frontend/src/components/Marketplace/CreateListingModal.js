import React, { useEffect, useRef, useState } from 'react';
import { forumAPI } from '../../services/api';
import '../../styles/CreateListingModal.css';

const MAX_IMAGE_DIMENSION = 1200;
const MAX_IMAGE_DATA_URL_LENGTH = 600000;

const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The selected image could not be read.'));
    image.src = source;
  });

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.readAsDataURL(file);
  });

const compressImageForListing = async (file) => {
  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);
  const largestSide = Math.max(image.width, image.height);
  let scale = Math.min(1, MAX_IMAGE_DIMENSION / largestSide);
  let quality = 0.82;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    if (compressedDataUrl.length <= MAX_IMAGE_DATA_URL_LENGTH) {
      return compressedDataUrl;
    }

    scale *= 0.8;
    quality = Math.max(0.5, quality - 0.08);
  }

  throw new Error('This image is still too large after compression. Choose a smaller image.');
};

export default function CreateListingModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    condition: 'Good',
    originalPrice: '',
    askingPrice: '',
    category: '',
    area: '',
    educationLevel: '',
    imageUrl: '',
    subjectTagIds: [],
  });

  const [imagePreview, setImagePreview] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState('');
  const [isCustomSubjectOpen, setIsCustomSubjectOpen] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const imageInputRef = useRef(null);
  const fieldRefs = useRef({});
  const maximumListingPrice = 10000;

  const categories = [
    'Textbooks',
    'Lab Equipment',
    'Instruments',
    'Project Tools',
    'Study Materials',
    'Other',
  ];

  const areas = [
    'Dhaka',
    'Sylhet',
    'Chittagong',
    'Khulna',
    'Rajshahi',
    'Barisal',
    'Mymensingh',
  ];

  const loadSubjects = async () => {
    setSubjectsLoading(true);
    setSubjectsError('');

    try {
      const data = await forumAPI.getSubjects();

      if (!Array.isArray(data)) {
        throw new Error('The server returned an invalid subjects response.');
      }

      setSubjects(data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]);
      setSubjectsError(
        error.message || 'Could not load subjects. Please try again.'
      );
    } finally {
      setSubjectsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === 'imageUrl') {
      setImagePreview(value.trim());
    }

    setErrors((previous) => ({
      ...previous,
      [name]: '',
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((previous) => ({
        ...previous,
        image: 'Please select a valid image file.',
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        image: 'Choose an image smaller than 10 MB.',
      }));
      return;
    }

    setIsProcessingImage(true);
    setErrors((previous) => ({ ...previous, image: '' }));

    try {
      const imageDataUrl = await compressImageForListing(file);
      setImagePreview(imageDataUrl);
      setFormData((previous) => ({
        ...previous,
        imageUrl: imageDataUrl,
      }));

      setErrors((previous) => ({
        ...previous,
        image: '',
      }));
    } catch (error) {
      setImagePreview('');
      setFormData((previous) => ({ ...previous, imageUrl: '' }));
      setErrors((previous) => ({
        ...previous,
        image: error.message || 'Unable to prepare this image.',
      }));
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');

    setFormData((previous) => ({
      ...previous,
      imageUrl: '',
    }));

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubjectToggle = (subjectId) => {
    setFormData((previous) => ({
      ...previous,
      subjectTagIds: previous.subjectTagIds.includes(subjectId)
        ? previous.subjectTagIds.filter((id) => id !== subjectId)
        : [...previous.subjectTagIds, subjectId],
    }));

    setErrors((previous) => ({
      ...previous,
      subject: '',
    }));
  };

  const setFieldRef = (fieldName) => (element) => {
    fieldRefs.current[fieldName] = element;
  };

  const scrollToFirstInvalidField = (validationErrors) => {
    const fieldOrder = [
      'title',
      'description',
      'category',
      'area',
      'originalPrice',
      'askingPrice',
      'subject',
    ];

    const firstInvalidField = fieldOrder.find((field) => validationErrors[field]);
    const element = fieldRefs.current[firstInvalidField];

    requestAnimationFrame(() => {
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element?.focus?.({ preventScroll: true });
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must contain at least 5 characters.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must contain at least 10 characters.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category.';
    }

    if (!formData.area) {
      newErrors.area = 'Please select an area.';
    }

    if (!formData.originalPrice || Number(formData.originalPrice) <= 0) {
      newErrors.originalPrice = 'Original price must be greater than 0.';
    } else if (Number(formData.originalPrice) > maximumListingPrice) {
      newErrors.originalPrice = 'Original price cannot be more than 10,000 Tk.';
    }

    if (!formData.askingPrice || Number(formData.askingPrice) <= 0) {
      newErrors.askingPrice = 'Asking price must be greater than 0.';
    } else if (Number(formData.askingPrice) > maximumListingPrice) {
      newErrors.askingPrice = 'Asking price cannot be more than 10,000 Tk.';
    }

    if (
      Number(formData.originalPrice) > 0 &&
      Number(formData.askingPrice) > Number(formData.originalPrice)
    ) {
      newErrors.askingPrice =
        'Asking price should not be higher than the original price.';
    }

    if (formData.subjectTagIds.length === 0 && !customSubject.trim()) {
      newErrors.subject = 'Please select at least one subject.';
    } else if (customSubject.trim() && customSubject.trim().length < 2) {
      newErrors.subject = 'A custom subject must contain at least 2 characters.';
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToFirstInvalidField(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate({
        title: formData.title.trim(),
        description: formData.description.trim(),
        condition: formData.condition,
        originalPrice: Number(formData.originalPrice),
        askingPrice: Number(formData.askingPrice),
        category: formData.category,
        area: formData.area,
        educationLevel: formData.educationLevel || null,
        imageUrl: formData.imageUrl.trim() || null,
        subjectTagIds: formData.subjectTagIds,
        customSubject: customSubject.trim() || null,
      });
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert(error.message || 'Failed to create listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay create-listing-modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-listing-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="create-listing-title">Post a Listing</h2>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close post listing form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-listing-form">
          <div className="form-group">
            <label htmlFor="listing-title">Item Title *</label>
            <input
              id="listing-title"
              type="text"
              name="title"
              placeholder="e.g., Physics Textbook - 3rd Edition"
              value={formData.title}
              onChange={handleChange}
              ref={setFieldRef('title')}
              className={errors.title ? 'input-error' : ''}
              maxLength="100"
            />
            <div className="input-counter">{formData.title.length}/100</div>
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="listing-description">Description *</label>
            <textarea
              id="listing-description"
              name="description"
              placeholder="Describe the condition, usage, and important details..."
              value={formData.description}
              onChange={handleChange}
              ref={setFieldRef('description')}
              rows="5"
              className={errors.description ? 'input-error' : ''}
            />
            {errors.description && (
              <span className="error-text">{errors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="image-upload">Product Image</label>

            <div className="image-upload-section">
              <input
                ref={imageInputRef}
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
                disabled={isProcessingImage || isSubmitting}
              />

              <label htmlFor="image-upload" className="image-upload-label">
                {isProcessingImage ? 'Preparing image...' : 'Choose an image'}
              </label>

              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Selected listing preview"
                    onError={() => {
                      setErrors((previous) => ({
                        ...previous,
                        image: 'This image URL could not be loaded.',
                      }));
                    }}
                  />

                  <button
                    type="button"
                    className="remove-image"
                    onClick={handleRemoveImage}
                    aria-label="Remove selected image"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {errors.image && <span className="error-text">{errors.image}</span>}

            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                margin: '12px 0 8px',
              }}
            >
              Or paste an image URL:
            </p>

            <input
              type="url"
              name="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="listing-category">Category *</label>
            <select
              id="listing-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              ref={setFieldRef('category')}
              className={errors.category ? 'input-error' : ''}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="error-text">{errors.category}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="listing-area">Area *</label>
            <select
              id="listing-area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              ref={setFieldRef('area')}
              className={errors.area ? 'input-error' : ''}
            >
              <option value="">Select your area</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            {errors.area && <span className="error-text">{errors.area}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="listing-condition">Condition *</label>
            <select
              id="listing-condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="original-price">Original Price (৳) *</label>
              <input
                id="original-price"
                type="number"
                name="originalPrice"
                placeholder="Original price"
                value={formData.originalPrice}
                onChange={handleChange}
                ref={setFieldRef('originalPrice')}
                className={errors.originalPrice ? 'input-error' : ''}
                min="1"
                max={maximumListingPrice}
              />
              {errors.originalPrice && (
                <span className="error-text">{errors.originalPrice}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="asking-price">Asking Price (৳) *</label>
              <input
                id="asking-price"
                type="number"
                name="askingPrice"
                placeholder="Your asking price"
                value={formData.askingPrice}
                onChange={handleChange}
                ref={setFieldRef('askingPrice')}
                className={errors.askingPrice ? 'input-error' : ''}
                min="1"
                max={maximumListingPrice}
              />
              {errors.askingPrice && (
                <span className="error-text">{errors.askingPrice}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="education-level">Education Level</label>
            <select
              id="education-level"
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
            >
              <option value="">Select education level (optional)</option>
              <option value="School">School</option>
              <option value="College">College</option>
              <option value="University">University</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subjects * (select at least one)</label>

            <div
              ref={setFieldRef('subject')}
              className="tags-selection"
              tabIndex="-1"
            >
              {subjectsLoading ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Loading subjects…
                </p>
              ) : subjectsError ? (
                <div style={{ color: '#dc2626', fontSize: '14px' }}>
                  <p>{subjectsError}</p>
                  <button type="button" className="tag-btn" onClick={loadSubjects}>
                    Retry
                  </button>
                </div>
              ) : subjects.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  No subjects are available. Seed subjects in the backend first.
                </p>
              ) : (
                subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    className={`tag-btn ${
                      formData.subjectTagIds.includes(subject.id) ? 'active' : ''
                    }`}
                    onClick={() => handleSubjectToggle(subject.id)}
                  >
                    {subject.name}
                  </button>
                ))
              )}

              {!subjectsLoading && !subjectsError && (
                <>
                  <button
                    type="button"
                    className={`tag-btn tag-btn-other ${
                      isCustomSubjectOpen ? 'active' : ''
                    }`}
                    onClick={() => {
                      if (isCustomSubjectOpen) {
                        setCustomSubject('');
                      }
                      setIsCustomSubjectOpen((previous) => !previous);
                      setErrors((previous) => ({ ...previous, subject: '' }));
                    }}
                  >
                    Other subject
                  </button>

                  {isCustomSubjectOpen && (
                    <input
                      ref={setFieldRef('subject')}
                      className="custom-subject-input"
                      type="text"
                      value={customSubject}
                      onChange={(event) => {
                        setCustomSubject(event.target.value);
                        setErrors((previous) => ({ ...previous, subject: '' }));
                      }}
                      placeholder="Write the subject name"
                      maxLength="80"
                    />
                  )}
                </>
              )}
            </div>

            {errors.subject && (
              <span className="error-text">{errors.subject}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting || subjectsLoading || isProcessingImage}
            >
              {isSubmitting ? 'Posting…' : 'Post Listing'}
            </button>

            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
