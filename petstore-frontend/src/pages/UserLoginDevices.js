import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SubFooter from './SubFooter';
import PageNavigation from './PageNavigation';

const UserLoginDevices = ({ user, setUser, cart }) => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = `http://${window.location.hostname}:8090/api/users`;

    const fetchSessions = useCallback(async () => {
        const userId = user?.userId || user?.id;
        const token = localStorage.getItem('token');

        if (!userId) {
            console.error("❌ No User ID found in state.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/sessions/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                console.log("✅ Sessions received:", data);
                setSessions(data);
            }
        } catch (err) {
            console.error("❌ Fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, [user, API_BASE]);

    useEffect(() => {
        if (!user) navigate('/login');
        else fetchSessions();
    }, [user, navigate, fetchSessions]);

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <PageNavigation />
            <main style={styles.container}>
                <div style={styles.header}>
                    <h1>Login <span style={{color: '#FF9900'}}>Devices</span></h1>
                    <p>Security history for your boutique account</p>
                </div>

                <div style={styles.cardContainer}>
                    {loading ? (
                        <div style={styles.empty}>Syncing records...</div>
                    ) : sessions.length === 0 ? (
                        <div style={styles.empty}>
                            <span style={{fontSize: '3rem'}}>🛡️</span>
                            <p>No active login history found. <br/> Try logging out and back in to record this session.</p>
                        </div>
                    ) : (
                        sessions.map((s, idx) => (
                            <div key={s.id} style={styles.deviceCard}>
                                <div style={styles.icon}>{s.deviceInfo.includes('Mobile') ? '📱' : '💻'}</div>
                                <div style={styles.details}>
                                    <div style={styles.row}>
                                        <h3 style={styles.deviceName}>{s.deviceInfo}</h3>
                                        {idx === 0 && <span style={styles.badge}>THIS DEVICE</span>}
                                    </div>
                                    <p style={styles.meta}>📍 {s.ipAddress} • {new Date(s.loginTime).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
            <SubFooter />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F8FAFC', minHeight: '100vh' },
    container: { maxWidth: '800px', margin: '60px auto', padding: '0 20px' },
    header: { marginBottom: '40px' },
    cardContainer: { backgroundColor: '#fff', borderRadius: '30px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' },
    deviceCard: { display: 'flex', gap: '20px', padding: '25px', borderBottom: '1px solid #F1F5F9', alignItems: 'center' },
    icon: { fontSize: '2rem', backgroundColor: '#F8FAFC', padding: '15px', borderRadius: '15px' },
    details: { flex: 1 },
    row: { display: 'flex', alignItems: 'center', gap: '12px' },
    deviceName: { margin: 0, fontSize: '1.1rem', fontWeight: '900' },
    badge: { backgroundColor: '#ECFDF5', color: '#059669', fontSize: '0.6rem', padding: '4px 8px', borderRadius: '6px', fontWeight: '900' },
    meta: { color: '#94A3B8', fontSize: '0.85rem', marginTop: '5px', fontWeight: '600' },
    empty: { textAlign: 'center', padding: '80px', color: '#94A3B8' }
};

export default UserLoginDevices;