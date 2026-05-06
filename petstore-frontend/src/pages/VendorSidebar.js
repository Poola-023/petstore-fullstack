import React from 'react';
import { useNavigate } from 'react-router-dom';

const VendorSidebar = ({ activeTab, vendor }) => {
    const navigate = useNavigate();

    return (
        <aside style={styles.sidebar}>
            <div style={styles.logoSection}>
                <div style={styles.logoBadge}><span style={styles.pawIcon}>🐾</span></div>
                <div style={styles.brandTextGroup}>
                    <h2 style={styles.logoText}>PAWS<span style={{color: '#FF9900'}}>&</span>PALETTE</h2>
                    <span style={styles.partnerTag}>BOUTIQUE PARTNER</span>
                </div>
            </div>

            <nav style={styles.nav}>
                <div style={activeTab === 'overview' ? styles.activeNavItem : styles.navItem} onClick={() => navigate('/vendor-dashboard')}>
                    <span style={styles.icon}>📊</span> Performance
                </div>

                <div style={activeTab === 'products' ? styles.activeNavItem : styles.navItem} onClick={() => navigate('/vendor-inventory')}>
                    <span style={styles.icon}>🐾</span> My Inventory
                </div>

                {/* ✨ NEW: Service Booking / Care Requests Section */}
                <div style={activeTab === 'services' ? styles.activeNavItem : styles.navItem} onClick={() => navigate('/vendor-services')}>
                    <span style={styles.icon}>🩺</span> Care Requests
                </div>

                <div style={activeTab === 'orders' ? styles.activeNavItem : styles.navItem} onClick={() => navigate('/vendor-orders')}>
                    <span style={styles.icon}>📋</span> Adoption Log
                </div>

                <div style={activeTab === 'discount' ? styles.activeNavItem : styles.navItem} onClick={() => navigate('/vendor-discounts')}>
                    <span style={styles.icon}>🏷️</span> Discounts
                </div>

                <div style={activeTab === 'promo' ? styles.activeNavItem : styles.navItem} onClick={() => navigate('/vendor-promos')}>
                    <span style={styles.icon}>🖼️</span> Discount Ads
                </div>
            </nav>

            <div style={styles.sidebarFooter}>
                <button onClick={() => navigate(`/vendor-profile/${vendor?.id || vendor?.vendorId}`)} style={styles.profileBtn}>Profile</button>
                <button onClick={() => navigate('/')} style={styles.userHomeBtn}>Discovery Center</button>
                <button onClick={() => {
                    localStorage.removeItem('user');
                    localStorage.removeItem('vendor');
                    localStorage.removeItem('token');
                    navigate('/vendor-login');
                }} style={styles.logoutBtn}>Logout</button>
            </div>
        </aside>
    );
};

const styles = {
    sidebar: { width: '280px', backgroundColor: '#131921', padding: '40px 24px', display: 'flex', flexDirection: 'column', color: '#fff', height: '100vh', position: 'sticky', top: 0 },
    logoSection: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '50px' },
    logoBadge: { backgroundColor: '#FF9900', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    pawIcon: { fontSize: '1.2rem', color: '#131921' },
    brandTextGroup: { display: 'flex', flexDirection: 'column', lineHeight: '1.1' },
    logoText: { fontSize: '1.2rem', margin: 0, fontWeight: '900', letterSpacing: '0.5px' },
    partnerTag: { fontSize: '0.55rem', fontWeight: '800', color: '#FF9900', letterSpacing: '1px' },
    nav: { flex: 1 },
    navItem: { padding: '14px 16px', color: '#94a3b8', cursor: 'pointer', borderRadius: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', fontSize: '0.9rem', transition: '0.2s' },
    activeNavItem: { padding: '14px 16px', color: '#fff', backgroundColor: '#1e293b', borderRadius: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', fontWeight: '700', borderLeft: '4px solid #FF9900' },
    icon: { marginRight: '12px' },
    sidebarFooter: { marginTop: 'auto', borderTop: '1px solid #1e293b', paddingTop: '20px' },
    profileBtn: { width: '100%', padding: '12px', color: '#fff', backgroundColor: 'rgba(255, 153, 0, 0.1)', border: '1px solid #FF9900', borderRadius: '12px', cursor: 'pointer', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 'bold' },
    userHomeBtn: { width: '100%', padding: '10px', color: '#94a3b8', border: '1px solid #334155', background: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '10px', fontSize: '0.8rem' },
    logoutBtn: { width: '100%', padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }
};

export default VendorSidebar;