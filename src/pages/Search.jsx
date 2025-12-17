import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Avatar from '../components/Avatar';
import { FaSearch, FaHistory, FaTimes } from 'react-icons/fa';

const Search = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], posts: [] });
    const [history, setHistory] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(false);

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
                    setResults(data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else {
                setIsSearching(false);
                setResults({ users: [], posts: [] });
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

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Search</h2>

            <div className="relative mb-8">
                <div className="flex items-center bg-[var(--input-bg)] rounded-xl px-4 py-3 border border-transparent focus-within:border-[var(--accent-color)] transition-all">
                    <FaSearch className="text-[var(--text-secondary)] text-lg" />
                    <input
                        type="text"
                        className="bg-transparent border-none outline-none text-[var(--text-primary)] w-full ml-3 text-lg"
                        placeholder="Search users, posts..."
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

            {loading ? (
                <div className="text-center py-8 text-[var(--text-secondary)]">Searching...</div>
            ) : isSearching ? (
                <div className="space-y-6">
                    {/* Users Results */}
                    {results.users.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase mb-3">Users</h3>
                            <div className="space-y-2">
                                {results.users.map(user => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgba(255,255,255,0.05)] cursor-pointer transition-colors"
                                        onClick={() => navigate(`/users/${user.id}`)}
                                    >
                                        <Avatar src={user.avatar} name={user.displayName} size="40px" />
                                        <span className="font-medium text-lg">{user.displayName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posts Results */}
                    {results.posts.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase mb-3">Posts</h3>
                            <div className="space-y-3">
                                {results.posts.map(post => (
                                    <div
                                        key={post.id}
                                        className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-color)] transition-colors"
                                        onClick={() => navigate(`/feed`)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Avatar src={post.User.avatar} name={post.User.displayName} size="24px" />
                                            <span className="font-semibold">{post.User.displayName}</span>
                                        </div>
                                        <p className="text-[var(--text-secondary)]">{post.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.users.length === 0 && results.posts.length === 0 && (
                        <div className="text-center py-8 text-[var(--text-secondary)]">
                            No results found for "{query}"
                        </div>
                    )}
                </div>
            ) : (
                /* Search History */
                <div>
                    {history.length > 0 && (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Recent</h3>
                                <button
                                    onClick={handleClearHistory}
                                    className="text-xs text-[var(--error-color)] hover:underline"
                                >
                                    Clear History
                                </button>
                            </div>
                            <div className="space-y-1">
                                {history.map(item => (
                                    <div key={item.id} className="group flex justify-between items-center p-3 rounded-lg hover:bg-[rgba(255,255,255,0.05)] cursor-pointer transition-colors">
                                        <div
                                            className="flex items-center gap-3 flex-1"
                                            onClick={() => handleSelectHistory(item.query)}
                                        >
                                            <FaHistory className="text-[var(--text-secondary)]" />
                                            <span className="text-[var(--text-primary)]">{item.query}</span>
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
                        <div className="text-center py-12 text-[var(--text-secondary)] opacity-50">
                            <FaSearch className="mx-auto text-4xl mb-4" />
                            <p>Search for people and posts</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
