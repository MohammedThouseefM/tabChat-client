import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();

    if (!user || user.role !== 'admin') {
        return <Navigate to="/useradmin43176" replace />;
    }

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    Admin Control
                </div>
                <nav className="admin-nav">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        User Management
                    </NavLink>
                    <button
                        onClick={logout}
                        className="admin-logout-btn"
                    >
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
