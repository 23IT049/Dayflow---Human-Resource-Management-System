import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI } from '../../services/api';
import { FiEdit2, FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBriefcase } from 'react-icons/fi';
import Layout from '../../components/Layout/Layout';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await employeeAPI.getProfile();
            setProfile(response.data);
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (formData.emergencyContact?.phone && !/^\d{10}$/.test(formData.emergencyContact.phone.replace(/\D/g, ''))) {
            newErrors.emergencyPhone = 'Emergency phone must be 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('emergencyContact.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                emergencyContact: {
                    ...prev.emergencyContact,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            const updateData = {
                phone: formData.phone,
                address: formData.address,
                emergencyContact: formData.emergencyContact
            };

            await employeeAPI.updateProfile(updateData);

            setProfile(formData);
            setEditMode(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profile);
        setErrors({});
        setEditMode(false);
        setMessage({ type: '', text: '' });
    };

    if (loading) {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="profile-page">
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-avatar">
                            <FiUser />
                        </div>
                        <div className="profile-header-info">
                            <h2 className="profile-name">
                                {profile?.firstName} {profile?.lastName}
                            </h2>
                            <p className="profile-role">{profile?.position || 'Employee'}</p>
                            <span className="badge badge-purple">
                                {profile?.department || 'General'}
                            </span>
                        </div>
                    </div>
                    <div className="profile-header-actions">
                        {!editMode ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => setEditMode(true)}
                            >
                                <FiEdit2 /> Edit Profile
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button
                                    className="btn btn-success"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <div className="spinner spinner-sm"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave /> Save Changes
                                        </>
                                    )}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    <FiX /> Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="profile-content">
                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Personal Information</h3>
                            </div>
                            <div className="profile-grid">
                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiUser /> First Name
                                    </label>
                                    <div className="profile-value readonly">
                                        {profile?.firstName || 'N/A'}
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiUser /> Last Name
                                    </label>
                                    <div className="profile-value readonly">
                                        {profile?.lastName || 'N/A'}
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiMail /> Email
                                    </label>
                                    <div className="profile-value readonly">
                                        {profile?.email || user?.email || 'N/A'}
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiCalendar /> Date of Birth
                                    </label>
                                    <div className="profile-value readonly">
                                        {profile?.dateOfBirth
                                            ? new Date(profile.dateOfBirth).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiPhone /> Phone Number
                                    </label>
                                    {editMode ? (
                                        <div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone || ''}
                                                onChange={handleChange}
                                                className={`form-input ${errors.phone ? 'error' : ''}`}
                                                placeholder="Enter phone number"
                                            />
                                            {errors.phone && (
                                                <span className="form-error">{errors.phone}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="profile-value">
                                            {profile?.phone || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                <div className="profile-field full-width">
                                    <label className="profile-label">
                                        <FiMapPin /> Address
                                    </label>
                                    {editMode ? (
                                        <textarea
                                            name="address"
                                            value={formData.address || ''}
                                            onChange={handleChange}
                                            className="form-textarea"
                                            placeholder="Enter address"
                                            rows="3"
                                        />
                                    ) : (
                                        <div className="profile-value">
                                            {profile?.address || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Job Information */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Job Information</h3>
                            </div>
                            <div className="profile-grid">
                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiBriefcase /> Employee ID
                                    </label>
                                    <div className="profile-value readonly">
                                        {profile?.employeeId || 'N/A'}
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiBriefcase /> Department
                                    </label>
                                    <div className="profile-value readonly">
                                        {profile?.department || 'N/A'}
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiBriefcase /> Position
                                    </label>
                                    <div className="profile-value readonly">
                                        {profile?.position || 'N/A'}
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiCalendar /> Join Date
                                    </label>
                                    <div className="profile-value readonly">
                                        {profile?.joiningDate
                                            ? new Date(profile.joiningDate).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Emergency Contact</h3>
                            </div>
                            <div className="profile-grid">
                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiUser /> Contact Name
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="emergencyContact.name"
                                            value={formData.emergencyContact?.name || ''}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter contact name"
                                        />
                                    ) : (
                                        <div className="profile-value">
                                            {profile?.emergencyContact?.name || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiPhone /> Contact Phone
                                    </label>
                                    {editMode ? (
                                        <div>
                                            <input
                                                type="tel"
                                                name="emergencyContact.phone"
                                                value={formData.emergencyContact?.phone || ''}
                                                onChange={handleChange}
                                                className={`form-input ${errors.emergencyPhone ? 'error' : ''}`}
                                                placeholder="Enter contact phone"
                                            />
                                            {errors.emergencyPhone && (
                                                <span className="form-error">{errors.emergencyPhone}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="profile-value">
                                            {profile?.emergencyContact?.phone || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                <div className="profile-field">
                                    <label className="profile-label">
                                        <FiUser /> Relationship
                                    </label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="emergencyContact.relationship"
                                            value={formData.emergencyContact?.relationship || ''}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="e.g., Spouse, Parent, Sibling"
                                        />
                                    ) : (
                                        <div className="profile-value">
                                            {profile?.emergencyContact?.relationship || 'Not provided'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
