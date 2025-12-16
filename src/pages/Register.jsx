import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const Register = () => {
    const { user, login, registerWithEmail, loading } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && !loading) {
            navigate('/feed');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        const res = await registerWithEmail(name, email, password);
        if (!res.success) {
            setError(res.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex items-center justify-center" style={{ height: '100vh' }}>
            <div className="card auth-card flex flex-col items-center">
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Create Account</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join the community today</p>

                {error && <div className="alert alert-error w-full">{error}</div>}

                <form onSubmit={handleSubmit} className="w-full mb-4">
                    <div className="form-group">
                        <label className="label">Display Name</label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your name"
                        />
                    </div>
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
                            placeholder="Create a password"
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Confirm Password</label>
                        <input
                            type="password"
                            className="input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your password"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">
                        Sign Up
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
                    <FaGoogle /> Sign up with Google
                </button>

                <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <a href="/login" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Log in</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
