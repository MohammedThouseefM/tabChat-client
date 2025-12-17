import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const Header = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="app-header">
            <div className="header-brand">
                <img src="/logo.png" alt="Tap To Connect Logo" className="header-logo" />
                <h1>Tap To Connect</h1>
            </div>
            {user && (
                <div className="header-profile" onClick={() => navigate('/profile')}>
                    <Avatar src={user.avatar} name={user.displayName} size="40px" />
                </div>
            )}
        </header>
    );
};

export default Header;
