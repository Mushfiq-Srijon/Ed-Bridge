import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfilePage.css';

export default function ProfilePage() {
  const { login, token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    educationLevel: '',
    phone: '',
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoInputKey, setPhotoInputKey] = useState(0);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Name cannot be empty');
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
      <h1>My Profile</h1>

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
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={saving}
              />
            ) : (
              <p>{profile.phone || 'Not set'}</p>
            )}
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
    </div>
  );
}