import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';

const VendorSignup = ({ user, setUser, cart }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '', storeName: '', phoneNumber: '', email: '', address: '', upiId: '', otp: ''
    });
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const pinInputRef = useRef(null);
    const API = `http://${window.location.hostname}:8090/api/vendors`;

    useEffect(() => {
        if (step === 2 && pinInputRef.current) {
            pinInputRef.current.focus();
        }
    }, [step]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/send-signup-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: formData.phoneNumber,
                    email: formData.email
                })
            });
            if (res.ok) {
                setFormData(prev => ({ ...prev, otp: '' }));
                setStep(2);
                setMsg("Security PIN sent successfully to your boutique email!");
            } else {
                const errorText = await res.text();
                setMsg(errorText || "Registration eligibility check failed.");
            }
        } catch (err) {
            setMsg("Network connection error.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API}/verify-signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMsg("Boutique registered successfully! Redirecting...");
                setTimeout(() => navigate('/vendor-login'), 2000);
            } else {
                // ✨ CRITICAL FIX: Read the exact error text sent by Spring Boot
                const errorText = await res.text();
                setMsg(errorText || "Verification failed.");
            }
        } catch (err) {
            setMsg("Account creation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            <main style={styles.mainWrapper}>
                <div style={styles.card}>
                    <div style={styles.brandHeader}>
                        <div style={styles.badgeWrapper}>
                            <span style={styles.badgeIcon}>🏪</span>
                        </div>
                        <h2 style={styles.logo}>
                            PAWS<span style={{color: '#FF9900'}}>&</span>PALETTE
                        </h2>
                        <div style={styles.portalTag}>BOUTIQUE PARTNER APPLICATION</div>
                        <p style={styles.subtitle}>{step === 1 ? 'Register your storefront' : 'Confirm boutique details'}</p>
                    </div>

                    <div style={styles.formContent}>
                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} style={styles.form}>
                                <div style={styles.row}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Owner Name</label>
                                        <input name="username" placeholder="Full Name" style={styles.input} value={formData.username} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Store Name</label>
                                        <input name="storeName" placeholder="Boutique Name" style={styles.input} value={formData.storeName} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Mobile Number</label>
                                    <div style={styles.inputContainer}>
                                        <span style={styles.prefix}>+91</span>
                                        <input name="phoneNumber" placeholder="10-digit number" style={styles.inputNoBorder} value={formData.phoneNumber} onChange={handleChange} required maxLength="10" />
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Email Address</label>
                                    <input name="email" type="email" placeholder="boutique@example.com" style={styles.input} value={formData.email} onChange={handleChange} required />
                                </div>

                                <div style={styles.row}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>UPI ID</label>
                                        <input name="upiId" placeholder="merchant@upi" style={styles.input} value={formData.upiId} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>City</label>
                                        <input name="address" placeholder="Hyderabad" style={styles.input} value={formData.address} onChange={handleChange} required />
                                    </div>
                                </div>

                                <button type="submit" style={styles.primaryBtn} disabled={loading}>
                                    {loading ? 'Processing Application...' : 'Apply for Access PIN'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifySignup} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Verification PIN</label>
                                    <input
                                        ref={pinInputRef}
                                        type="password"
                                        name="otp"
                                        placeholder="••••"
                                        style={styles.pinInput}
                                        value={formData.otp}
                                        onChange={handleChange}
                                        required
                                        maxLength="4"
                                        autoComplete="off"
                                    />
                                </div>
                                <button type="submit" style={styles.primaryBtn} disabled={loading}>
                                    {loading ? 'Verifying...' : 'Launch Storefront'}
                                </button>
                                <button type="button" onClick={() => setStep(1)} style={styles.changeBtn}>
                                    ← Back to Information
                                </button>
                            </form>
                        )}

                        {msg && (
                            <div style={{
                                ...styles.alert,
                                color: msg.includes("successful") ? '#10b981' : '#ef4444',
                                backgroundColor: msg.includes("successful") ? '#f0fdf4' : '#fef2f2'
                            }}>
                                {msg}
                            </div>
                        )}
                    </div>

                    <div style={styles.cardFooter}>
                        <p style={styles.footerText}>Already have a partner account?</p>
                        <Link to="/vendor-login" style={styles.link}>Sign In to Partner Portal</Link>
                    </div>
                </div>

                <button onClick={() => navigate('/')} style={styles.closeBtn}>✕ Return to Discovery Center</button>
            </main>
        </div>
    );
};

const styles = {
    page: { background: '#F9FAFB', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    mainWrapper: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' },
    card: { width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', border: '1px solid #EAEAEA', overflow: 'hidden' },
    brandHeader: { padding: '40px 40px 20px 40px', textAlign: 'center' },
    badgeWrapper: { width: '50px', height: '50px', backgroundColor: '#F9FAFB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', fontSize: '1.3rem' },
    logo: { fontSize: '1.5rem', fontWeight: '900', color: '#131921', margin: 0, letterSpacing: '-0.5px' },
    portalTag: { fontSize: '0.65rem', color: '#FF9900', fontWeight: '900', letterSpacing: '2px', marginTop: '5px' },
    subtitle: { fontSize: '0.85rem', color: '#64748b', marginTop: '10px' },
    formContent: { padding: '0 40px 30px 40px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    row: { display: 'flex', gap: '15px', width: '100%' },
    inputGroup: { textAlign: 'left', flex: 1 },
    label: { fontSize: '0.75rem', fontWeight: '800', color: '#131921', marginBottom: '8px', display: 'block', textTransform: 'uppercase' },
    input: { width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px solid #EAEAEA', backgroundColor: '#F9FAFB', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' },
    inputContainer: { display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1.5px solid #EAEAEA', borderRadius: '14px', overflow: 'hidden' },
    prefix: { padding: '0 15px', color: '#131921', fontSize: '0.95rem', borderRight: '1px solid #EAEAEA', fontWeight: '700' },
    inputNoBorder: { flex: 1, padding: '14px', border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent' },
    pinInput: { width: '100%', padding: '16px', borderRadius: '14px', border: '2px solid #FF9900', fontSize: '1.8rem', textAlign: 'center', letterSpacing: '12px', background: '#FFFAF5', outline: 'none', fontWeight: '900' },
    primaryBtn: { width: '100%', padding: '18px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', marginTop: '10px' },
    changeBtn: { background: 'none', border: 'none', color: '#B2BEC3', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', marginTop: '-5px' },
    alert: { fontSize: '0.85rem', fontWeight: '700', padding: '12px', borderRadius: '10px', marginTop: '15px', textAlign: 'center' },
    cardFooter: { padding: '30px 40px', backgroundColor: '#F9FAFB', borderTop: '1px solid #EAEAEA', textAlign: 'center' },
    footerText: { fontSize: '0.85rem', color: '#636E72', margin: '0 0 5px 0' },
    link: { color: '#FF9900', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem' },
    closeBtn: { marginTop: '30px', background: 'none', border: 'none', color: '#B2BEC3', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }
};

export default VendorSignup;