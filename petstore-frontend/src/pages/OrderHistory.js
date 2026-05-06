import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SubFooter from './SubFooter';
import PageNavigation from './PageNavigation';

const OrderHistory = ({ user, setUser, cart }) => {
    const navigate = useNavigate();
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✨ REVIEW MODAL STATES
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
    const [reviewData, setReviewData] = useState({ rating: 0, bio: '', image: null });
    const [submittingReview, setSubmittingReview] = useState(false);

    const API_BASE = `http://${window.location.hostname}:8090/api`;

    // ✨ HELPER: Get Security Headers
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }, []);

    useEffect(() => {
        if (!user) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    if (setUser) setUser(parsedUser);
                } catch (e) {
                    console.error("Session sync failed");
                }
            } else {
                navigate('/login');
                return;
            }
        }

        const fetchOrderData = async () => {
            const userId = user?.userId || user?.id;
            if (!userId) return;

            try {
                // ✨ FIXED: Added JWT headers to the main order fetch
                const orderRes = await fetch(`${API_BASE}/orders/user/${userId}`, {
                    headers: getAuthHeaders()
                });

                if (orderRes.ok) {
                    const orderData = await orderRes.json();

                    const enrichedOrders = await Promise.all(orderData.map(async (order) => {
                        let recipientName = user?.username || 'Valued Guardian';
                        let petImage = null;
                        let isReviewed = false;

                        // Fetch Address (Secured)
                        if (order.addressId) {
                            try {
                                const addrRes = await fetch(`${API_BASE}/address/fetchById/${order.addressId}`, {
                                    headers: getAuthHeaders()
                                });
                                if (addrRes.ok) {
                                    const addrData = await addrRes.json();
                                    if (addrData && addrData.fullName) recipientName = addrData.fullName;
                                }
                            } catch (err) { console.error("Address fetch failed"); }
                        }

                        // Fetch Pet Image (Secured)
                        if (order.petId) {
                            try {
                                const petRes = await fetch(`${API_BASE}/pets/${order.petId}`, {
                                    headers: getAuthHeaders()
                                });
                                if (petRes.ok) {
                                    const petData = await petRes.json();
                                    petImage = petData.image;
                                }
                            } catch (err) { console.error("Pet fetch failed"); }
                        }

                        // ✨ Check if review exists (Secured)
                        try {
                            const revRes = await fetch(`${API_BASE}/reviews/check/${order.id}`, {
                                headers: getAuthHeaders()
                            });
                            if (revRes.ok) {
                                isReviewed = await revRes.json();
                            }
                        } catch (err) { console.error("Review check failed"); }

                        return { ...order, deliveryName: recipientName, petDisplayImg: petImage, isReviewed };
                    }));

                    const sortedOrders = enrichedOrders.sort((a, b) =>
                        new Date(b.orderDate || 0) - new Date(a.orderDate || 0)
                    );
                    setMyOrders(sortedOrders);
                }
            } catch (error) {
                console.error("History fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [user, setUser, navigate, API_BASE, getAuthHeaders]);

    // ✨ REVIEW HANDLERS
    const handleImageUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            setReviewData({ ...reviewData, image: base64String });
        };
        reader.readAsDataURL(file);
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (reviewData.rating === 0) return alert("Please select a star rating!");

        setSubmittingReview(true);

        const payload = {
            orderId: selectedOrderForReview.id,
            petId: selectedOrderForReview.petId,
            userId: user.userId || user.id,
            userName: user.username,
            vendorId: selectedOrderForReview.vendorId,
            rating: reviewData.rating,
            bio: reviewData.bio,
            image: reviewData.image
        };

        try {
            const res = await fetch(`${API_BASE}/reviews/add`, {
                method: 'POST',
                headers: getAuthHeaders(), // ✨ FIXED: Added JWT headers
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Thank you! Your review has been submitted.");
                setShowReviewModal(false);
                setReviewData({ rating: 0, bio: '', image: null });

                setMyOrders(prev => prev.map(o =>
                    o.id === selectedOrderForReview.id ? { ...o, isReviewed: true } : o
                ));
            } else {
                const text = await res.text();
                alert(text || "Failed to submit review.");
            }
        } catch (err) {
            alert("Connection error.");
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <PageNavigation />
            <main style={styles.main}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Your Adoption History</h1>
                    <p style={styles.subTitle}>Each boutique manages its own soulful companion delivery.</p>
                </div>

                {loading ? (
                    <div style={styles.loader}>Syncing Verification Data...</div>
                ) : myOrders.length > 0 ? (
                    <div style={styles.orderContainer}>
                        {myOrders.map(order => (
                            <div key={order.id} style={styles.orderCard}>
                                <div style={styles.orderHead}>
                                    <div style={styles.meta}>
                                        <span style={styles.label}>ADOPTION PLACED</span>
                                        <span style={styles.val}>
                                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Recent'}
                                        </span>
                                    </div>
                                    <div style={styles.meta}>
                                        <span style={styles.label}>TOTAL FEE</span>
                                        <span style={styles.val}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div style={styles.meta}>
                                        <span style={styles.label}>SHIP TO</span>
                                        <span style={{...styles.val, fontWeight: 'bold', color: '#00CEC9'}}>
                                            {order.deliveryName}
                                        </span>
                                    </div>
                                    <div style={styles.orderNum}>
                                        <span style={styles.label}>Order Id # {order.id}</span>
                                        <div style={styles.vendorBadge}>Boutique ID: {order.vendorId}</div>
                                    </div>
                                </div>

                                <div style={styles.orderBody}>
                                    <div style={styles.statusRow}>
                                        <h3 style={styles.statusText}>
                                            Delivery Status: <span style={{
                                                color: order.orderStatus === 'Delivered Done' ? '#00CEC9' : '#FF9900'
                                            }}>
                                                {order.orderStatus || 'Verification in progress'}
                                            </span>
                                        </h3>
                                        <div style={styles.paymentBadge}>
                                            {order.paymentStatus === 'PAID' ? '✅ Verified by Boutique' : '⏳ Verifying UTR'}
                                        </div>
                                    </div>

                                    <div style={styles.itemRow}>
                                        <div style={styles.petIconWrapper}>
                                            {order.petDisplayImg ? (
                                                <img src={`data:image/jpeg;base64,${order.petDisplayImg}`} alt={order.petNames} style={styles.petImg} />
                                            ) : (
                                                <div style={styles.placeholderImg}>🏠</div>
                                            )}
                                        </div>

                                        <div style={styles.itemDetails}>
                                            <h4 style={styles.petName}>{order.petNames?.toUpperCase()}</h4>
                                            <p style={styles.desc}>This adoption is being processed individually by the Partner Boutique.</p>

                                            <div style={styles.buttonGroup}>
                                                <button style={styles.trackBtn} onClick={() => navigate('/track-order', { state: { order } })}>
                                                    Track Status
                                                </button>

                                                {order.orderStatus === 'Delivered Done' && !order.isReviewed && (
                                                    <button
                                                        style={styles.reviewBtn}
                                                        onClick={() => {
                                                            setSelectedOrderForReview(order);
                                                            setShowReviewModal(true);
                                                        }}
                                                    >
                                                        ⭐ Leave a Review
                                                    </button>
                                                )}

                                                {order.isReviewed && (
                                                    <span style={styles.reviewedText}>✓ Review Submitted</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <h3 style={{fontSize: '1.5rem', fontWeight: '800'}}>No soulful adoptions yet.</h3>
                        <p style={{color: '#636E72', marginTop: '10px'}}>Start your discovery journey today.</p>
                        <button onClick={() => navigate('/')} style={styles.browseBtn}>Browse Boutique</button>
                    </div>
                )}
            </main>

            {/* REVIEW MODAL */}
            {showReviewModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalBox}>
                        <h2 style={styles.modalTitle}>Rate your experience</h2>
                        <p style={styles.modalSub}>How is {selectedOrderForReview?.petNames} settling in?</p>

                        <div style={styles.starContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    style={{...styles.star, color: reviewData.rating >= star ? '#FFB800' : '#EAEAEA'}}
                                    onClick={() => setReviewData({...reviewData, rating: star})}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        <form onSubmit={submitReview} style={styles.reviewForm}>
                            <textarea
                                style={styles.textArea}
                                placeholder="Share a little bio or story about your new companion..."
                                rows="4"
                                value={reviewData.bio}
                                onChange={(e) => setReviewData({...reviewData, bio: e.target.value})}
                                required
                            />

                            <label style={styles.uploadLabel}>
                                Upload a photo (Optional)
                                <input type="file" accept="image/*" style={styles.fileInput} onChange={(e) => handleImageUpload(e.target.files[0])} />
                            </label>

                            {reviewData.image && <p style={styles.successText}>✓ Image attached</p>}

                            <div style={styles.modalActions}>
                                <button type="button" style={styles.cancelBtn} onClick={() => setShowReviewModal(false)}>Cancel</button>
                                <button type="submit" style={styles.submitBtn} disabled={submittingReview}>
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <SubFooter user={user} setUser={setUser} cart={cart} />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    main: { padding: '50px 6%', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '40px', borderBottom: '1px solid #EAEAEA', paddingBottom: '25px' },
    title: { fontSize: '2.5rem', fontWeight: '950', color: '#131921', letterSpacing: '-1px' },
    subTitle: { color: '#636E72', fontSize: '1rem', marginTop: '10px', fontWeight: '500' },
    orderCard: { backgroundColor: 'white', border: '1px solid #EAEAEA', borderRadius: '24px', marginBottom: '35px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' },
    orderHead: { backgroundColor: '#F9FAFB', padding: '25px 35px', display: 'flex', flexWrap: 'wrap', gap: '50px', borderBottom: '1px solid #EAEAEA' },
    meta: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '0.65rem', color: '#B2BEC3', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' },
    val: { fontSize: '0.95rem', color: '#131921', fontWeight: '700' },
    orderNum: { marginLeft: 'auto', textAlign: 'right' },
    vendorBadge: { fontSize: '0.75rem', color: '#00CEC9', marginTop: '8px', fontWeight: '800' },
    orderBody: { padding: '35px' },
    statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    statusText: { margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#131921' },
    paymentBadge: { fontSize: '0.8rem', fontWeight: '800', color: '#636E72', backgroundColor: '#F3F4F6', padding: '8px 18px', borderRadius: '12px' },
    itemRow: { display: 'flex', gap: '30px', alignItems: 'center' },

    petIconWrapper: { width: '100px', height: '100px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FFF4' },
    petImg: { width: '100%', height: '100%', objectFit: 'cover' },
    placeholderImg: { fontSize: '2.5rem' },

    itemDetails: { flex: 1 },
    petName: { margin: '0 0 10px 0', color: '#131921', fontSize: '1.4rem', fontWeight: '950', letterSpacing: '-0.5px' },
    desc: { color: '#636E72', fontSize: '0.95rem', margin: '0 0 25px 0', fontWeight: '500' },
    buttonGroup: { display: 'flex', gap: '20px', alignItems: 'center' },
    trackBtn: { padding: '14px 30px', backgroundColor: '#131921', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '900', fontSize: '0.85rem' },
    reviewBtn: { padding: '14px 25px', backgroundColor: '#FFFAF0', border: '1.5px solid #FF9900', color: '#D97706', borderRadius: '16px', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem' },
    reviewedText: { color: '#10B981', fontWeight: '800', fontSize: '0.9rem' },

    emptyState: { textAlign: 'center', marginTop: '120px', padding: '40px' },
    browseBtn: { marginTop: '30px', padding: '18px 45px', backgroundColor: '#FF9900', border: 'none', borderRadius: '18px', color: '#131921', fontWeight: '900', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 10px 25px rgba(255, 153, 0, 0.2)' },
    loader: { textAlign: 'center', marginTop: '150px', fontSize: '1.2rem', fontWeight: '900', color: '#FF9900' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(19,25,33,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalBox: { backgroundColor: '#fff', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '500px', textAlign: 'center' },
    modalTitle: { margin: '0 0 5px 0', fontSize: '1.8rem', fontWeight: '900', color: '#131921' },
    modalSub: { margin: '0 0 25px 0', color: '#636E72' },
    starContainer: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '25px' },
    star: { fontSize: '3rem', cursor: 'pointer', transition: 'color 0.2s' },
    reviewForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
    textArea: { padding: '15px', borderRadius: '16px', border: '1px solid #EAEAEA', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
    uploadLabel: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '0.85rem', fontWeight: '700', color: '#131921', gap: '8px', cursor: 'pointer' },
    fileInput: { fontSize: '0.8rem' },
    successText: { color: '#10B981', fontSize: '0.8rem', fontWeight: 'bold', margin: 0, textAlign: 'left' },
    modalActions: { display: 'flex', gap: '15px', marginTop: '20px' },
    cancelBtn: { flex: 1, padding: '16px', backgroundColor: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' },
    submitBtn: { flex: 1, padding: '16px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' }
};

export default OrderHistory;