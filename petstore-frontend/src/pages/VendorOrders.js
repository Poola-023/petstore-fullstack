import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';

const VendorOrders = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingRow, setUpdatingRow] = useState(null);

    const API_BASE = `http://${window.location.hostname}:8090/api`;

    // ✨ SECURITY HELPER
    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    };

    useEffect(() => {
        // ✨ FIXED
        const savedVendor = JSON.parse(localStorage.getItem('user') || localStorage.getItem('vendor'));
        if (!savedVendor || !localStorage.getItem('token')) { navigate('/vendor-login'); return; }
        setVendor(savedVendor);
        setLoading(true);

        // ✨ FIXED: Added Security Headers
        fetch(`${API_BASE}/orders/vendor/${savedVendor.id || savedVendor.vendorId}`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) setOrders(data.sort((a, b) => b.id - a.id));
            })
            .catch(err => console.error("Error fetching orders:", err))
            .finally(() => setLoading(false));
    }, [navigate, API_BASE]);

    const handleStatusUpdate = async (orderId, field, value) => {
        setUpdatingRow(orderId);
        try {
            // ✨ FIXED: Added Security Headers
            const res = await fetch(`${API_BASE}/orders/update/${orderId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ [field]: value })
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: value } : o));
            }
        } catch (err) {
            alert("Failed to update status. Please check your connection.");
        } finally {
            setUpdatingRow(null);
        }
    };

    // ... [KEEP YOUR EXACT STYLES AND RETURN() UI HERE] ...
    const getPaymentStyle = (status) => {
        switch (status) {
            case 'PAID': return { bg: '#ECFDF5', border: '#10B981', text: '#059669' };
            case 'FAILED': return { bg: '#FEF2F2', border: '#EF4444', text: '#DC2626' };
            case 'PENDING_VERIFICATION':
            case 'PENDING_COD':
            default: return { bg: '#FFF7ED', border: '#F59E0B', text: '#D97706' };
        }
    };

    const getJourneyStyle = (status) => {
        switch (status) {
            case 'Delivered Done': return { bg: '#F0FDF4', border: '#4ADE80', text: '#166534' };
            case 'Out for Delivery':
            case 'Shipped': return { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8' };
            case 'Packing':
            case 'Confirmed': return { bg: '#FEFCE8', border: '#FACC15', text: '#A16207' };
            case 'In Process':
            default: return { bg: '#F8FAFC', border: '#CBD5E1', text: '#475569' };
        }
    };

    return (
        <div style={styles.container}>
            <VendorSidebar activeTab="orders" vendor={vendor} />
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.welcomeText}>Adoption Orders</h1>
                        <p style={styles.dateText}>{vendor?.storeName?.toUpperCase() || 'OFFICIAL BOUTIQUE'}</p>
                    </div>
                </header>

                <div style={styles.contentFade}>
                    {loading ? (
                        <div style={styles.loaderBox}>
                            <svg width="50" height="50" viewBox="0 0 50 50" style={{ margin: '0 auto 20px auto', display: 'block' }}>
                                <circle cx="25" cy="25" r="20" fill="none" stroke="#FF9900" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
                                </circle>
                            </svg>
                            <p style={styles.loaderText}>Syncing recent adoptions...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={styles.emptyBox}>
                            <span style={styles.emptyIcon}>📦</span>
                            <h3 style={styles.emptyTitle}>No Orders Yet</h3>
                            <p style={styles.emptySub}>When customers adopt your companions, they will appear here.</p>
                        </div>
                    ) : (
                        <div style={styles.tableCard}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeaderRow}>
                                        <th style={styles.th}>Order ID</th>
                                        <th style={styles.th}>Companion Details</th>
                                        <th style={styles.th}>Transaction Ref</th>
                                        <th style={styles.th}>Verification Status</th>
                                        <th style={styles.th}>Journey Tracker</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => {
                                        const paymentStyle = getPaymentStyle(order.paymentStatus);
                                        const journeyStyle = getJourneyStyle(order.orderStatus);
                                        const isUpdating = updatingRow === order.id;

                                        return (
                                            <tr key={order.id} style={styles.tr}>
                                                <td style={styles.td}><span style={styles.idLabel}>{order.id}</span></td>
                                                <td style={styles.td}>
                                                    <div style={styles.itemCol}>
                                                        <span style={styles.itemNameText}>{order.petNames}</span>
                                                        <span style={styles.itemPriceText}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <code style={styles.utrCode}>{order.transactionId || 'PENDING'}</code>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{...styles.selectWrapper, opacity: isUpdating ? 0.6 : 1}}>
                                                        <select
                                                            disabled={isUpdating}
                                                            style={{
                                                                ...styles.premiumSelect,
                                                                backgroundColor: paymentStyle.bg,
                                                                borderColor: paymentStyle.border,
                                                                color: paymentStyle.text,
                                                                cursor: isUpdating ? 'not-allowed' : 'pointer'
                                                            }}
                                                            value={order.paymentStatus || 'PENDING_VERIFICATION'}
                                                            onChange={(e) => handleStatusUpdate(order.id, 'paymentStatus', e.target.value)}
                                                        >
                                                            <option value="PENDING_VERIFICATION">Pending Check</option>
                                                            <option value="PAID">Verified PAID</option>
                                                            <option value="FAILED">Refused / Failed</option>
                                                        </select>
                                                        <div style={{...styles.selectArrow, color: paymentStyle.text}}>{isUpdating ? '⏳' : '▼'}</div>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{...styles.selectWrapper, opacity: isUpdating ? 0.6 : 1}}>
                                                        <select
                                                            disabled={isUpdating}
                                                            style={{
                                                                ...styles.premiumSelect,
                                                                backgroundColor: journeyStyle.bg,
                                                                borderColor: journeyStyle.border,
                                                                color: journeyStyle.text,
                                                                cursor: isUpdating ? 'not-allowed' : 'pointer'
                                                            }}
                                                            value={order.orderStatus || 'In Process'}
                                                            onChange={(e) => handleStatusUpdate(order.id, 'orderStatus', e.target.value)}
                                                        >
                                                            <option value="In Process">In Process</option>
                                                            <option value="Confirmed">Confirmed</option>
                                                            <option value="Packing">Pick Up Started</option>
                                                            <option value="Shipped">Sent to Hub</option>
                                                            <option value="Out for Delivery">Out for Delivery</option>
                                                            <option value="Delivered Done">Delivered</option>
                                                        </select>
                                                        <div style={{...styles.selectArrow, color: journeyStyle.text}}>{isUpdating ? '⏳' : '▼'}</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    main: { flex: 1, padding: '40px 50px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    welcomeText: { fontSize: '2rem', fontWeight: '900', color: '#131921', margin: 0 },
    dateText: { color: '#FF9900', fontSize: '0.8rem', fontWeight: '800', marginTop: '5px', letterSpacing: '0.5px' },
    loaderBox: { backgroundColor: '#fff', padding: '100px 0', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', marginTop: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    loaderText: { color: '#131921', fontWeight: '800', fontSize: '1.2rem', margin: 0 },
    emptyBox: { backgroundColor: '#fff', padding: '80px', borderRadius: '24px', textAlign: 'center', border: '1px dashed #cbd5e1', marginTop: '20px' },
    emptyIcon: { fontSize: '3rem', marginBottom: '15px', display: 'block' },
    emptyTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', margin: '0 0 10px 0' },
    emptySub: { color: '#64748b', fontSize: '0.95rem', margin: 0 },
    tableCard: { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeaderRow: { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
    th: { padding: '20px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
    td: { padding: '20px 24px', fontSize: '0.85rem', verticalAlign: 'middle' },
    idLabel: { fontWeight: '900', color: '#94a3b8', fontSize: '0.85rem' },
    itemCol: { display: 'flex', flexDirection: 'column', gap: '5px' },
    itemNameText: { fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' },
    itemPriceText: { color: '#10b981', fontWeight: '900', fontSize: '0.8rem' },
    utrCode: { background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', color: '#475569', fontWeight: '800', letterSpacing: '0.5px', border: '1px solid #e2e8f0' },
    selectWrapper: { position: 'relative', display: 'inline-block', width: '180px', transition: 'opacity 0.2s ease' },
    premiumSelect: { width: '100%', padding: '10px 35px 10px 15px', borderRadius: '12px', borderWidth: '2px', borderStyle: 'solid', fontSize: '0.8rem', fontWeight: '800', appearance: 'none', outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    selectArrow: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.65rem', fontWeight: '900' },
    contentFade: { animation: 'fadeIn 0.4s ease' }
};

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    tbody tr:hover { background-color: #f8fafc !important; }
    select:hover:not(:disabled) { filter: brightness(0.95); }
`;
document.head.appendChild(styleSheet);
export default VendorOrders;