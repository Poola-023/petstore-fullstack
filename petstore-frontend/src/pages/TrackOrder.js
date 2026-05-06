import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SubFooter from './SubFooter';
import PageNavigation from './PageNavigation';

const TrackOrder = ({ user, setUser, cart }) => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [deliveryAddress, setDeliveryAddress] = useState(null);
    const [petDetails, setPetDetails] = useState(null); // ✨ State for pet image

    const order = state?.order;

    useEffect(() => {
        // 🔒 SESSION SYNC
        if (!user) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    if (setUser) setUser(parsedUser);
                } catch (e) { console.error("Session sync failed"); }
            }
        }

        const fetchOrderDetails = async () => {
            if (!order) return;

            try {
                // 1. Fetch Address
                if (order.addressId) {
                    const addrRes = await fetch(`http://${window.location.hostname}:8090/api/address/fetchById/${order.addressId}`);
                    if (addrRes.ok) {
                        const addrData = await addrRes.json();
                        setDeliveryAddress(addrData);
                    }
                }

                // 2. ✨ FETCH PET IMAGE FROM PETS TABLE
                // Using petId from the order to get the actual image blob
                if (order.petId) {
                    const petRes = await fetch(`http://${window.location.hostname}:8090/api/pets/${order.petId}`);
                    if (petRes.ok) {
                        const petData = await petRes.json();
                        setPetDetails(petData);
                    }
                }
            } catch (err) {
                console.error("Error fetching tracking details:", err);
            }
        };

        fetchOrderDetails();
    }, [order, user, setUser]);

    if (!order) return (
        <div style={styles.emptyPage}>
            <div style={styles.emptyCard}>
                <span style={{fontSize: '4rem'}}>📍</span>
                <h3>No tracking data found.</h3>
                <button onClick={() => navigate('/')} style={styles.browseBtn}>Return to Discovery</button>
            </div>
        </div>
    );

    const steps = [
        { label: 'Order In process', status: 'In Process', desc: 'Awaiting UPI payment verification.' },
        { label: 'Order conformed', status: 'Confirmed', desc: 'Payment verified! Your companion is ready.' },
        { label: 'Pick Up Started', status: 'Packing', desc: 'Picked up from the partner boutique.' },
        { label: 'Reached Nearest Location', status: 'Shipped', desc: 'Arrived at our local Hyderabad hub.' },
        { label: 'Out for Delivery', status: 'Out for Delivery', desc: 'Your friend is on the final stretch!' },
        { label: 'Delivered', status: 'Delivered Done', desc: 'The journey is complete. Welcome home!' }
    ];

    const currentStepIndex = steps.findIndex(s => s.status === (order.orderStatus || 'In Process'));

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <PageNavigation />
            <main style={styles.mainContent}>
                <div style={styles.contentLayout}>
                    <div style={styles.timelineCard}>
                        <div style={styles.itemHeader}>
                            <div style={styles.imgContainer}>
                                {/* ✨ UPDATED: Fetching image from petDetails (Pet Table) */}
                                {petDetails?.image ? (
                                    <img
                                        src={`data:image/jpeg;base64,${petDetails.image}`}
                                        alt={order.petNames}
                                        style={styles.petImg}
                                    />
                                ) : (
                                    <div style={styles.placeholder}>🐾</div>
                                )}
                            </div>
                            <div style={styles.itemMeta}>
                                <h1 style={styles.petName}>{order.petNames.toUpperCase()}</h1>
                                <span style={styles.orderBadge}>RECORD # {order.id}</span>
                                <p style={styles.price}>Verification Fee: ₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        <div style={styles.stepperContainer}>
                            {steps.map((step, index) => (
                                <div key={index} style={styles.stepRow}>
                                    <div style={styles.lineCol}>
                                        <div style={{
                                            ...styles.circle,
                                            backgroundColor: index <= currentStepIndex ? '#00CEC9' : '#E5E7EB',
                                        }}>
                                            {index <= currentStepIndex ? '✓' : ''}
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div style={{
                                                ...styles.line,
                                                background: index < currentStepIndex ? '#00CEC9' : '#E5E7EB'
                                            }}></div>
                                        )}
                                    </div>
                                    <div style={styles.stepInfo}>
                                        <p style={{
                                            ...styles.stepLabel,
                                            color: index <= currentStepIndex ? '#131921' : '#9CA3AF',
                                            fontWeight: index === currentStepIndex ? '800' : '600'
                                        }}>{step.label}</p>
                                        <p style={styles.stepDesc}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.sidebar}>
                        <div style={styles.sideCard}>
                            <h4 style={styles.sideTitle}>Destination</h4>
                            <div style={styles.addressBox}>
                                <span style={styles.homeIcon}>📍</span>
                                <div style={styles.addressText}>
                                    {deliveryAddress ? (
                                        <>
                                            <strong style={{color: '#131921'}}>{deliveryAddress.fullName}</strong><br/>
                                            {deliveryAddress.houseDetails}, {deliveryAddress.areaLocality}<br/>
                                            {deliveryAddress.city} - {deliveryAddress.pincode}
                                        </>
                                    ) : (
                                        <p>Locating soulful destination...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={styles.sideCard}>
                            <h4 style={styles.sideTitle}>Verification Detail</h4>
                            <div style={styles.priceRow}>
                                <span>Status</span>
                                <span style={{fontWeight: '800', color: '#00CEC9'}}>{order.paymentStatus}</span>
                            </div>
                            <div style={styles.priceRow}>
                                <span>Ref UTR</span>
                                <span style={{fontSize: '0.85rem', color: '#131921', fontWeight: '800'}}>{order.transactionId || 'PENDING'}</span>
                            </div>
                        </div>

                        <button onClick={() => window.open(`https://wa.me/919133424340?text=Support%20Enquiry%20for%20Record%20%23${order.id}`, '_blank')} style={styles.supportBtn}>
                            💬 Chat with Specialist
                        </button>
                    </div>
                </div>
            </main>
            <SubFooter user={user} setUser={setUser} cart={cart} />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    mainContent: { padding: '50px 6%', maxWidth: '1200px', margin: '0 auto' },
    contentLayout: { display: 'grid', gridTemplateColumns: '1.4fr 0.9fr', gap: '40px' },
    timelineCard: { backgroundColor: '#fff', borderRadius: '32px', padding: '40px', border: '1px solid #EAEAEA' },
    itemHeader: { display: 'flex', gap: '30px', borderBottom: '1px solid #F1F5F9', paddingBottom: '30px', marginBottom: '40px', alignItems: 'center' },
    imgContainer: { width: '130px', height: '130px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #EAEAEA' },
    petImg: { width: '100%', height: '100%', objectFit: 'cover' },
    placeholder: { width: '100%', height: '100%', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem' },
    itemMeta: { flex: 1 },
    petName: { margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: '950', color: '#131921' },
    orderBadge: { fontSize: '0.7rem', fontWeight: '800', backgroundColor: '#F3F4F6', color: '#636E72', padding: '6px 14px', borderRadius: '10px' },
    price: { fontWeight: '700', fontSize: '1rem', color: '#636E72', marginTop: '12px' },
    stepperContainer: { paddingLeft: '10px' },
    stepRow: { display: 'flex', gap: '25px', minHeight: '90px' },
    lineCol: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    circle: { width: '30px', height: '30px', borderRadius: '50%', color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    line: { width: '3px', flex: 1, margin: '-2px 0' },
    stepInfo: { display: 'flex', flexDirection: 'column', paddingTop: '2px' },
    stepLabel: { margin: '0 0 6px 0', fontSize: '1.1rem' },
    stepDesc: { margin: 0, fontSize: '0.85rem', color: '#636E72', lineHeight: '1.5' },
    sidebar: { display: 'flex', flexDirection: 'column', gap: '30px' },
    sideCard: { backgroundColor: '#fff', padding: '35px', borderRadius: '32px', border: '1px solid #EAEAEA' },
    sideTitle: { color: '#B2BEC3', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '800', marginBottom: '25px' },
    addressBox: { display: 'flex', gap: '18px' },
    homeIcon: { fontSize: '1.4rem' },
    addressText: { fontSize: '0.95rem', lineHeight: '1.7', color: '#636E72' },
    priceRow: { display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginBottom: '18px', color: '#636E72', fontWeight: '600' },
    supportBtn: { padding: '22px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '900' },
    emptyPage: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
    emptyCard: { textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '40px', border: '1px solid #EAEAEA' },
    browseBtn: { marginTop: '30px', padding: '16px 35px', backgroundColor: '#FF9900', borderRadius: '14px', fontWeight: '900' }
};

export default TrackOrder;