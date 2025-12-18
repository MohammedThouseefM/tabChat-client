import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Avatar from '../components/Avatar';
import { FaSearch, FaHistory, FaTimes, FaUser, FaNewspaper, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Search = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], posts: [], messages: [] });
    const [history, setHistory] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'users', 'posts', 'messages'

    // Fetch History on mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await API.get('/search/history');
                setHistory(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, []);

    // Search Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim()) {
                setIsSearching(true);
                setLoading(true);
                try {
                    const { data } = await API.get(`/search?q=${query}`);
                    // Ensure all fields exist
                    setResults({
                        users: data.users || [],
                        posts: data.posts || [],
                        messages: data.messages || []
                    });
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else {
                setIsSearching(false);
                setResults({ users: [], posts: [], messages: [] });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // History Actions
    const handleSelectHistory = (q) => {
        setQuery(q);
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

    // Helper to determine if we should show a section
    const showSection = (param) => {
        if (activeTab === 'all') return true;
        return activeTab === param;
    };

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'users', label: 'People', icon: <FaUser /> },
        { id: 'posts', label: 'Posts', icon: <FaNewspaper /> },
        { id: 'messages', label: 'Messages', icon: <FaEnvelope /> },
    ];

    const hasResults = results.users.length > 0 || results.posts.length > 0 || results.messages.length > 0;

    return (
        <div style={{ padding: '1rem', maxWidth: '56rem', margin: '0 auto', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Search</h2>

            {/* Search Input */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-color)', zIndex: 10, paddingBottom: '1rem' }}>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'var(--input-bg)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1rem',
                        border: '1px solid transparent',
                        transition: 'all 0.2s',
                    }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
                        <FaSearch style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }} />
                        <input
                            type="text"
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: 'var(--text-primary)',
                                width: '100%',
                                marginLeft: '0.75rem',
                                fontSize: '1.125rem'
                            }}
                            placeholder="Search users, posts, messages..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                {isSearching && (
                    <div className="no-scrollbar" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'background-color 0.2s',
                                    backgroundColor: activeTab === tab.id ? 'var(--accent-color)' : 'var(--card-bg)',
                                    color: activeTab === tab.id ? 'white' : 'var(--text-secondary)'
                                }}
                            >
                                {tab.icon && <span>{tab.icon}</span>}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                    <div style={{
                        display: 'inline-block',
                        width: '1.5rem',
                        height: '1.5rem',
                        border: '2px solid var(--text-secondary)',
                        borderTopColor: 'var(--accent-color)',
                        borderRadius: '50%',
                        marginBottom: '0.5rem',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    <p>Searching...</p>
                </div>
            ) : isSearching ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Users Results */}
                    {showSection('users') && results.users.length > 0 && (
                        <div>
                            {activeTab === 'all' && <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>People</h3>}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                {results.users.map(u => (
                                    <div
                                        key={u.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            backgroundColor: 'var(--card-bg)',
                                            cursor: 'pointer',
                                            border: '1px solid transparent',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onClick={() => navigate(`/users/${u.id}`)}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                    >
                                        <Avatar src={u.avatar} name={u.displayName} size="48px" />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 500, fontSize: '1.125rem', color: 'var(--text-primary)' }}>{u.displayName}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>@{u.displayName.toLowerCase().replace(/\s+/g, '')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posts Results */}
                    {showSection('posts') && results.posts.length > 0 && (
                        <div>
                            {activeTab === 'all' && <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Posts</h3>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {results.posts.map(post => (
                                    <div
                                        key={post.id}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            backgroundColor: 'var(--card-bg)',
                                            border: '1px solid var(--border-color)',
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onClick={() => navigate(`/feed`)}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <Avatar src={post.User.avatar} name={post.User.displayName} size="32px" />
                                            <div>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', lineHeight: 1.25 }}>{post.User.displayName}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages Results */}
                    {showSection('messages') && results.messages.length > 0 && (
                        <div>
                            {activeTab === 'all' && <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Messages</h3>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {results.messages.map(msg => {
                                    const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;
                                    return (
                                        <div
                                            key={msg.id}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '0.75rem',
                                                backgroundColor: 'var(--card-bg)',
                                                border: '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                transition: 'border-color 0.2s'
                                            }}
                                            onClick={() => navigate(`/messages/${otherUser?.id}`)}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                {otherUser && <Avatar src={otherUser.avatar} name={otherUser.displayName} size="32px" />}
                                                <div>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', lineHeight: 1.25 }}>
                                                        {msg.senderId === user.id ? `To: ${otherUser?.displayName}` : `From: ${otherUser?.displayName}`}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {msg.senderId === user.id && <span style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginRight: '0.25rem' }}>You:</span>}
                                                {msg.content}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!hasResults && (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                            <FaSearch style={{ fontSize: '2.25rem', margin: '0 auto 1rem auto', opacity: 0.3 }} />
                            <p style={{ fontSize: '1.125rem' }}>No results found for "{query}"</p>
                            <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Try searching for something else</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Search History */
                <div>
                    {history.length > 0 && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.25rem' }}>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Recent Searches</h3>
                                <button
                                    onClick={handleClearHistory}
                                    style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--error-color)', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Clear All
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {history.map(item => (
                                    <div
                                        key={item.id}
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: 'transparent' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                            e.currentTarget.querySelector('.delete-btn').style.opacity = '1';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.querySelector('.delete-btn').style.opacity = '0';
                                        }}
                                    >
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}
                                            onClick={() => handleSelectHistory(item.query)}
                                        >
                                            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FaHistory style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }} />
                                            </div>
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.query}</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteHistoryItem(item.id); }}
                                            className="delete-btn"
                                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0, transition: 'opacity 0.2s', padding: '0.5rem', cursor: 'pointer' }}
                                            title="Remove from history"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {history.length === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', color: 'var(--text-secondary)', opacity: 0.5 }}>
                            <FaSearch style={{ fontSize: '3.75rem', marginBottom: '1.5rem' }} />
                            <p style={{ fontSize: '1.25rem', fontWeight: 500 }}>Search for anything</p>
                            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Find people, posts, and messages</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
