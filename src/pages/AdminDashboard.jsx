import React, { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: 0, posts: 0, messages: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/api/admin/stats', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchStats();
        }
    }, [user]);

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading stats...</div>;

    return (
        <div>
            <h1 className="admin-title">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3 className="stat-label">Total Users</h3>
                    <p className="stat-value">{stats.users}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-label">Total Posts</h3>
                    <p className="stat-value">{stats.posts}</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-label">Total Messages</h3>
                    <p className="stat-value">{stats.messages}</p>
                </div>
            </div>

            <ActivityFeed user={user} />
        </div>
    );
};

const ActivityFeed = ({ user }) => {
    const [activity, setActivity] = useState({ posts: [], messages: [] });
    const [suspicious, setSuspicious] = useState({ posts: [], messages: [] });

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const activityRes = await API.get('/api/admin/activity', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setActivity(activityRes.data);

                const suspiciousRes = await API.get('/api/admin/suspicious', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setSuspicious(suspiciousRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchActivity();
    }, [user]);

    const deletePost = async (id) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await API.delete(`/api/admin/posts/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setActivity(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id) }));
            setSuspicious(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id) }));
        } catch (err) {
            console.error(err);
        }
    }

    const editPost = async (post) => {
        const newContent = prompt("Edit post content:", post.content);
        if (newContent !== null && newContent !== post.content) {
            try {
                await API.put(`/api/admin/posts/${post.id}`, { content: newContent }, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                // Update local state
                const updateState = (prev) => ({
                    ...prev,
                    posts: prev.posts.map(p => p.id === post.id ? { ...p, content: newContent } : p)
                });
                setActivity(updateState);
                setSuspicious(updateState);
            } catch (err) {
                console.error(err);
                alert("Failed to update post");
            }
        }
    }

    const renderPostItem = (post, isSuspicious = false) => (
        <div key={post.id} className="activity-item" style={isSuspicious ? { borderLeft: '3px solid #f59e0b' } : {}}>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    {post.User?.displayName || 'Unknown User'} {isSuspicious && <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>(Flagged)</span>}
                </p>
                <p style={{ color: 'white', fontSize: '0.9rem' }}>{post.content?.substring(0, 100)}...</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                <button onClick={() => editPost(post)} className="btn-edit" style={{ fontSize: '0.75rem', color: '#60a5fa' }}>Edit</button>
                <button onClick={() => deletePost(post.id)} className="btn-delete" style={{ fontSize: '0.75rem' }}>Delete</button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Suspicious Activity Section */}
            {(suspicious.posts.length > 0 || suspicious.messages.length > 0) && (
                <div className="activity-card" style={{ borderColor: '#f59e0b' }}>
                    <h3 className="section-title" style={{ color: '#f59e0b' }}>⚠️ Suspicious Activity Detected</h3>
                    <div className="space-y-4">
                        {suspicious.posts.map(post => renderPostItem(post, true))}
                        {suspicious.messages.map(msg => (
                            <div key={msg.id} className="activity-item" style={{ borderLeft: '3px solid #f59e0b' }}>
                                <div style={{ width: '100%' }}>
                                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                                        {msg.sender?.displayName || 'Unknown'} <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>(Flagged Message)</span>
                                    </p>
                                    <p style={{ color: 'white', fontSize: '0.9rem' }}>{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="activity-grid">
                <div className="activity-card">
                    <h3 className="section-title">Recent Posts</h3>
                    <div className="space-y-4">
                        {activity.posts.map(post => renderPostItem(post))}
                        {activity.posts.length === 0 && <p style={{ color: '#6b7280' }}>No recent posts.</p>}
                    </div>
                </div>
                <div className="activity-card">
                    <h3 className="section-title">Recent Messages</h3>
                    <div className="space-y-4">
                        {activity.messages.map(msg => (
                            <div key={msg.id} className="activity-item">
                                <div style={{ width: '100%' }}>
                                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{msg.sender?.displayName || 'Unknown'}</p>
                                    <p style={{ color: 'white', fontSize: '0.9rem' }}>{msg.content?.substring(0, 50)}...</p>
                                </div>
                            </div>
                        ))}
                        {activity.messages.length === 0 && <p style={{ color: '#6b7280' }}>No recent messages.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
