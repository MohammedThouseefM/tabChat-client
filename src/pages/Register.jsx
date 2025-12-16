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
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Create Account</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join the community today</p>

                {error && <div className="alert alert-error" style={{ marginBottom: '1rem', color: 'red' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Display Name</label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
                        <input
                            type="password"
                            className="input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Sign Up
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
                    <span style={{ padding: '0 10px', color: 'var(--text-secondary)' }}>OR</span>
                    <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
                </div>

                <button
                    onClick={login}
                    className="btn btn-secondary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <FaGoogle /> Sign up with Google
                </button>

                <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <a href="/login" style={{ color: 'var(--primary-color)' }}>Log in</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
