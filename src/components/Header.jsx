import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { FaBell } from 'react-icons/fa';

const Header = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Notifications Link
    const handleNotificationClick = () => {
        navigate('/notifications');
    };

    return (
        <header className="app-header">
            <div className="header-brand" onClick={() => navigate('/feed')} style={{ cursor: 'pointer' }}>
                <img src="/logo.png" alt="Tap To Connect Logo" className="header-logo" />
                <h1 className="hidden-mobile">Tap To Connect</h1>
            </div>

            {user && (
                <div className="flex items-center gap-4 ml-auto">
                    <button onClick={handleNotificationClick} className="btn-icon btn-icon-badge" title="Notifications">
                        <FaBell />
                        {/* Optional: Add badge count here */}
                    </button>

                    <div className="header-profile" onClick={() => navigate('/profile')}>
                        <Avatar src={user.avatar} name={user.displayName} size="40px" />
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
