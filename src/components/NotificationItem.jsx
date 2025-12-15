import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Avatar from './Avatar';
import { FaHeart, FaComment, FaEnvelope } from 'react-icons/fa';

const NotificationItem = ({ notification }) => {
    const { type, Actor, createdAt, isRead } = notification;

    const getIcon = () => {
        switch (type) {
            case 'LIKE':
                return <FaHeart style={{ color: '#ef4444' }} />;
            case 'COMMENT':
                return <FaComment style={{ color: '#3b82f6' }} />;
            case 'MESSAGE':
                return <FaEnvelope style={{ color: '#f59e0b' }} />;
            default:
                return null;
        }
    };

    const getMessage = () => {
        switch (type) {
            case 'LIKE':
                return 'liked your post.';
            case 'COMMENT':
                return 'commented on your post.';
            case 'MESSAGE':
                return 'sent you a message.';
            default:
                return 'interacted with you.';
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: isRead ? 'transparent' : 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid var(--border-color)',
            transition: 'background 0.2s',
            cursor: 'pointer'
        }}>
            <div style={{ position: 'relative' }}>
                <Avatar src={Actor?.avatar} name={Actor?.displayName} userId={Actor?.id} />
                <div style={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    background: 'var(--card-bg)',
                    borderRadius: '50%',
                    padding: '4px',
                    display: 'flex',
                    fontSize: '0.8rem'
                }}>
                    {getIcon()}
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    <Link to={`/users/${Actor?.id}`} style={{ fontWeight: '600', textDecoration: 'none', color: 'inherit' }} className="hover:underline">
                        {Actor?.displayName}
                    </Link> {getMessage()}
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </span>
            </div>

            {!isRead && (
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--accent-color)'
                }} />
            )}
        </div>
    );
};

export default NotificationItem;
