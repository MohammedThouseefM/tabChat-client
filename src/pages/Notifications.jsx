import React, { useState, useEffect } from 'react';
import API from '../api';
import NotificationItem from '../components/NotificationItem';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get('/notifications');
            setNotifications(data);

            // Mark all as read after fetching (simple approach for now)
            // Ideally should be on click or visibility, but this is MVP.
            // Or better: mark individual as read when clicked?
            // Let's stick to fetch for now, maybe add a "Mark all read" later.
            // For now, I will NOT auto-mark read implicitly.
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No notifications yet.
                    </div>
                ) : (
                    <div>
                        {notifications.map(notification => (
                            <NotificationItem key={notification.id} notification={notification} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
