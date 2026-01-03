import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { FaEnvelope } from 'react-icons/fa';

const UserProfile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch User Info
                const userRes = await API.get(`/users/${userId}`);
                setProfileUser(userRes.data);

                // Fetch User Posts
                const postsRes = await API.get(`/posts?userId=${userId}`);
                setPosts(postsRes.data);
            } catch (err) {
                console.error(err);
                setError('User not found or something went wrong.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchData();
    }, [userId]);

    const handleMessage = () => {
        navigate(`/messages/${userId}`);
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading profile...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '2rem', color: '#ef4444' }}>{error}</div>;
    if (!profileUser) return null;

    // Check if viewing own profile
    const isMe = currentUser?.id === profileUser.id;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            <div className="card mb-6" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Avatar
                        src={profileUser.avatar}
                        name={profileUser.displayName}
                        size="100px"
                        style={{ border: '3px solid var(--accent-color)' }}
                    />
                </div>
                <h2 className="text-2xl font-bold mb-1">{profileUser.displayName}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{profileUser.email}</p>

                {profileUser.bio && (
                    <p style={{ marginBottom: '1.5rem', fontStyle: 'italic' }}>"{profileUser.bio}"</p>
                )}

                {/* Actions */}
                {!isMe && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button
                            onClick={handleMessage}
                            className="btn"
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaEnvelope /> Message
                        </button>
                    </div>
                )}
            </div>

            {/* Posts */}
            <h3 className="text-xl font-bold mb-4">Posts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {posts.length > 0 ? (
                    posts.map(post => <PostCard key={post.id} post={{ ...post, onDelete: (id) => setPosts(posts.filter(p => p.id !== id)) }} />)
                ) : (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No posts yet.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
