import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SubFooter from './SubFooter';
import PageNavigation from './PageNavigation';

const Checkout = ({ cart, setCart, user, setUser }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // --- Address States ---
    const [allAddresses, setAllAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressPicker, setShowAddressPicker] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // --- Payment States ---
    const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // Default to Razorpay

    const [tempAddress, setTempAddress] = useState({
        fullName: user?.username || '',
        mobile: '',
        houseDetails: '',
        areaLocality: '',
        city: '',
        pincode: '',
        addressType: 'HOME'
    });

    const API_BASE = `http://${window.location.hostname}:8090/api`;

    // Security Helper
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(styleSheet);
    }, []);

    useEffect(() => {
        if (!user || (!user.userId && !user.id)) {
            navigate('/login');
        }
    }, [user, navigate]);

    // ✨ FIXED: Address fetching logic points to port 8090
    const fetchAddresses = useCallback(async () => {
        const userId = user?.userId || user?.id;
        if (!userId) return;
        try {
            const res = await fetch(`${API_BASE}/address/fetch/${userId}?page=0&size=50&showAll=true`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                const fetchedAddresses = Array.isArray(data) ? data : (data.content || []);

                if (fetchedAddresses.length > 0) {
                    setAllAddresses(fetchedAddresses);
                    setSelectedAddress(fetchedAddresses[0]);
                    setIsEditing(false);
                } else {
                    setIsEditing(true);
                }
            }
        } catch (err) {
            console.error("Address fetch failed", err);
            setIsEditing(true);
        }
    }, [user, API_BASE]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const checkoutItems = location.state?.items || (Array.isArray(cart) ? cart : []);

    useEffect(() => {
        if (!loading && !orderSuccess && checkoutItems.length === 0) {
            navigate('/cart');
        }
    }, [checkoutItems, loading, orderSuccess, navigate]);

    let subtotal = 0;
    let totalSavings = 0;

    const processedItems = checkoutItems.map(item => {
        const basePrice = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : (item.price || 0);
        const discount = item.discountPercentage || 0;
        const finalPrice = discount > 0 ? basePrice - (basePrice * (discount / 100)) : basePrice;

        subtotal += basePrice;
        totalSavings += (basePrice - finalPrice);

        return { ...item, basePrice, finalPrice, discount };
    });

    const finalTotalAmount = subtotal - totalSavings;

    // SAVE ADDRESS
    const handleSaveAddress = async () => {
        const userId = user?.userId || user?.id;
        if (!tempAddress.mobile || !tempAddress.houseDetails || !tempAddress.areaLocality || !tempAddress.city || !tempAddress.pincode) {
            return alert("Please fill in all address fields to continue.");
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/address/save/${userId}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(tempAddress)
            });
            if (res.ok) {
                alert("✅ Address saved successfully! You can now complete your adoption.");
                await fetchAddresses();
            } else {
                alert("Failed to save location.");
            }
        } catch (err) {
            alert("Network error while saving address.");
        } finally {
            setLoading(false);
        }
    };

    // ✨ CORE ORDER PLACEMENT (Used by both Razorpay and COD)
    const placeOrderToBackend = async (method, txnId) => {
        const userId = user?.userId || user?.id;
        const finalOrderArray = processedItems.map(item => ({
            userId: userId,
            addressId: selectedAddress.addressId || selectedAddress.id,
            vendorId: item.vendorId,
            petId: item.id,
            petNames: item.breed || item.name,
            petGender: item.selectedGender || 'Unknown',
            totalAmount: item.finalPrice,
            transactionId: txnId,
            paymentMethod: method === 'ONLINE' ? 'RAZORPAY' : method,
            paymentStatus: method === 'COD' ? "PENDING_COD" : "SUCCESS",
            orderStatus: "In Process"
        }));

        try {
            const res = await fetch(`${API_BASE}/orders/place`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(finalOrderArray)
            });

            if (res.ok) {
                setOrderSuccess(true);
                if (!location.state?.directPurchase) {
                    if (typeof setCart === 'function') setCart([]);
                    localStorage.removeItem('cart');
                }
                setTimeout(() => navigate('/order-history'), 3000);
            } else {
                const errData = await res.text();
                alert("Order failed: " + errData);
                setLoading(false);
            }
        } catch (error) {
            alert("Connection error. Please check your internet.");
            setLoading(false);
        }
    };

    // COD HANDLER
    const handleCODPayment = async (e) => {
        e.preventDefault();
        if (isEditing) return alert("⚠️ You have an unsaved address! Please click 'Confirm This Location' first.");
        if (!selectedAddress) return alert("⚠️ Please select a delivery address to continue.");
        if (checkoutItems.length === 0) return alert("Your checkout bag is empty!");

        setLoading(true);
        placeOrderToBackend('COD', `COD_${Date.now()}`);
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // ✨ RAZORPAY HANDLER
    const handleRazorpayPayment = async (e) => {
        e.preventDefault();

        if (isEditing) return alert("⚠️ You have an unsaved address! Please click 'Confirm This Location' first.");
        if (!selectedAddress) return alert("⚠️ Please select a delivery address to continue.");
        if (checkoutItems.length === 0) return alert("Your checkout bag is empty!");

        setLoading(true);

        try {
            const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ amount: finalTotalAmount })
            });

            if (!orderRes.ok) {
                alert("Failed to create secure payment order.");
                setLoading(false);
                return;
            }

            const orderData = await orderRes.json();
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                alert("Razorpay SDK failed to load. Please check your internet connection.");
                setLoading(false);
                return;
            }

            // ✨ CHANGE THIS TO YOUR rzp_live_ KEY IF YOU ARE READY FOR REAL MONEY
            const options = {
                key: "rzp_test_SaGKXWItyTOgJv",
                amount: orderData.amount,
                currency: "INR",
                name: "Paws & Palette",
                description: "Soulful Companion Adoption",
                order_id: orderData.id,
                handler: function (response) {
                    placeOrderToBackend("ONLINE", response.razorpay_payment_id);
                },
                prefill: {
                    name: user?.username || "Customer",
                    email: user?.email || "customer@example.com",
                    contact: selectedAddress?.mobile || "9999999999",
                },
                theme: { color: "#131921" },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);

            paymentObject.on('payment.failed', function (response) {
                alert(`Payment Failed: ${response.error.description}`);
                setLoading(false);
            });

            paymentObject.open();

        } catch (error) {
            console.error(error);
            alert("Error connecting to payment gateway.");
            setLoading(false);
        }
    };

    if (checkoutItems.length === 0 && !orderSuccess) return null;

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <PageNavigation />
            {(loading || orderSuccess) && (
                <div style={styles.overlayFixed}>
                    {!orderSuccess ? (
                        <div style={styles.loaderBox}>
                            <div style={styles.spinner}></div>
                            <h2 style={styles.loaderTitle}>Processing...</h2>
                            <p style={styles.loaderSub}>Securing your soulful companion.</p>
                        </div>
                    ) : (
                        <div style={styles.loaderBox}>
                            <span style={styles.successIcon}>✅</span>
                            <h2 style={styles.loaderTitle}>Order Placed Successfully!</h2>
                            <p style={styles.loaderSub}>Redirecting to your adoption history...</p>
                        </div>
                    )}
                </div>
            )}

            <div style={styles.content}>
                <div style={styles.layout}>

                    <div style={styles.cardMain}>
                        <h2 style={styles.mainTitle}>Secure Checkout</h2>

                        <section style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <h3 style={styles.sectionTitle}>1. Delivery & Contact</h3>
                                <div style={{display: 'flex', gap: '10px'}}>
                                    {!isEditing && allAddresses.length > 0 && (
                                        <button style={styles.textBtn} onClick={() => setShowAddressPicker(true)}>Change</button>
                                    )}
                                    <button style={styles.editBtn} onClick={() => {
                                        setTempAddress({fullName: user?.username || '', mobile: '', houseDetails: '', areaLocality: '', city: '', pincode: '', addressType: 'HOME'});
                                        setIsEditing(true);
                                    }}>+ New Address</button>
                                </div>
                            </div>

                            {/* THE ADDRESS FORM */}
                            {isEditing ? (
                                <div style={styles.form}>
                                    <div style={styles.alertBox}>⚠️ You must save this location before paying.</div>
                                    <input style={styles.input} placeholder="Recipient Name" value={tempAddress.fullName} onChange={e => setTempAddress({...tempAddress, fullName: e.target.value})} />
                                    <div style={styles.row}>
                                        <input style={styles.input} placeholder="Mobile" value={tempAddress.mobile} onChange={e => setTempAddress({...tempAddress, mobile: e.target.value})} />
                                        <input style={styles.input} placeholder="Pincode" value={tempAddress.pincode} onChange={e => setTempAddress({...tempAddress, pincode: e.target.value})} />
                                    </div>
                                    <input style={styles.input} placeholder="City" value={tempAddress.city} onChange={e => setTempAddress({...tempAddress, city: e.target.value})} />
                                    <input style={styles.input} placeholder="House / Flat / Area Details" value={tempAddress.houseDetails} onChange={e => setTempAddress({...tempAddress, houseDetails: e.target.value})} />
                                    <input style={styles.input} placeholder="Area / Locality" value={tempAddress.areaLocality} onChange={e => setTempAddress({...tempAddress, areaLocality: e.target.value})} />

                                    <button style={styles.saveBtn} onClick={handleSaveAddress} disabled={loading}>
                                        Confirm This Location
                                    </button>

                                    {allAddresses.length > 0 && (
                                        <button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                                    )}
                                </div>
                            ) : selectedAddress ? (
                                <div style={styles.selectedAddressBox}>
                                    <span style={styles.badge}>{selectedAddress.addressType}</span>
                                    <p style={styles.addrName}>{selectedAddress.fullName}</p>
                                    <p style={styles.addrText}>{selectedAddress.houseDetails}, {selectedAddress.areaLocality}</p>
                                    <p style={styles.addrText}>{selectedAddress.city} - {selectedAddress.pincode}</p>
                                    <p style={styles.addrPhone}>📞 {selectedAddress.mobile}</p>
                                </div>
                            ) : (
                                <p style={styles.loadingText}>Loading saved boutique locations...</p>
                            )}
                        </section>

                        <section style={styles.section}>
                            <h3 style={styles.sectionTitle}>2. Payment Gateway</h3>

                            {/* ✨ Streamlined Online/COD Grid */}
                            <div style={styles.payGrid}>
                                {['ONLINE', 'COD'].map(method => (
                                    <div
                                        key={method}
                                        style={{...styles.payCard, border: paymentMethod === method ? '2.5px solid #FF9900' : '1px solid #EAEAEA'}}
                                        onClick={() => setPaymentMethod(method)}
                                    >
                                        <span style={styles.payIcon}>{method === 'ONLINE' ? '💳' : '💵'}</span>
                                        <span style={styles.payName}>{method === 'ONLINE' ? 'Pay Online (Razorpay)' : 'Cash on Delivery'}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.payDetails}>
                                {paymentMethod === 'ONLINE' && (
                                    <div style={{textAlign: 'center'}}>
                                        <p style={styles.codText}>Securely pay using UPI, Credit/Debit Cards, Netbanking, or Wallets.</p>
                                        <button style={{...styles.finalBtn, backgroundColor: '#3399cc'}} onClick={handleRazorpayPayment} disabled={loading || isEditing}>
                                            Pay ₹{finalTotalAmount.toLocaleString()} Securely
                                        </button>
                                        <div style={{marginTop: '15px', fontSize: '0.8rem', color: '#B2BEC3'}}>🔒 Secured by Razorpay</div>
                                    </div>
                                )}
                                {paymentMethod === 'COD' && (
                                    <div style={{textAlign: 'center'}}>
                                        <p style={styles.codText}>Cash on Delivery: Inspect your pet's health upon arrival before paying the boutique partner.</p>
                                        <button style={styles.finalBtn} onClick={handleCODPayment} disabled={loading || isEditing}>
                                            Place COD Order
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div style={styles.cardSide}>
                        <h3 style={styles.sideTitle}>Adoption Summary</h3>

                        <div style={styles.itemList}>
                            {processedItems.map((item, i) => (
                                <div key={i} style={styles.itemRowWrapper}>
                                    <div style={styles.itemRow}>
                                        <span style={styles.itemBreed}>{item.breed?.toUpperCase() || item.name}</span>
                                        <span>₹{item.finalPrice.toLocaleString()}</span>
                                    </div>
                                    {item.discount > 0 && (
                                        <p style={styles.itemDiscountText}>
                                            (Original: <span style={{textDecoration: 'line-through'}}>₹{item.basePrice.toLocaleString()}</span> • {item.discount}% OFF)
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={styles.summaryBreakdown}>
                            <div style={styles.breakdownRow}>
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div style={styles.breakdownRow}>
                                <span>Total Savings</span>
                                <span style={{color: '#00CEC9'}}>- ₹{totalSavings.toLocaleString()}</span>
                            </div>
                            <div style={styles.breakdownRow}>
                                <span>Health Verification</span>
                                <span style={{color: '#00CEC9'}}>FREE</span>
                            </div>
                        </div>

                        <div style={styles.totalRow}>
                            <span>Final Total</span>
                            <span>₹{finalTotalAmount.toLocaleString()}</span>
                        </div>
                        <p style={styles.taxNote}>*All boutique taxes and health certification included.</p>
                    </div>
                </div>
            </div>

            {showAddressPicker && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={{margin: '0 0 20px 0'}}>Choose Delivery Location</h3>
                        <div style={styles.pickerList}>
                            {allAddresses.map(addr => (
                                <div
                                    key={addr.addressId}
                                    style={{...styles.pickerCard, border: selectedAddress?.addressId === addr.addressId ? '2px solid #FF9900' : '1px solid #EAEAEA'}}
                                    onClick={() => { setSelectedAddress(addr); setShowAddressPicker(false); setIsEditing(false); }}
                                >
                                    <strong>{addr.fullName} ({addr.addressType})</strong>
                                    <p style={{margin: '5px 0 0', fontSize: '0.85rem', color: '#636E72'}}>{addr.houseDetails}, {addr.pincode}</p>
                                </div>
                            ))}
                        </div>
                        <button style={styles.closeBtn} onClick={() => setShowAddressPicker(false)}>Close</button>
                    </div>
                </div>
            )}
            <SubFooter user={user} setUser={setUser} cart={cart} />
        </div>
    );
};

const styles = {
    // Basic Page Styles
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    overlayFixed: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(19, 25, 33, 0.98)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
    loaderBox: { textAlign: 'center', color: '#fff' },
    spinner: { width: '60px', height: '60px', border: '6px solid #FF9900', borderTop: '6px solid transparent', borderRadius: '50%', margin: '0 auto 25px', animation: 'spin 1s linear infinite' },
    successIcon: { fontSize: '5.5rem', display: 'block', marginBottom: '20px' },
    loaderTitle: { fontSize: '2.4rem', fontWeight: '900', margin: '0 0 10px 0' },
    loaderSub: { fontSize: '1.2rem', color: '#B2BEC3' },

    // Layout
    content: { padding: '60px 5%', display: 'flex', justifyContent: 'center' },
    layout: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', maxWidth: '1200px', width: '100%' },
    cardMain: { backgroundColor: '#fff', padding: '40px', borderRadius: '30px', border: '1px solid #EAEAEA', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' },
    mainTitle: { fontSize: '2rem', fontWeight: '900', marginBottom: '35px', color: '#131921' },
    section: { marginBottom: '45px' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    sectionTitle: { fontSize: '0.9rem', fontWeight: '800', color: '#B2BEC3', textTransform: 'uppercase', letterSpacing: '1px' },

    // Buttons & Inputs
    textBtn: { background: 'none', border: 'none', color: '#131921', textDecoration: 'underline', fontWeight: '700', cursor: 'pointer' },
    editBtn: { color: '#FF9900', background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer' },
    input: { padding: '16px', borderRadius: '14px', border: '1.5px solid #EAEAEA', width: '100%', marginBottom: '15px', boxSizing: 'border-box', backgroundColor: '#F9FAFB', outline: 'none' },
    row: { display: 'flex', gap: '15px' },
    saveBtn: { padding: '16px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', width: '100%', marginTop: '10px' },
    cancelBtn: { padding: '16px', backgroundColor: 'transparent', color: '#636E72', border: 'none', fontWeight: '800', cursor: 'pointer', width: '100%', marginTop: '5px' },
    alertBox: { backgroundColor: '#FFF4E5', color: '#D97706', padding: '15px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '20px', textAlign: 'center', border: '1px solid #FCD34D' },

    // Selected Address Box
    selectedAddressBox: { padding: '25px', background: '#F9FAFB', borderRadius: '20px', border: '1.5px solid #EAEAEA', position: 'relative' },
    badge: { position: 'absolute', top: '15px', right: '15px', background: '#131921', color: '#fff', fontSize: '0.6rem', padding: '4px 12px', borderRadius: '50px', fontWeight: '800' },
    addrName: { fontSize: '1.1rem', fontWeight: '800', margin: '0 0 10px 0' },
    addrText: { fontSize: '0.95rem', color: '#636E72', margin: '3px 0' },
    addrPhone: { marginTop: '15px', fontWeight: '700', color: '#131921' },

    // ✨ Payment Grid specific to 2 options (ONLINE / COD)
    payGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' },
    payCard: { textAlign: 'center', padding: '20px', borderRadius: '20px', cursor: 'pointer', backgroundColor: '#F9FAFB', transition: 'all 0.2s ease' },
    payIcon: { fontSize: '2rem', display: 'block', marginBottom: '10px' },
    payName: { fontWeight: '800', fontSize: '0.9rem' },

    payDetails: { padding: '30px', borderRadius: '25px', border: '1.5px solid #EAEAEA', background: '#fff' },
    finalBtn: { width: '100%', padding: '18px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem', transition: 'transform 0.1s' },
    codText: { color: '#636E72', fontWeight: '600', marginBottom: '20px', lineHeight: '1.5' },

    // Sidebar
    cardSide: { backgroundColor: '#131921', padding: '40px', borderRadius: '35px', color: '#fff', height: 'fit-content' },
    sideTitle: { color: '#FF9900', fontWeight: '900', fontSize: '1.4rem', marginBottom: '30px' },
    itemList: { marginBottom: '25px' },
    itemRowWrapper: { marginBottom: '18px' },
    itemRow: { display: 'flex', justifyContent: 'space-between', color: '#FFF', fontWeight: '700', fontSize: '1rem' },
    itemBreed: { maxWidth: '70%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    itemDiscountText: { margin: '4px 0 0 0', fontSize: '0.75rem', color: '#00CEC9', fontWeight: '600' },
    summaryBreakdown: { borderTop: '1px solid #333', borderBottom: '1px solid #333', padding: '20px 0', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' },
    breakdownRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#B2BEC3', fontWeight: '600' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '1.7rem' },
    taxNote: { fontSize: '0.7rem', color: '#636E72', marginTop: '20px', textAlign: 'center' },

    // Modals
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#fff', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '450px' },
    pickerList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px', maxHeight: '300px', overflowY: 'auto' },
    pickerCard: { padding: '15px', borderRadius: '15px', cursor: 'pointer', background: '#F9FAFB' },
    closeBtn: { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#EAEAEA', fontWeight: '800', cursor: 'pointer' },
    loadingText: { color: '#636E72', fontSize: '0.95rem', fontStyle: 'italic' }
};

export default Checkout;