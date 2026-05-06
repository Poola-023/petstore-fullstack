import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';

const VendorServiceDashboard = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = `http://${window.location.hostname}:8090/api/services`;

    useEffect(() => {
        // ✨ Initialize Vendor from LocalStorage (Matches VendorOrders logic)
        const savedVendor = JSON.parse(localStorage.getItem('user') || localStorage.getItem('vendor'));
        if (!savedVendor || !localStorage.getItem('token')) {
            navigate('/vendor-login');
            return;
        }
        setVendor(savedVendor);

        const fetchRequests = async () => {
            try {
                const res = await fetch(`${API_BASE}/all-requests`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Filter for PENDING to keep the dashboard focused
                    setIncomingRequests(data.filter(b => b.status === 'PENDING'));
                }
            } catch (err) {
                console.error("Error fetching services:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [navigate, API_BASE]);

    const handleAction = async (id, action) => {
        const url = action === 'approve' ? `${API_BASE}/approve/${id}` : `${API_BASE}/cancel/${id}`;

        try {
            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                alert(`Booking ${action}ed successfully!`);
                setIncomingRequests(prev => prev.filter(req => req.id !== id));
            } else {
                alert("Action failed. Please check server logs.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    return (
        <div style={styles.page}>
            {/* ✨ Fixed: Sidebar now matches VendorOrders structure */}
            <VendorSidebar activeTab="services" vendor={vendor} />

            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Service Management Portal</h1>
                        <p style={styles.subtitle}>Review and confirm upcoming grooming & vet requests</p>
                    </div>
                </header>

                <div style={styles.contentFade}>
                    {loading ? (
                        <div style={styles.loaderBox}>
                            <p style={styles.loaderText}>Syncing service requests...</p>
                        </div>
                    ) : incomingRequests.length === 0 ? (
                        <div style={styles.emptyBox}>
                            <span style={styles.emptyIcon}>🩺</span>
                            <h3 style={styles.emptyTitle}>No Pending Requests</h3>
                            <p style={styles.emptySub}>All care appointments are currently processed.</p>
                        </div>
                    ) : (
                        <div style={styles.list}>
                            {incomingRequests.map(req => (
                                <div key={req.id} style={styles.requestCard}>
                                    <div style={styles.info}>
                                        <h4 style={styles.serviceName}>{req.serviceType}</h4>
                                        <p style={styles.dateTime}>📅 {new Date(req.appointmentTime).toLocaleString()}</p>
                                        <p style={styles.notes}>
                                            <strong style={{color: '#131921'}}>Note:</strong> {req.notes || "No special instructions."}
                                        </p>
                                    </div>
                                    <div style={styles.actions}>
                                        <button style={styles.approveBtn} onClick={() => handleAction(req.id, 'approve')}>Approve</button>
                                        <button style={styles.rejectBtn} onClick={() => handleAction(req.id, 'reject')}>Decline</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const styles = {
    // ✨ Container now matches VendorOrders flex layout
    page: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    mainContent: { flex: 1, padding: '40px 50px', overflowY: 'auto' },
    header: { marginBottom: '40px' },
    title: { fontSize: '2rem', fontWeight: '900', color: '#131921', margin: 0 },
    subtitle: { color: '#FF9900', fontSize: '0.85rem', fontWeight: '800', marginTop: '5px', letterSpacing: '0.5px' },

    // Card Style
    requestCard: {
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
    },
    info: { flex: 1 },
    serviceName: { margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: '800', color: '#1e293b' },
    dateTime: { margin: '0 0 10px 0', color: '#FF9900', fontWeight: '700', fontSize: '0.95rem' },
    notes: { fontSize: '0.9rem', color: '#64748b', margin: 0, lineHeight: '1.5' },

    // Actions
    actions: { display: 'flex', gap: '12px' },
    approveBtn: { padding: '12px 28px', background: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' },
    rejectBtn: { padding: '12px 28px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' },

    // States (Matches VendorOrders look)
    loaderBox: { backgroundColor: '#fff', padding: '80px', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0' },
    loaderText: { color: '#131921', fontWeight: '800' },
    emptyBox: { backgroundColor: '#fff', padding: '80px', borderRadius: '24px', textAlign: 'center', border: '1px dashed #cbd5e1' },
    emptyIcon: { fontSize: '3rem', display: 'block', marginBottom: '15px' },
    emptyTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' },
    emptySub: { color: '#64748b', fontSize: '0.9rem' },
    contentFade: { animation: 'fadeIn 0.4s ease' }
};

export default VendorServiceDashboard;