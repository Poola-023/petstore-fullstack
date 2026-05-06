import React, { useState, useRef, useEffect } from 'react';
import API_BASE from '../config';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SubFooter from './SubFooter';
import PageNavigation from './PageNavigation';

const Cart = ({ cart, setCart, user, setUser }) => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate Total Amount using the discounted prices
    const totalAmount = cart.reduce((sum, item) => {
        const basePrice = typeof item.price === 'string'
            ? parseFloat(item.price.replace(/,/g, ''))
            : (item.price || 0);

        const discount = item.discountPercentage || 0;
        const finalPrice = discount > 0 ? basePrice - (basePrice * (discount / 100)) : basePrice;

        return sum + finalPrice;
    }, 0);

    const handleLogout = () => {
        if (setUser) {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token'); // Ensure token is cleared
            navigate('/');
        }
    };

    const removeItem = async (petId) => {
        const currentUserId = user?.userId || user?.id;

        if (!currentUserId) {
            const newCart = cart.filter(item => item.id !== petId);
            setCart(newCart);
            localStorage.setItem('cart', JSON.stringify(newCart));
            return;
        }

        try {
            // ✨ FIXED: Added JWT Authorization Header here
            const response = await fetch(`${API_BASE}/cart/remove/${currentUserId}/${petId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const newCart = cart.filter(item => item.id !== petId);
                setCart(newCart);
                localStorage.setItem('cart', JSON.stringify(newCart));
            }
        } catch (error) {
            console.error("Connection error:", error);
        }
    };

    const handleCheckout = () => {
        if (!user || (!user.userId && !user.id)) {
            alert("Please login to proceed with your adoption.");
            navigate('/login');
            return;
        }

        const vendorIds = cart.map(item => item.vendorId);
        const uniqueVendors = [...new Set(vendorIds)];

        if (uniqueVendors.length > 1) {
            alert("⚠️ Multi-Vendor Restriction: To ensure payment verification is successful, please checkout pets from one seller at a time. Remove pets from other sellers to continue.");
        } else {
            navigate('/checkout');
        }
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <PageNavigation />
            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <h1 style={styles.title}>Your Adoption Bag 🐾</h1>
                    <p style={styles.subtitle}>Curating a new life for your soulful companion.</p>

                    <div style={styles.vendorNote}>
                        <strong>📢 Boutique Protocol:</strong> Each partner boutique verifies their own adoption fees. Please ensure all companions in your bag belong to the same <b>Seller ID</b>.
                    </div>
                </header>

                {cart.length === 0 ? (
                    <div style={styles.emptyContainer}>
                        <div style={styles.emptyIcon}>🧺</div>
                        <p style={styles.emptyText}>Your adoption bag is empty. A companion is waiting for you.</p>
                        <button onClick={() => navigate('/all-pets')} style={styles.browseBtn}>Discover Pets</button>
                    </div>
                ) : (
                    <div style={styles.cartLayout}>
                        <div style={styles.itemsList}>
                            {cart.map((item, index) => {
                                const basePrice = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : (item.price || 0);
                                const discount = item.discountPercentage || 0;
                                const finalPrice = discount > 0 ? basePrice - (basePrice * (discount / 100)) : basePrice;

                                return (
                                    <div key={item.id || index} style={styles.cartCard}>
                                        <div style={styles.imageContainer}>
                                            <img
                                                src={item.image ? (item.image.startsWith('data:image') ? item.image : `data:image/jpeg;base64,${item.image}`) : "https://via.placeholder.com/150"}
                                                style={styles.itemImg}
                                                alt={item.breed}
                                            />
                                        </div>
                                        <div style={styles.itemInfo}>
                                            <h3 style={styles.petName}>{item.breed?.toUpperCase()}</h3>
                                            <span style={styles.tag}>SOULFUL LINEAGE</span>
                                            <p style={styles.vendorText}>📍 BOUTIQUE ID: <span style={{color: '#FF9900', fontWeight: 'bold'}}>{item.vendorId || "PARTNER"}</span></p>
                                        </div>
                                        <div style={styles.priceAction}>
                                            <p style={styles.priceText}>₹{finalPrice.toLocaleString('en-IN')}</p>
                                            {discount > 0 && (
                                                <p style={styles.discountText}>({discount}% OFF applied)</p>
                                            )}
                                            <button onClick={() => removeItem(item.id)} style={styles.removeLink}>Remove</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={styles.summaryBox}>
                            <h3 style={styles.summaryTitle}>Adoption Summary</h3>
                            <div style={styles.summaryRow}>
                                <span>Total companions</span>
                                <span>{cart.length}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span>Health Verification</span>
                                <span style={{color: '#00CEC9', fontWeight: 'bold'}}>INCLUDED</span>
                            </div>
                            <hr style={styles.divider} />
                            <div style={styles.totalRow}>
                                <span>Total Amount</span>
                                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                style={{
                                    ...styles.checkoutBtn,
                                    backgroundColor: [...new Set(cart.map(i => i.vendorId))].length > 1 ? '#333' : '#FF9900',
                                    cursor: [...new Set(cart.map(i => i.vendorId))].length > 1 ? 'not-allowed' : 'pointer',
                                    color: [...new Set(cart.map(i => i.vendorId))].length > 1 ? '#666' : '#131921'
                                }}
                            >
                                { [...new Set(cart.map(i => i.vendorId))].length > 1 ? "RESOLVE VENDOR CONFLICT" : "PROCEED TO VERIFICATION" }
                            </button>

                            <p style={styles.secureText}>🔒 Secure Payment Verification via Boutique UPI</p>
                        </div>
                    </div>
                )}
            </main>
            <SubFooter user={user} setUser={setUser} cart={cart} />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    mainContent: { padding: '40px 6%', maxWidth: '1400px', margin: '0 auto' },
    header: { marginBottom: '40px' },
    title: { fontSize: '2.5rem', fontWeight: '900', color: '#131921', margin: 0, letterSpacing: '-1px' },
    subtitle: { color: '#636E72', marginTop: '10px', fontSize: '1.1rem', fontWeight: '500' },
    vendorNote: { marginTop: '20px', padding: '20px', backgroundColor: '#FFF4E5', borderLeft: '6px solid #FF9900', borderRadius: '12px', color: '#856404', fontSize: '0.95rem', fontWeight: '500' },
    cartLayout: { display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px' },
    itemsList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    cartCard: { display: 'flex', backgroundColor: '#fff', padding: '25px', borderRadius: '24px', alignItems: 'center', border: '1px solid #EAEAEA', transition: '0.3s' },
    imageContainer: { width: '130px', height: '130px', borderRadius: '18px', overflow: 'hidden', marginRight: '25px', border: '1px solid #F1F2F6' },
    itemImg: { width: '100%', height: '100%', objectFit: 'cover' },
    itemInfo: { flex: 1 },
    petName: { margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: '900', color: '#131921' },
    tag: { fontSize: '0.65rem', backgroundColor: '#E0F2F1', color: '#00CEC9', padding: '5px 12px', borderRadius: '8px', fontWeight: '900', letterSpacing: '0.5px' },
    vendorText: { color: '#636E72', fontSize: '0.85rem', marginTop: '18px', fontWeight: '700' },
    priceAction: { textAlign: 'right', minWidth: '150px' },
    priceText: { fontSize: '1.6rem', fontWeight: '900', color: '#131921', marginBottom: '4px', marginTop: 0 },
    discountText: { fontSize: '0.75rem', color: '#059669', fontWeight: '700', margin: '0 0 12px 0' },
    removeLink: { color: '#FF4757', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem', textDecoration: 'none' },
    summaryBox: { backgroundColor: '#131921', padding: '40px', borderRadius: '32px', color: '#FFF', height: 'fit-content', position: 'sticky', top: '120px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' },
    summaryTitle: { fontSize: '1.6rem', fontWeight: '900', marginBottom: '30px', color: '#FF9900' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '18px', color: '#B2BEC3', fontWeight: '600' },
    divider: { border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '25px 0' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '1.8rem', marginBottom: '35px', color: '#FFF' },
    checkoutBtn: { width: '100%', padding: '20px', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '1.1rem', transition: '0.3s' },
    secureText: { textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: '#636E72', fontWeight: '700' },
    emptyContainer: { textAlign: 'center', padding: '100px 0' },
    emptyIcon: { fontSize: '5rem', marginBottom: '20px' },
    emptyText: { fontSize: '1.3rem', color: '#636E72', marginBottom: '35px', fontWeight: '600' },
    browseBtn: { padding: '18px 45px', backgroundColor: '#FF9900', color: '#131921', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '1rem' }
};

export default Cart;