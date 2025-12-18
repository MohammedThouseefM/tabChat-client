import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginAsAdmin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await loginAsAdmin(email, password);
        if (res.success) {
            navigate('/admin/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="admin-login-wrapper">
            <div className="admin-card">
                <h2 className="admin-title" style={{ textAlign: 'center', color: '#dc2626' }}>Admin Panel</h2>
                {error && <div className="p-2 mb-4 text-red-400 bg-red-900/20 border border-red-500 rounded text-center">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="admin-form-group">
                        <label className="admin-label">Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="admin-input"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="admin-input"
                        />
                    </div>
                    <button type="submit" className="admin-btn">
                        Access Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
