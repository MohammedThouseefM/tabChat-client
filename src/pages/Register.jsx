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
        <div className="auth-page">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p className="text-center font-normal mb-8" style={{ color: 'var(--text-secondary)' }}>Join the community today</p>

                {error && <div className="alert alert-error w-full mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="label">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your name"
                        />
                    </div>
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
                            placeholder="Create a password"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="label">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your password"
                        />
                    </div>
                    <button type="submit">
                        Sign Up
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
                    <FaGoogle /> Sign up with Google
                </button>

                <div className="auth-link">
                    Already have an account? <a href="/">Log in</a>
                </div>
            </div>
        </div>
    );
};

export default Register;
