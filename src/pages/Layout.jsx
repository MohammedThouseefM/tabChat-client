
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaEnvelope, FaSignOutAlt, FaUser, FaBell } from 'react-icons/fa';
import Avatar from '../components/Avatar';

const Layout = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Avatar src={user.avatar} name={user.displayName} size="50px" />
                    <span style={{ fontWeight: '600' }}>{user.displayName}</span>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/feed" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FaHome /> <span>Feed</span>
                    </NavLink>
                    <NavLink to="/messages" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FaEnvelope /> <span>Messages</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FaUser /> <span>Profile</span>
                    </NavLink>
                    <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FaBell /> <span>Notifications</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={logout}
                        className="sidebar-nav"
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        <FaSignOutAlt /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
