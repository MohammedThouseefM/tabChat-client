import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const AdminUserDetails = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await API.get(`/api/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, user.token]);

    const editPost = async (post) => {
        const newContent = prompt("Edit post content:", post.content);
        if (newContent !== null && newContent !== post.content) {
            try {
                await API.put(`/api/admin/posts/${post.id}`, { content: newContent }, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setData(prev => ({
                    ...prev,
                    posts: prev.posts.map(p => p.id === post.id ? { ...p, content: newContent } : p)
                }));
            } catch (err) {
                console.error(err);
                alert("Failed to update post");
            }
        }
    }

    const deletePost = async (postId) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await API.delete(`/api/admin/posts/${postId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setData(prev => ({
                ...prev,
                posts: prev.posts.filter(p => p.id !== postId)
            }));
        } catch (err) {
            console.error(err);
        }
    }

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading details...</div>;
    if (!data || !data.user) return <div style={{ color: 'white', padding: '2rem' }}>User not found</div>;

    const { user: profile, posts, messages } = data;

    return (
        <div>
            <div style={{ marginBottom: '1rem' }}>
                <Link to="/admin/users" style={{ color: '#9ca3af', textDecoration: 'none' }}>&larr; Back to Users</Link>
            </div>

            <div className="admin-card" style={{ maxWidth: '100%', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <img src={profile.avatar} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
                    <div>
                        <h1 className="admin-title" style={{ marginBottom: '0.5rem' }}>{profile.displayName}</h1>
                        <p style={{ color: '#9ca3af' }}>{profile.email}</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Member since: {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                            Bio: {profile.bio || 'No bio'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="activity-grid">
                <div className="activity-card">
                    <h3 className="section-title">User Posts ({posts.length})</h3>
                    <div className="space-y-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {posts.map(post => (
                            <div key={post.id} className="activity-item">
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                                    <p style={{ color: 'white', fontSize: '0.9rem' }}>{post.content}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                    <button onClick={() => editPost(post)} className="btn-edit" style={{ fontSize: '0.75rem', color: '#60a5fa' }}>Edit</button>
                                    <button onClick={() => deletePost(post.id)} className="btn-delete" style={{ fontSize: '0.75rem' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                        {posts.length === 0 && <p style={{ color: '#6b7280' }}>No posts found.</p>}
                    </div>
                </div>
                <div className="activity-card">
                    <h3 className="section-title">Sent Messages ({messages.length})</h3>
                    <div className="space-y-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {messages.map(msg => (
                            <div key={msg.id} className="activity-item">
                                <div style={{ width: '100%' }}>
                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                        To: {msg.receiver?.displayName || 'Unknown'} • {new Date(msg.createdAt).toLocaleDateString()}
                                    </p>
                                    <p style={{ color: 'white', fontSize: '0.9rem' }}>{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {messages.length === 0 && <p style={{ color: '#6b7280' }}>No messages found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetails;
