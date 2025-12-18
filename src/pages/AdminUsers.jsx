import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (userId) => {
        try {
            const { data } = await API.put(`/api/admin/users/${userId}/suspend`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setUsers(users.map(u => u.id === userId ? { ...u, isSuspended: data.isSuspended } : u));
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await API.delete(`/api/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setUsers(users.filter(u => u.id !== userId));
            } catch (err) {
                alert('Failed to delete user');
                console.error(err);
            }
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading users...</div>;

    return (
        <div>
            <h1 className="admin-title">User Management</h1>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>
                                    <div className="user-cell">
                                        <img src={u.avatar} alt="" className="user-avatar-sm" />
                                        <Link to={`/admin/users/${u.id}`} className="user-name hover:underline">
                                            {u.displayName}
                                        </Link>
                                    </div>
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                                            {u.role}
                                        </span>
                                        {u.isSuspended && <span className="role-badge" style={{ backgroundColor: '#78350f', color: '#fcd34d' }}>Suspended</span>}
                                    </div>
                                </td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td style={{ textAlign: 'right' }}>
                                    {u.role !== 'admin' && (
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
