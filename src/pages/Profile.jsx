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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <Avatar
                        src={user?.avatar}
                        name={user?.displayName}
                        size="100px"
                        style={{ border: '3px solid var(--accent-color)' }}
                    />
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{user?.displayName}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Display Name</label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                resize: 'none'
                            }}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        >
                            <option value="Not specified">Not specified</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaSave /> {loading ? 'Saving...' : 'Save Profile'}
                    </button>

                    {message && (
                        <p style={{ marginTop: '1rem', textAlign: 'center', color: message.includes('success') ? '#10b981' : '#ef4444' }}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;
