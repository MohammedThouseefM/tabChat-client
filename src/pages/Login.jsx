import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
    const { user, login, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && !loading) {
            navigate('/feed');
        }
    }, [user, loading, navigate]);

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Sign in to connect with friends</p>

                <button
                    onClick={login}
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    <FaGoogle /> Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
