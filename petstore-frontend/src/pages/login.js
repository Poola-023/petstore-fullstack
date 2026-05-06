import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';


const Login = ({ user, setUser, cart }) => {
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API = `http://${window.location.hostname}:8090/api/users`;

    // ✨ HELPER: Capture Device Info for the Security Email
    const getDeviceInfo = () => {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) return "Android Mobile";
        if (/iPhone|iPad|iPod/i.test(ua)) return "iOS Device";
        if (/Windows/i.test(ua)) return "Windows PC";
        if (/Macintosh/i.test(ua)) return "MacBook / iMac";
        return "Web Browser";
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/send-login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });
            if (res.ok) {
                setStep(2);
                setMsg("Security PIN sent successfully!");
            } else {
                setMsg("Account not found in our boutique records.");
            }
        } catch (err) {
            setMsg("Network connection error.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // ✨ Capture device info for the new notification feature
        const deviceInfo = getDeviceInfo();

        try {
            const res = await fetch(`${API}/verify-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber,
                    otp,
                    deviceInfo // ✨ Backend can now use this for the email
                })
            });

            if (res.ok) {
                const data = await res.json();

                // Save JWT and Lean User data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setUser(data.user);

                // Navigate back to where they came from or home
                navigate('/');
            } else {
                setMsg("Invalid PIN. Please try again.");
            }
        } catch (err) {
            setMsg("Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            <main style={styles.mainWrapper}>
                <div style={styles.loginCard}>
                    <div style={styles.brandHeader}>
                        <div style={styles.badgeWrapper}>
                            <span style={styles.badgeIcon}>{step === 1 ? '🔐' : '🛡️'}</span>
                        </div>
                        <h2 style={styles.logo}>
                            PAWS<span style={{ color: '#FF9900' }}>&</span>PALETTE
                        </h2>
                        <p style={styles.subtitle}>
                            {step === 1 ? 'MEMBER ACCESS' : 'SECURITY VERIFICATION'}
                        </p>
                    </div>

                    <div style={styles.formContent}>
                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Registered Mobile</label>
                                    <div style={styles.inputContainer}>
                                        <span style={styles.prefix}>+91</span>
                                        <input
                                            type="tel"
                                            placeholder="Enter 10 digits"
                                            style={styles.input}
                                            value={phoneNumber}
                                            onChange={e => setPhoneNumber(e.target.value)}
                                            required
                                            maxLength="10"
                                        />
                                    </div>
                                </div>
                                <button type="submit" style={styles.primaryBtn} disabled={loading}>
                                    {loading ? 'Processing...' : 'Verify Identity'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleLogin} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Boutique PIN</label>
                                    <div style={styles.otpWrapper}>
                                        <input
                                            type="password"
                                            placeholder="••••"
                                            style={styles.pinInput}
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            required
                                            maxLength="4"
                                            autoFocus
                                        />
                                        <p style={styles.otpHint}>Security code sent to your device</p>
                                    </div>
                                </div>
                                <button type="submit" style={styles.primaryBtn} disabled={loading}>
                                    {loading ? 'Authenticating...' : 'Confirm & Sign In'}
                                </button>
                                <button type="button" onClick={() => setStep(1)} style={styles.changeBtn}>
                                    Edit Phone Number
                                </button>
                            </form>
                        )}

                        {msg && (
                            <div style={{
                                ...styles.alert,
                                color: msg.includes("successfully") ? '#10b981' : '#ef4444',
                                backgroundColor: msg.includes("successfully") ? '#f0fdf4' : '#fef2f2'
                            }}>
                                {msg}
                            </div>
                        )}
                    </div>

                    <div style={styles.cardFooter}>
                        <p style={styles.footerText}>New to our Hub?</p>
                        <Link to="/signup" style={styles.signupLink}>Apply for Membership</Link>
                    </div>
                </div>

                <button onClick={() => navigate('/')} style={styles.closeBtn}>
                    Return to Discovery Center
                </button>
            </main>
        </div>
    );
};

const styles = {
    page: { background: '#F9FAFB', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    mainWrapper: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' },
    loginCard: { width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', border: '1px solid #EAEAEA', overflow: 'hidden' },
    brandHeader: { padding: '45px 40px 20px 40px', textAlign: 'center' },
    badgeWrapper: { width: '50px', height: '50px', backgroundColor: '#F9FAFB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '1.2rem' },
    logo: { fontSize: '1.5rem', fontWeight: '900', color: '#131921', margin: 0, letterSpacing: '-0.5px' },
    subtitle: { fontSize: '0.7rem', color: '#B2BEC3', marginTop: '8px', fontWeight: '800', letterSpacing: '2px' },
    formContent: { padding: '0 40px 30px 40px' },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputGroup: { textAlign: 'left' },
    label: { fontSize: '0.75rem', fontWeight: '800', color: '#131921', marginBottom: '10px', display: 'block', textTransform: 'uppercase' },
    inputContainer: { display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1.5px solid #EAEAEA', borderRadius: '14px', overflow: 'hidden' },
    prefix: { padding: '0 15px', color: '#131921', fontSize: '0.95rem', borderRight: '1px solid #EAEAEA', fontWeight: '700' },
    input: { flex: 1, padding: '16px', border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent', width: '100%' },
    otpWrapper: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' },
    pinInput: { width: '100%', padding: '18px', borderRadius: '16px', border: '2px solid #FF9900', fontSize: '2rem', textAlign: 'center', letterSpacing: '14px', background: '#FFFAF5', outline: 'none', fontWeight: '900', boxShadow: '0 4px 12px rgba(255, 153, 0, 0.08)' },
    otpHint: { fontSize: '0.75rem', color: '#636E72', margin: 0, fontWeight: '500', textAlign: 'center' },
    primaryBtn: { width: '100%', padding: '18px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
    changeBtn: { background: 'none', border: 'none', color: '#B2BEC3', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', marginTop: '-10px' },
    alert: { fontSize: '0.85rem', fontWeight: '700', padding: '12px', borderRadius: '10px', marginTop: '20px', textAlign: 'center' },
    cardFooter: { padding: '30px 40px', backgroundColor: '#F9FAFB', borderTop: '1px solid #EAEAEA', textAlign: 'center' },
    footerText: { fontSize: '0.85rem', color: '#636E72', margin: '0 0 5px 0', fontWeight: '500' },
    signupLink: { color: '#FF9900', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem' },
    closeBtn: { marginTop: '30px', background: 'none', border: 'none', color: '#B2BEC3', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }
};

export default Login;