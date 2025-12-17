import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { FaSave, FaUserEdit } from 'react-icons/fa';
import Avatar from '../components/Avatar';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        gender: 'Not specified',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                bio: user.bio || '',
                gender: user.gender || 'Not specified',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await API.put('/users/me', formData);
            setMessage('Profile updated successfully!');
            // Ideally refresh auth user, but for now just show success
        } catch (err) {
            console.error(err);
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card mb-4">
                <div className="profile-header">
                    <Avatar
                        src={user?.avatar}
                        name={user?.displayName}
                        size="100px"
                        style={{ border: '3px solid var(--accent-color)', flexShrink: 0 }}
                    />
                    <div className="profile-info">
                        <h2 className="profile-name">{user?.displayName}</h2>
                        <p style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{user?.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Display Name</label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                            className="input"
                            style={{ resize: 'none' }}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="Not specified">Not specified</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        <FaSave /> {loading ? 'Saving...' : 'Save Profile'}
                    </button>

                    {message && (
                        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'} mt-4 text-center`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;
