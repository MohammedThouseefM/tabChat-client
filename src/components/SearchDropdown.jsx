import React from 'react';
import { FaHistory, FaTimes, FaSearch, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

const SearchDropdown = ({
    results,
    history,
    isSearching,
    onSelectHistory,
    onClearHistory,
    onDeleteHistoryItem
}) => {
    const navigate = useNavigate();

    if (isSearching) {
        // Show Search Results
        const hasResults = results.users.length > 0 || results.posts.length > 0;

        if (!hasResults) {
            return (
                <div className="search-dropdown">
                    <div className="p-4 text-center text-secondary">
                        No results found.
                    </div>
                </div>
            );
        }

        return (
            <div className="search-dropdown">
                {results.users.length > 0 && (
                    <div className="search-section">
                        <h4 className="search-section-title">Users</h4>
                        {results.users.map(user => (
                            <div
                                key={user.id}
                                className="search-item"
                                onClick={() => navigate(`/users/${user.id}`)}
                            >
                                <Avatar src={user.avatar} name={user.displayName} size="32px" />
                                <span className="ml-2 font-medium">{user.displayName}</span>
                            </div>
                        ))}
                    </div>
                )}

                {results.posts.length > 0 && (
                    <div className="search-section">
                        <h4 className="search-section-title">Posts</h4>
                        {results.posts.map(post => (
                            <div
                                key={post.id}
                                className="search-item"
                                onClick={() => navigate(`/feed`)} // Ideally anchor to post, but feed is fine
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar src={post.User.avatar} name={post.User.displayName} size="24px" />
                                    <span className="text-sm truncate">{post.content}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Show History
    if (history.length === 0) return null;

    return (
        <div className="search-dropdown">
            <div className="flex justify-between items-center p-2 px-3 border-b border-border">
                <span className="text-xs font-bold text-secondary uppercase">Recent</span>
                <button
                    onClick={onClearHistory}
                    className="text-xs text-accent hover:text-accent-hover"
                >
                    Clear All
                </button>
            </div>
            {history.map(item => (
                <div key={item.id} className="search-item group justify-between">
                    <div
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                        onClick={() => onSelectHistory(item.query)}
                    >
                        <FaHistory className="text-secondary text-sm" />
                        <span>{item.query}</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteHistoryItem(item.id); }}
                        className="text-secondary hover:text-error opacity-0 group-hover:opacity-100 p-1"
                    >
                        <FaTimes size={12} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default SearchDropdown;
