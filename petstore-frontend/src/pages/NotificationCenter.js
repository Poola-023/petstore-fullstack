import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

const NotificationCenter = ({ user, setUser, cart }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = user?.userId || user?.id;

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:8090/api/notifications/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Sort by newest first
                setNotifications(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchNotifications();
    }, [userId]);

    const markRead = async (id) => {
        await fetch(`http://${window.location.hostname}:8090/api/notifications/read/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllRead = async () => {
        // Optional backend call: /api/notifications/read-all/{userId}
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        await Promise.all(unreadIds.map(id => markRead(id)));
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            <div style={styles.container}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Notifications</h1>
                        <p style={styles.subtitle}>Stay updated on your companions and services</p>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button style={styles.markAllBtn} onClick={markAllRead}>Mark all as read</button>
                    )}
                </header>


                <div style={styles.list}>
                    {loading ? (
                        <div style={styles.loader}>Syncing your alerts...</div>
                    ) : notifications.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>🔔</div>
                            <h3 style={styles.emptyTitle}>All caught up!</h3>
                            <p style={styles.emptyDesc}>We'll notify you here when there's news about your pets.</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                style={{
                                    ...styles.card,
                                    backgroundColor: n.isRead ? '#fff' : '#FFF9F0',
                                    borderLeft: n.isRead ? '6px solid #E2E8F0' : '6px solid #FF9900',
                                    transform: n.isRead ? 'none' : 'translateY(-2px)',
                                    boxShadow: n.isRead ? '0 2px 10px rgba(0,0,0,0.02)' : '0 10px 25px rgba(255,153,0,0.1)'
                                }}
                                onClick={() => markRead(n.id)}
                            >
                                <div style={styles.cardContent}>
                                    <div style={styles.topRow}>
                                        <div style={styles.metaLeft}>
                                            <span style={{...styles.typeTag, color: n.isRead ? '#94A3B8' : '#FF9900'}}>{n.type}</span>
                                            {/* ✨ PET NAME INTEGRATION */}
                                            {n.petName && (
                                                <span style={styles.petBadge}>🐾 {n.petName}</span>
                                            )}
                                        </div>
                                        <span style={styles.time}>
                                            {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <h4 style={{...styles.nTitle, color: n.isRead ? '#475569' : '#131921'}}>{n.title}</h4>
                                    <p style={styles.nMsg}>{n.message}</p>
                                </div>
                                {!n.isRead && <div style={styles.unreadDot} />}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    container: { padding: '120px 8% 60px 8%', maxWidth: '900px', margin: '0 auto' },

    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' },
    title: { fontSize: '2.8rem', fontWeight: '900', color: '#131921', margin: 0, letterSpacing: '-1.5px' },
    subtitle: { color: '#64748B', fontSize: '1rem', marginTop: '5px', fontWeight: '500' },
    markAllBtn: { background: 'none', border: 'none', color: '#FF9900', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' },

    list: { display: 'flex', flexDirection: 'column', gap: '20px' },

    card: {
        position: 'relative',
        padding: '25px 30px',
        borderRadius: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #F1F5F9'
    },
    cardContent: { flex: 1 },

    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    metaLeft: { display: 'flex', gap: '12px', alignItems: 'center' },
    typeTag: { fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' },

    petBadge: {
        backgroundColor: '#131921',
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '10px',
        fontSize: '0.7rem',
        fontWeight: '700'
    },

    time: { fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600' },
    nTitle: { margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '800' },
    nMsg: { margin: 0, color: '#64748B', fontSize: '0.95rem', lineHeight: '1.6' },

    unreadDot: { width: '10px', height: '10px', backgroundColor: '#FF9900', borderRadius: '50%', marginLeft: '20px' },

    loader: { textAlign: 'center', padding: '100px', fontWeight: '800', color: '#94A3B8' },

    emptyState: { textAlign: 'center', padding: '80px 40px', backgroundColor: '#fff', borderRadius: '40px', border: '1px solid #E2E8F0' },
    emptyIcon: { fontSize: '4rem', marginBottom: '20px', opacity: 0.2 },
    emptyTitle: { fontSize: '1.5rem', fontWeight: '900', color: '#131921' },
    emptyDesc: { color: '#64748B', maxWidth: '300px', margin: '10px auto 0 auto', lineHeight: '1.5' }
};

export default NotificationCenter;