import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            // 1. Check if token in URL (Google Login Redirect)
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (token) {
                // If token layout issues, we might need to fetch user details first using the token
                // But for now let's assume we fetch /users/me to get details
                localStorage.setItem('user', JSON.stringify({ token }));

                // Remove token from URL for clean history
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            // 2. Check localStorage
            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (storedUser && storedUser.token) {
                try {
                    const { data } = await API.get('/users/me');
                    // data contains user info. Merge with token.
                    const fullUser = { ...data, token: storedUser.token };
                    setUser(fullUser);
                    localStorage.setItem('user', JSON.stringify(fullUser)); // Update storage with full details
                } catch (err) {
                    console.error("Token invalid or expired", err);
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        checkUser();
    }, []);

    const login = () => {
        const baseURL = import.meta.env.VITE_API_URL || 'https://server-kyf8.onrender.com';
        window.location.href = new URL('/auth/google', baseURL).toString();
    };

    const loginWithEmail = async (email, password) => {
        try {
            const baseURL = import.meta.env.VITE_API_URL || 'https://server-kyf8.onrender.com';
            const { data } = await API.post('/auth/login', { email, password }, { baseURL });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const registerWithEmail = async (displayName, email, password) => {
        try {
            const baseURL = import.meta.env.VITE_API_URL || 'https://server-kyf8.onrender.com';
            const { data } = await API.post('/auth/register', { displayName, email, password }, { baseURL });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
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
