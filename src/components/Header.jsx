import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { FaSearch, FaBell } from 'react-icons/fa';
import API from '../api';
import SearchDropdown from './SearchDropdown';

const Header = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Search State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], posts: [] });
    const [history, setHistory] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const dropdownRef = useRef(null);

    // Notifications Link (could be dropdown later)
    const handleNotificationClick = () => {
        navigate('/notifications');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch History on focus
    const handleFocus = async () => {
        if (!query) {
            try {
                const { data } = await API.get('/search/history');
                setHistory(data);
                setIsSearching(false);
            } catch (err) {
                console.error(err);
            }
        }
        setShowDropdown(true);
    };

    // Search Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim()) {
                setIsSearching(true);
                try {
                    const { data } = await API.get(`/search?q=${query}`);
                    setResults(data);
                } catch (err) {
                    console.error(err);
                }
            } else {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // History Actions
    const handleSelectHistory = (q) => {
        setQuery(q);
        setIsSearching(true); // Trigger search
    };

    const handleClearHistory = async () => {
        try {
            await API.delete('/search/history');
            setHistory([]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteHistoryItem = async (id) => {
        try {
            await API.delete(`/search/history/${id}`);
            setHistory(history.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header className="app-header">
            <div className="header-brand" onClick={() => navigate('/feed')} style={{ cursor: 'pointer' }}>
                <img src="/logo.png" alt="Tap To Connect Logo" className="header-logo" />
                <h1 className="hidden-mobile">Tap To Connect</h1>
            </div>

            {user && (
                <>
                    {/* Search Bar */}
                    <div className="header-search-container" ref={dropdownRef}>
                        <div className="search-input-wrapper">
                            <FaSearch className="text-secondary" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search users, posts..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={handleFocus}
                            />
                        </div>
                        {showDropdown && (
                            <SearchDropdown
                                results={results}
                                history={history}
                                isSearching={isSearching}
                                onSelectHistory={handleSelectHistory}
                                onClearHistory={handleClearHistory}
                                onDeleteHistoryItem={handleDeleteHistoryItem}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={handleNotificationClick} className="btn-icon btn-icon-badge" title="Notifications">
                            <FaBell />
                            {/* Optional: Add badge count here if API supports it */}
                        </button>

                        <div className="header-profile" onClick={() => navigate('/profile')}>
                            <Avatar src={user.avatar} name={user.displayName} size="40px" />
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default Header;
