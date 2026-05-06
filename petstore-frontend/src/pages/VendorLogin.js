import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';

const VendorLogin = ({ user, setUser, cart }) => {
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API = `http://${window.location.hostname}:8090/api/vendors`;

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });
            if (res.ok) {
                setStep(2);
                setMsg("Security PIN sent to your registered email.");
            } else {
                setMsg("Partner record not found.");
            }
        } catch (err) {
            setMsg("Network connection error.");
        } finally {
            setLoading(false);
        }
    };

    // ✨ FIXED CONSOLIDATED LOGIN HANDLER
    // ✨ FIXED CONSOLIDATED LOGIN HANDLER
        const handleVerifyLogin = async (e) => {
            e.preventDefault();
            setLoading(true);
            setMsg("");
            try {
                const res = await fetch(`${API}/verify-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber, otp })
                });

                if (res.ok) {
                    const data = await res.json(); // Expected: { token: '...', user: {...} }

                    if (data.token) {
                        // 1. Store the JWT Token string
                        localStorage.setItem('token', data.token);

                        // ✨ CRITICAL FIX: Destructure the user object to remove heavy Base64 images
                        // This prevents the QuotaExceededError crash!
                        const { storeImg, banner, profileImg, ...leanUser } = data.user;

                        // 2. Prepare lightweight user object with role for ProtectedRoute
                        const vendorSession = {
                            ...leanUser, // Use the lean user without the heavy images
                            role: 'VENDOR',
                            userId: leanUser.id || leanUser.vendorId
                        };

                        // 3. Save lightweight User to Storage and State
                        localStorage.setItem('user', JSON.stringify(vendorSession));
                        setUser(vendorSession);

                        // 4. Success! Navigate to Dashboard
                        navigate('/vendor-dashboard');
                    } else {
                        setMsg("Authentication error: No token received.");
                    }
                } else {
                    const errorText = await res.text();
                    setMsg(errorText || "Invalid PIN. Access denied.");
                }
            } catch (err) {
                console.error("Login Error:", err);
                setMsg("Authentication failed. Server unreachable.");
            } finally {
                setLoading(false);
            }
        };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <main style={styles.mainWrapper}>
                <div style={styles.loginCard}>
                    <div style={styles.header}>
                        <div style={styles.badgeWrapper}><span style={styles.badgeIcon}>💼</span></div>
                        <h2 style={styles.logo}>PAWS<span style={{color: '#FF9900'}}>&</span>PALETTE</h2>
                        <div style={styles.portalTag}>BOUTIQUE PARTNER PORTAL</div>
                        <p style={styles.subtitle}>{step === 1 ? 'Authorized Access Only' : 'Security Verification'}</p>
                    </div>

                    <div style={styles.formContent}>
                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Registered Mobile</label>
                                    <div style={styles.inputContainer}>
                                        <span style={styles.prefix}>+91</span>
                                        <input type="tel" placeholder="10 digits" style={styles.input} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required maxLength="10" />
                                    </div>
                                </div>
                                <button type="submit" style={styles.primaryBtn} disabled={loading}>{loading ? 'Processing...' : 'Request Access PIN'}</button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyLogin} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Enter Boutique PIN</label>
                                    <input type="password" placeholder="••••" style={styles.pinInput} value={otp} onChange={e => setOtp(e.target.value)} required maxLength="4" autoFocus />
                                </div>
                                <button type="submit" style={styles.primaryBtn} disabled={loading}>{loading ? 'Verifying...' : 'Access Dashboard'}</button>
                                <button type="button" onClick={() => setStep(1)} style={styles.changeBtn}>Edit Phone Number</button>
                            </form>
                        )}
                        {msg && (
                            <div style={{ ...styles.alert, color: msg.includes("sent") ? '#10b981' : '#ef4444', backgroundColor: msg.includes("sent") ? '#f0fdf4' : '#fef2f2' }}>
                                {msg}
                            </div>
                        )}
                    </div>
                    <div style={styles.cardFooter}>
                        <p style={styles.footerText}>Want to partner with us?</p>
                        <Link to="/vendor-signup" style={styles.signupLink}>Register Your Boutique</Link>
                    </div>
                </div>
                <button onClick={() => navigate('/')} style={styles.closeBtn}>✕ Close Portal</button>
            </main>
        </div>
    );
};

const styles = {
    page: { background: '#F9FAFB', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    mainWrapper: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' },
    loginCard: { width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', border: '1px solid #EAEAEA', overflow: 'hidden', textAlign: 'center' },
    header: { padding: '45px 40px 20px 40px' },
    badgeWrapper: { width: '50px', height: '50px', backgroundColor: '#F9FAFB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '1.2rem' },
    logo: { fontSize: '1.5rem', fontWeight: '900', color: '#131921', margin: 0, letterSpacing: '-0.5px' },
    portalTag: { fontSize: '0.65rem', color: '#FF9900', fontWeight: '900', letterSpacing: '2px', marginTop: '5px' },
    subtitle: { fontSize: '0.85rem', color: '#64748b', marginTop: '10px' },
    formContent: { padding: '0 40px 30px 40px' },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputGroup: { textAlign: 'left' },
    label: { fontSize: '0.75rem', fontWeight: '800', color: '#131921', marginBottom: '10px', display: 'block', textTransform: 'uppercase' },
    inputContainer: { display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1.5px solid #EAEAEA', borderRadius: '14px', overflow: 'hidden' },
    prefix: { padding: '0 15px', color: '#131921', fontSize: '0.95rem', borderRight: '1px solid #EAEAEA', fontWeight: '700' },
    input: { flex: 1, padding: '16px', border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', width: '100%' },
    pinInput: { width: '100%', padding: '16px', borderRadius: '14px', border: '2px solid #FF9900', fontSize: '1.8rem', textAlign: 'center', letterSpacing: '12px', background: '#FFFAF5', outline: 'none', fontWeight: '900', color: '#131921' },
    primaryBtn: { width: '100%', padding: '18px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
    changeBtn: { background: 'none', border: 'none', color: '#B2BEC3', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', marginTop: '-10px' },
    alert: { fontSize: '0.85rem', fontWeight: '700', padding: '12px', borderRadius: '10px', marginTop: '20px' },
    cardFooter: { padding: '30px 40px', backgroundColor: '#F9FAFB', borderTop: '1px solid #EAEAEA' },
    footerText: { fontSize: '0.85rem', color: '#636E72', margin: '0 0 5px 0' },
    signupLink: { color: '#FF9900', textDecoration: 'none', fontWeight: '800' },
    closeBtn: { marginTop: '30px', background: 'none', border: 'none', color: '#B2BEC3', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }
};

export default VendorLogin;