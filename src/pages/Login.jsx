import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
    const { user, login, loginWithEmail, loading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && !loading) {
            navigate('/feed');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await loginWithEmail(email, password);
        if (!res.success) {
            setError(res.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="text-center font-normal mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to connect with friends</p>

                {error && <div className="alert alert-error w-full mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    <button type="submit">
                        Log In
                    </button>
                </form>

                <div className="flex items-center w-full my-6">
                    <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
                    <span style={{ padding: '0 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>OR</span>
                    <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
                </div>

                <button
                    onClick={login}
                    className="btn btn-secondary w-full flex justify-center items-center gap-2"
                >
                    <FaGoogle /> Sign in with Google
                </button>

                <div className="auth-link">
                    Don't have an account? <a href="/register">Sign up</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
