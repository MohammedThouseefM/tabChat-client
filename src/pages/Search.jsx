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
        <div className="p-4 max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl font-bold mb-6">Search</h2>

            {/* Search Input */}
            <div className="sticky top-0 bg-[var(--bg-color)] z-10 pb-4">
                <div className="relative mb-4">
                    <div className="flex items-center bg-[var(--input-bg)] rounded-xl px-4 py-3 border border-transparent focus-within:border-[var(--accent-color)] transition-all">
                        <FaSearch className="text-[var(--text-secondary)] text-lg" />
                        <input
                            type="text"
                            className="bg-transparent border-none outline-none text-[var(--text-primary)] w-full ml-3 text-lg placeholder-[var(--text-secondary)]"
                            placeholder="Search users, posts, messages..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                {isSearching && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                                    ${activeTab === tab.id
                                        ? 'bg-[var(--accent-color)] text-white'
                                        : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)]'
                                    }`}
                            >
                                {tab.icon && <span>{tab.icon}</span>}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12 text-[var(--text-secondary)]">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-[var(--text-secondary)] border-t-[var(--accent-color)] rounded-full mb-2"></div>
                    <p>Searching...</p>
                </div>
            ) : isSearching ? (
                <div className="space-y-8">
                    {/* Users Results */}
                    {showSection('users') && results.users.length > 0 && (
                        <div>
                            {activeTab === 'all' && <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase mb-3 px-1">People</h3>}
                            <div className="grid grid-cols-1 gap-2">
                                {results.users.map(u => (
                                    <div
                                        key={u.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card-bg)] hover:bg-[rgba(255,255,255,0.05)] cursor-pointer transition-colors border border-transparent hover:border-[var(--border-color)]"
                                        onClick={() => navigate(`/users/${u.id}`)}
                                    >
                                        <Avatar src={u.avatar} name={u.displayName} size="48px" />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-lg text-[var(--text-primary)]">{u.displayName}</span>
                                            <span className="text-sm text-[var(--text-secondary)]">@{u.displayName.toLowerCase().replace(/\s+/g, '')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posts Results */}
                    {showSection('posts') && results.posts.length > 0 && (
                        <div>
                            {activeTab === 'all' && <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase mb-3 px-1">Posts</h3>}
                            <div className="space-y-4">
                                {results.posts.map(post => (
                                    <div
                                        key={post.id}
                                        className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-color)] transition-colors"
                                        onClick={() => navigate(`/feed`)} // Ideally scrollTo post, but simplified for now
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Avatar src={post.User.avatar} name={post.User.displayName} size="32px" />
                                            <div>
                                                <span className="font-semibold text-[var(--text-primary)] block leading-tight">{post.User.displayName}</span>
                                                <span className="text-xs text-[var(--text-secondary)]">{new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <p className="text-[var(--text-primary)] line-clamp-3">{post.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages Results */}
                    {showSection('messages') && results.messages.length > 0 && (
                        <div>
                            {activeTab === 'all' && <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase mb-3 px-1">Messages</h3>}
                            <div className="space-y-4">
                                {results.messages.map(msg => {
                                    const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;
                                    return (
                                        <div
                                            key={msg.id}
                                            className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-color)] transition-colors"
                                            onClick={() => navigate(`/messages/${otherUser?.id}`)}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                {otherUser && <Avatar src={otherUser.avatar} name={otherUser.displayName} size="32px" />}
                                                <div>
                                                    <span className="font-semibold text-[var(--text-primary)] block leading-tight">
                                                        {msg.senderId === user.id ? `To: ${otherUser?.displayName}` : `From: ${otherUser?.displayName}`}
                                                    </span>
                                                    <span className="text-xs text-[var(--text-secondary)]">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <p className="text-[var(--text-secondary)] text-sm line-clamp-2">
                                                {msg.senderId === user.id && <span className="font-bold text-[var(--accent-color)] mr-1">You:</span>}
                                                {msg.content}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {!hasResults && (
                        <div className="text-center py-12 text-[var(--text-secondary)]">
                            <FaSearch className="mx-auto text-4xl mb-4 opacity-30" />
                            <p className="text-lg">No results found for "{query}"</p>
                            <p className="text-sm opacity-70">Try searching for something else</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Search History */
                <div>
                    {history.length > 0 && (
                        <>
                            <div className="flex justify-between items-center mb-4 px-1">
                                <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Recent Searches</h3>
                                <button
                                    onClick={handleClearHistory}
                                    className="text-xs text-[var(--error-color)] hover:underline"
                                >
                                    Clear All
                                </button>
                            </div>
                            <div className="space-y-1">
                                {history.map(item => (
                                    <div key={item.id} className="group flex justify-between items-center p-3 rounded-xl hover:bg-[rgba(255,255,255,0.05)] cursor-pointer transition-colors">
                                        <div
                                            className="flex items-center gap-3 flex-1"
                                            onClick={() => handleSelectHistory(item.query)}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                                                <FaHistory className="text-[var(--text-secondary)] text-sm" />
                                            </div>
                                            <span className="text-[var(--text-primary)] font-medium">{item.query}</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteHistoryItem(item.id); }}
                                            className="text-[var(--text-secondary)] hover:text-[var(--error-color)] opacity-0 group-hover:opacity-100 transition-opacity p-2"
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
                        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)] opacity-50">
                            <FaSearch className="text-6xl mb-6" />
                            <p className="text-xl font-medium">Search for anything</p>
                            <p className="text-sm mt-2">Find people, posts, and messages</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
