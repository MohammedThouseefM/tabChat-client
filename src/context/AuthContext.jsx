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
        const baseURL = import.meta.env.VITE_API_URL || 'https://server-kyf8.onrender.com';
        window.location.href = new URL('/auth/google', baseURL).toString();
    };

    const loginWithEmail = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const registerWithEmail = async (displayName, email, password) => {
        try {
            const { data } = await API.post('/auth/register', { displayName, email, password });
            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        const baseURL = import.meta.env.VITE_API_URL || 'https://server-kyf8.onrender.com';
        window.location.href = new URL('/auth/logout', baseURL).toString();
    };

    const value = {
        user,
        loading,
        login,
        loginWithEmail,
        registerWithEmail,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
