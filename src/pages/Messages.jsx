import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaGlobe, FaList, FaBolt, FaExclamationTriangle, FaMagic } from 'react-icons/fa';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';

const Messages = () => {
    const { user: currentUser } = useAuth();

    // New State for Split View
    const [chats, setChats] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // AI States
    const [smartReplies, setSmartReplies] = useState([]);
    const [summary, setSummary] = useState('');
    const [showSummary, setShowSummary] = useState(false);
    const [translatingMsgId, setTranslatingMsgId] = useState(null);
    const [aiProcessing, setAiProcessing] = useState(false);

    const [showMobileChat, setShowMobileChat] = useState(false);

    // Fetch Chats and Suggestions
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch active conversations
                const chatsRes = await API.get('/messages/conversations');
                setChats(chatsRes.data);

                // Fetch suggestions
                const suggestionsRes = await API.get('/users/suggestions');
                setSuggestions(suggestionsRes.data);
            } catch (err) {
                console.error("Failed to load messages data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Poll for new chats/updates every 10s
        const interval = setInterval(async () => {
            try {
                const chatsRes = await API.get('/messages/conversations');
                setChats(chatsRes.data);
            } catch (err) {
                // Silent fail for polling
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Fetch Messages & Smart Replies when user is selected
    useEffect(() => {
        if (!selectedUser) return;

        // Reset states when switching user
        setSummary('');
        setShowSummary(false);
        setSmartReplies([]);
        setShowMobileChat(true); // Show chat on mobile when user is selected

        // Mark as read immediately
        API.put(`/api/messages/read/${selectedUser.id}`).catch(err => console.error("Failed to mark read", err));

        // Optimistically update unread count in chat list
        setChats(prev => prev.map(c =>
            c.user.id === selectedUser.id ? { ...c, unreadCount: 0 } : c
        ));

        const fetchMessages = async () => {
            try {
                const { data } = await API.get(`/messages/${selectedUser.id}`);
                setMessages(data);
                scrollToBottom();

                // Fetch Smart Replies if last message is from other user
                if (data.length > 0 && data[data.length - 1].senderId !== currentUser.id) {
                    loadSmartReplies(data);
                } else {
                    setSmartReplies([]);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [selectedUser]);

    const loadSmartReplies = async (msgs) => {
        // Prepare context: last 5 messages
        const recentHistory = msgs.slice(-5).map(m => ({
            sender: m.senderId === currentUser.id ? 'Me' : 'Them',
            content: m.content
        }));

        try {
            const { data } = await API.post('/ai/replies', { history: recentHistory });
            setSmartReplies(data.result);
        } catch (err) {
            console.error("Smart Reply Error", err);
        }
    };

    const handleSummarize = async () => {
        if (!messages.length) return;
        setAiProcessing(true);
        try {
            const recentHistory = messages.map(m => ({
                sender: m.senderId === currentUser.id ? 'Me' : selectedUser.displayName,
                content: m.content
            }));
            const { data } = await API.post('/ai/summary', { history: recentHistory });
            setSummary(data.result);
            setShowSummary(true);
        } catch (err) {
            alert('Failed to summarize chat');
        } finally {
            setAiProcessing(false);
        }
    };

    const handleTranslate = async (msg) => {
        if (msg.translated) {
            // Toggle back (local mutation for UI simplicity)
            const updated = messages.map(m => m.id === msg.id ? { ...m, content: m.originalContent, translated: false } : m);
            setMessages(updated);
            return;
        }

        setTranslatingMsgId(msg.id);
        try {
            const { data } = await API.post('/ai/translate', { content: msg.content, targetLang: 'English' });

            const updated = messages.map(m =>
                m.id === msg.id ? {
                    ...m,
                    content: data.result,
                    originalContent: m.content,
                    translated: true
                } : m
            );
            setMessages(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setTranslatingMsgId(null);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const [isSending, setIsSending] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || isSending) return;

        setIsSending(true);

        // Tone Check Analysis
        if (newMessage.length > 5) {
            try {
                // Optional: You could show a specialized "Checking tone..." UI here
                const { data } = await API.post('/ai/tone', { content: newMessage });
                if (data.risk) {
                    if (!window.confirm(`⚠️ Tone Check: Your message sounds "${data.tone}". Are you sure you want to send it?`)) {
                        setIsSending(false);
                        return;
                    }
                }
            } catch (err) {
                console.warn("Tone check skipped:", err);
            }
        }

        try {
            const { data } = await API.post(`/messages/${selectedUser.id}`, { content: newMessage });
            setMessages([...messages, data]);
            setNewMessage('');
            setSmartReplies([]);
            scrollToBottom();

            // Refresh conversation list to show latest message or move new chat to top
            try {
                const chatsRes = await API.get('/messages/conversations');
                setChats(chatsRes.data);
                const suggestionsRes = await API.get('/users/suggestions');
                setSuggestions(suggestionsRes.data);
            } catch (e) {
                // Ignore refresh errors
            }
        } catch (err) {
            console.error(err);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    // Helper to format time
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <Loader fullScreen={false} />;
    }

    return (
        <div className={`messages-container ${showMobileChat ? 'messages-mobile-view-chat' : 'messages-mobile-view-list'}`}>
            {/* Users List Sidebar */}
            <div className="messages-list">
                <div className="p-4 border-b border-[var(--border-color)]">
                    <h3 className="font-bold text-lg">Messages</h3>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {/* Active Chats Section */}
                    {chats.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 px-2">
                                Chats
                            </h4>
                            <div className="flex flex-col gap-1">
                                {chats.map((chat) => (
                                    <div
                                        key={chat.user.id}
                                        onClick={() => setSelectedUser(chat.user)}
                                        className={`user-list-item ${selectedUser?.id === chat.user.id ? 'active' : ''} ${chat.unreadCount > 0 ? 'bg-gray-800/50' : ''}`}
                                        style={chat.unreadCount > 0 ? { borderLeft: '4px solid var(--accent-color)', backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
                                    >
                                        <div className="relative">
                                            <Avatar src={chat.user.avatar} name={chat.user.displayName} />
                                            {/* Online Status (Mock) */}
                                            {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div> */}
                                        </div>
                                        <div className="user-info" style={{ flex: 1 }}>
                                            <div className="top-row">
                                                <h4
                                                    title={chat.user.displayName}
                                                    className={chat.unreadCount > 0 ? 'font-bold text-white' : ''}
                                                >
                                                    {chat.user.displayName}
                                                </h4>
                                                {chat.lastMessage && (
                                                    <span className={`time ${chat.unreadCount > 0 ? 'text-green-400 font-bold' : ''}`}>
                                                        {formatTime(chat.lastMessage.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                {chat.lastMessage && (
                                                    <p
                                                        title={chat.lastMessage.content}
                                                        className={chat.unreadCount > 0 ? 'font-bold text-gray-200' : 'text-gray-400'}
                                                    >
                                                        {chat.lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                                                        {chat.lastMessage.content}
                                                    </p>
                                                )}
                                                {chat.unreadCount > 0 && (
                                                    <span className="ml-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggested Users Section */}
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 px-2">
                            Suggested
                        </h4>
                        {suggestions.length > 0 ? (
                            <div className="flex flex-col gap-1">
                                {suggestions.map((u) => (
                                    <div
                                        key={u.id}
                                        onClick={() => setSelectedUser(u)}
                                        className={`user-list-item ${selectedUser?.id === u.id ? 'active' : ''}`}
                                    >
                                        <Avatar src={u.avatar} name={u.displayName} />
                                        <div className="user-info">
                                            <h4 title={u.displayName}>{u.displayName}</h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                New • Tap to chat
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)] px-2">No new suggestions.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="chat-header">
                            <div className="flex items-center gap-4">
                                <button className="btn-icon md:hidden hidden-desktop" onClick={() => setShowMobileChat(false)}>
                                    Back
                                </button>
                                <Avatar src={selectedUser.avatar} name={selectedUser.displayName} />
                                <h3>{selectedUser.displayName}</h3>
                            </div>
                            <button
                                onClick={handleSummarize}
                                disabled={aiProcessing}
                                className="btn btn-ghost"
                                style={{ border: '1px solid var(--border-color)' }}
                                title={aiProcessing ? 'Summarizing...' : 'Summarize Chat'}
                            >
                                <FaList /> <span className="hidden-mobile">{aiProcessing ? 'Summarizing...' : 'Summarize Chat'}</span>
                            </button>
                        </div>

                        {/* Summary Modal (Inline) */}
                        {showSummary && (
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', margin: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h4 style={{ color: 'var(--accent-color)', margin: 0 }}>Chat Summary</h4>
                                    <button onClick={() => setShowSummary(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
                                </div>
                                <p style={{ whiteSpace: 'pre-line', fontSize: '0.9rem' }}>{summary}</p>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="chat-messages-area">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`message-bubble ${isMe ? 'me' : 'them'} group`}
                                    >
                                        {msg.content}

                                        {!isMe && (
                                            <button
                                                onClick={() => handleTranslate(msg)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '-2rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    opacity: 0.5
                                                }}
                                                title="Translate"
                                            >
                                                <FaGlobe className={translatingMsgId === msg.id ? 'animate-spin' : ''} />
                                            </button>
                                        )}
                                        {msg.translated && <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>(Translated)</div>}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Smart Replies */}
                        {smartReplies.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-2 px-4 pb-2">
                                {smartReplies.map((reply, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setNewMessage(reply)}
                                        className="btn btn-ghost"
                                        style={{
                                            borderRadius: '20px',
                                            border: '1px solid var(--border-color)',
                                            fontSize: '0.85rem',
                                            padding: '0.25rem 0.75rem'
                                        }}
                                    >
                                        <FaBolt size={10} color="#eab308" /> {reply}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="chat-input-area">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="input"
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ padding: '0.75rem', opacity: isSending ? 0.7 : 1, cursor: isSending ? 'wait' : 'pointer' }}
                                disabled={isSending}
                            >
                                <FaPaperPlane />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        Select a chat or a suggested user to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
