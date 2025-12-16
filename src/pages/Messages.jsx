import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaGlobe, FaList, FaBolt, FaExclamationTriangle, FaMagic } from 'react-icons/fa';
import Avatar from '../components/Avatar';

const Messages = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
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

    // Fetch Users (Unchanged)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await API.get('/users');
                setUsers(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsers();
    }, []);

    // Fetch Messages & Smart Replies (Unchanged logic, added showMobileChat effect)
    useEffect(() => {
        if (!selectedUser) return;

        // Reset states when switching user
        setSummary('');
        setShowSummary(false);
        setSmartReplies([]);
        setShowMobileChat(true); // Show chat on mobile when user is selected

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
        } catch (err) {
            console.error(err);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={`messages-container ${showMobileChat ? 'messages-mobile-view-chat' : 'messages-mobile-view-list'}`}>
            {/* Users List */}
            <div className="card messages-list">
                <h3 className="mb-4">Messages</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {users.map((u) => (
                        <div
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className={`user-list-item ${selectedUser?.id === u.id ? 'active' : ''}`}
                        >
                            <Avatar src={u.avatar} name={u.displayName} />
                            <span style={{ fontWeight: '500' }}>{u.displayName}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="card chat-window">
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
                            >
                                <FaList /> {aiProcessing ? 'Summarizing...' : 'Summarize Chat'}
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
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                            <div style={{ padding: '0 1rem 0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                        <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
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
                        Select a user to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
