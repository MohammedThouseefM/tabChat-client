import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await API.get('/users/me');
                setUser(data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const login = () => {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.location.href = `${baseURL}/auth/google`;
    };

    const logout = () => {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.location.href = `${baseURL}/auth/logout`;
    };

    const value = {
        user,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
