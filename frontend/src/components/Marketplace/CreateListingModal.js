import React, { useState, useEffect } from 'react';
import { listingsAPI, forumAPI } from '../../services/api';
import '../../styles/CreateListingModal.css';

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
    const [categories] = useState(['Textbooks', 'Lab Equipment', 'Instruments', 'Project Tools', 'Study Materials', 'Other']);
    const [areas] = useState(['Dhaka', 'Sylhet', 'Chittagong', 'Khulna', 'Rajshahi', 'Barisal', 'Mymensingh']);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await forumAPI.getSubjects();
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({
                    ...prev,
                    imageUrl: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        setFormData(prev => ({ ...prev, imageUrl: '' }));
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
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Title should be at least 5 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description should be at least 10 characters';
        }

        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        if (!formData.area) {
            newErrors.area = 'Please select an area';
        }

        if (!formData.originalPrice || formData.originalPrice <= 0) {
            newErrors.originalPrice = 'Original price must be greater than 0';
        }

        if (!formData.askingPrice || formData.askingPrice <= 0) {
            newErrors.askingPrice = 'Asking price must be greater than 0';
        }

        if (formData.subjectTagIds.length === 0) {
            newErrors.subject = 'Please select at least one subject';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await onCreate({
                title: formData.title,
                description: formData.description,
                condition: formData.condition,
                originalPrice: parseFloat(formData.originalPrice),
                askingPrice: parseFloat(formData.askingPrice),
                category: formData.category,
                area: formData.area,
                educationLevel: formData.educationLevel || null,
                imageUrl: formData.imageUrl || null,
                subjectTagIds: formData.subjectTagIds,
            });
        } catch (error) {
            console.error('Failed to create listing:', error);
            alert(error.message || 'Failed to create listing');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📦 Post a Listing</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="create-listing-form">
                    {/* Title */}
                    <div className="form-group">
                        <label>Item Title *</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g., Physics Textbook - 3rd Edition"
                            value={formData.title}
                            onChange={handleChange}
                            className={errors.title ? 'input-error' : ''}
                            maxLength="100"
                        />
                        <div className="input-counter">{formData.title.length}/100</div>
                        {errors.title && <span className="error-text">⚠️ {errors.title}</span>}
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            name="description"
                            placeholder="Describe the condition, usage, and any details about the item..."
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            className={errors.description ? 'input-error' : ''}
                        />
                        {errors.description && <span className="error-text">⚠️ {errors.description}</span>}
                    </div>

                    {/* Image Upload */}
                    <div className="form-group">
                        <label>Product Image *</label>
                        <div className="image-upload-section">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="image-input"
                                id="imageUpload"
                            />
                            <label htmlFor="imageUpload" className="image-upload-label">
                                📷 Click to choose image
                            </label>
                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={handleRemoveImage}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '12px 0 8px' }}>Or paste URL:</p>
                        <input
                            type="url"
                            name="imageUrl"
                            placeholder="https://example.com/image.jpg"
                            value={formData.imageUrl}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label>Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={errors.category ? 'input-error' : ''}
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <span className="error-text">⚠️ {errors.category}</span>}
                    </div>

                    {/* Area */}
                    <div className="form-group">
                        <label>Area *</label>
                        <select
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            className={errors.area ? 'input-error' : ''}
                        >
                            <option value="">Select your area</option>
                            {areas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                        {errors.area && <span className="error-text">⚠️ {errors.area}</span>}
                    </div>

                    {/* Condition */}
                    <div className="form-group">
                        <label>Condition *</label>
                        <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                        >
                            <option value="Like New">Like New</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                        </select>
                    </div>

                    {/* Prices */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Original Price (৳) *</label>
                            <input
                                type="number"
                                name="originalPrice"
                                placeholder="Original price"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                className={errors.originalPrice ? 'input-error' : ''}
                                min="1"
                            />
                            {errors.originalPrice && <span className="error-text">⚠️ {errors.originalPrice}</span>}
                        </div>

                        <div className="form-group">
                            <label>Asking Price (৳) *</label>
                            <input
                                type="number"
                                name="askingPrice"
                                placeholder="Your asking price"
                                value={formData.askingPrice}
                                onChange={handleChange}
                                className={errors.askingPrice ? 'input-error' : ''}
                                min="1"
                            />
                            {errors.askingPrice && <span className="error-text">⚠️ {errors.askingPrice}</span>}
                        </div>
                    </div>

                    {/* Education Level */}
                    <div className="form-group">
                        <label>Education Level</label>
                        <select
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

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="submit" className="btn-submit">
                            Post Listing
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