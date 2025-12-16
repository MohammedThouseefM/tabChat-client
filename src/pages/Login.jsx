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
        <div className="flex items-center justify-center" style={{ height: '100vh' }}>
            <div className="card auth-card flex flex-col items-center">
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Sign in to connect with friends</p>

                {error && <div className="alert alert-error w-full">{error}</div>}

                <form onSubmit={handleSubmit} className="w-full mb-4">
                    <div className="form-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">
                        Log In
                    </button>
                </form>

                <div className="flex items-center w-full my-4" style={{ margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
                    <span style={{ padding: '0 10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>OR</span>
                    <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
                </div>

                <button
                    onClick={login}
                    className="btn btn-secondary w-full"
                >
                    <FaGoogle /> Sign in with Google
                </button>

                <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <a href="/register" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
