import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfilePage.css';

export default function ProfilePage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    educationLevel: '',
    phone: '',
    about: '',
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await authAPI.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        institution: data.institution || '',
        educationLevel: data.educationLevel || '',
        phone: data.phone || '',
        about: data.about || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 13) : value;
    if (name === 'phone') setPhoneError('');
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: profile.name || '',
      institution: profile.institution || '',
      educationLevel: profile.educationLevel || '',
      phone: profile.phone || '',
      about: profile.about || '',
    });
    setPhoneError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Name cannot be empty');
      return;
    }

    if (formData.phone && !/^(01\d{9}|8801\d{9})$/.test(formData.phone)) {
      setPhoneError('Use 01 followed by 9 digits, or 8801 followed by 9 digits.');
      return;
    }

    try {
      setSaving(true);
      const result = await authAPI.updateProfile(formData);
      setProfile(result.profile);
      setIsEditing(false);

      const storedUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = {
        ...storedUser,
        name: result.profile.name,
        institution: result.profile.institution,
        educationLevel: result.profile.educationLevel,
        phone: result.profile.phone,
        about: result.profile.about,
      };
      login(token, updatedUser);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await authAPI.uploadProfilePhoto(file);

      setProfile((prev) => ({ ...prev, profilePhotoPath: result.profilePhotoPath + '?t=' + Date.now() }));

      const storedUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...storedUser, profilePhotoPath: result.profilePhotoPath };
      login(token, updatedUser);
    } catch (err) {
      console.error('Failed to upload photo:', err);
      alert(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      setPhotoInputKey((prev) => prev + 1);
    }
  };

  const handleRemovePhoto = async () => {
    const confirmed = window.confirm('Remove your profile photo?');
    if (!confirmed) return;

    try {
      await authAPI.removeProfilePhoto();
      setProfile((prev) => ({ ...prev, profilePhotoPath: null }));

      const storedUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...storedUser, profilePhotoPath: null };
      login(token, updatedUser);
    } catch (err) {
      console.error('Failed to remove photo:', err);
      alert(err.message || 'Failed to remove photo');
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <p>{error || 'Profile not found.'}</p>
      </div>
    );
  }

  const photoUrl = profile.profilePhotoPath
    ? `http://localhost:5180/${profile.profilePhotoPath}`
    : null;

  return (
    <div className="profile-page">
      <div className="profile-page-heading">
        <div>
          <p className="profile-eyebrow">Account profile</p>
          <h1>My Profile</h1>
          <p className="profile-heading-copy">Keep your learning identity current for the Ed-Bridge community.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-photo-section">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="profile-photo" />
          ) : (
            <div className="profile-photo-placeholder">
              {profile.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}

          <div className="photo-actions">
            <label className="btn-upload-photo">
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input
                key={photoInputKey}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>

            {profile.profilePhotoPath && (
              <button className="btn-remove-photo" onClick={handleRemovePhoto}>
                Remove Photo
              </button>
            )}
          </div>
        </div>

        <div className="profile-info-section">
          <div className="profile-field">
            <label>Email</label>
            <p>{profile.email}</p>
          </div>

          <div className="profile-field">
            <label>Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
              />
            ) : (
              <p>{profile.name}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Institution</label>
            {isEditing ? (
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                disabled={saving}
              />
            ) : (
              <p>{profile.institution || 'Not set'}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Education Level</label>
            {isEditing ? (
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">Select level</option>
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="University">University</option>
              </select>
            ) : (
              <p>{profile.educationLevel || 'Not set'}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Phone</label>
            {isEditing ? (
              <input
                type="tel"
                inputMode="numeric"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                maxLength={13}
                disabled={saving}
              />
            ) : (
              <p>{profile.phone || 'Not set'}</p>
            )}
            {isEditing && <small className="field-hint">11 digits starting with 01, or 13 digits starting with 8801.</small>}
            {phoneError && <small className="field-error">{phoneError}</small>}
          </div>

          <div className="profile-field">
            <label>Member Since</label>
            <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="btn-cancel" onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn-edit" onClick={handleEditClick}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-lower-grid">
        <section className="profile-about-card">
          <p className="profile-eyebrow">Community presence</p>
          <h2>About</h2>
          {isEditing ? (
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Tell the Ed-Bridge community about yourself, your interests, and your learning journey..."
              maxLength={1000}
              disabled={saving}
              rows={5}
            />
          ) : (
            <p className={profile.about ? 'profile-about-text' : 'profile-about-placeholder'}>
              {profile.about || 'Tell the Ed-Bridge community about yourself, your interests, and your learning journey.'}
            </p>
          )}
        </section>

        <section className="profile-security-card">
          <div>
            <p className="profile-eyebrow">Security</p>
            <h2>Keep your account secure</h2>
            <p>Change your password regularly and protect your learning space.</p>
          </div>
          <button className="btn-security" onClick={() => navigate('/settings')}>Change Password</button>
        </section>
      </div>
    </div>
  );
}