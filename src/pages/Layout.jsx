
import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaEnvelope, FaSignOutAlt, FaUser, FaBell, FaPlusSquare } from 'react-icons/fa';
import Avatar from '../components/Avatar';
import Header from '../components/Header';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const isMessagesPage = location.pathname.startsWith('/messages');

    if (!user) return null;

    return (
        <div className="app-layout">
            <Header />
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Avatar src={user.avatar} name={user.displayName} size="50px" />
                    <span style={{ fontWeight: '600' }}>{user.displayName}</span>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/feed" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FaHome /> <span>Feed</span>
                    </NavLink>
                    <NavLink to="/create-post" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FaPlusSquare /> <span>Add Post</span>
                    </NavLink>
                    <NavLink to="/messages" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FaEnvelope /> <span>Messages</span>
                    </NavLink>
                    <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FaBell /> <span>Notifications</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FaUser /> <span>Profile</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={logout}
                        className="sidebar-nav-item btn-ghost w-full justify-start"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem',
                            color: 'var(--text-secondary)',
                            fontSize: '1rem'
                        }}
                    >
                        <FaSignOutAlt /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className={`main-content ${isMessagesPage ? 'no-padding' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
