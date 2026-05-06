import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';

const Signup = ({ user, setUser, cart }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '', phoneNumber: '', email: '', gender: '', dob: '', otp: ''
    });
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API = `http://${window.location.hostname}:8090/api/users`;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const res = await fetch(`${API}/send-signup-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: formData.phoneNumber, email: formData.email })
            });

            if (res.ok) {
                setFormData(prev => ({ ...prev, otp: '' }));
                setStep(2);
                setMsg("Security PIN sent! Please check your email.");
            } else if (res.status === 409) {
                // ✨ FIX: Catch the 409 here if your backend checks duplicates early
                setMsg("An account with this email or phone already exists. Please log in.");
            } else {
                setMsg("Failed to send PIN. Please check your details.");
            }
        } catch (err) {
            setMsg("Connection Error. Try again later.");
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
                    setMsg("✅ Membership approved! Redirecting to login...");

                    // ✨ FIX: Shortened timeout and forced navigation
                    setTimeout(() => {
                        navigate('/login', { replace: true });

                        // Bulletproof Fallback: If React Router fails, force the browser window to change
                        if (window.location.pathname !== '/login') {
                            window.location.href = '/login';
                        }
                    }, 800); // Only wait 0.8 seconds now

                } else if (res.status === 409) {
                    setMsg("Account already exists! Please log in.");
                } else {
                    setMsg("❌ Invalid PIN. Please try again.");
                }
            } catch (err) {
                setMsg("Registration failed. Please check your connection.");
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
                            <span style={styles.badgeIcon}>✨</span>
                        </div>
                        <h2 style={styles.logo}>
                            PAWS<span style={{color: '#FF9900'}}>&</span>PALETTE
                        </h2>
                        <p style={styles.subtitle}>
                            {step === 1 ? 'MEMBERSHIP APPLICATION' : 'EMAIL VERIFICATION'}
                        </p>
                    </div>

                    <div style={styles.formContent}>
                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Full Name</label>
                                    <input name="username" placeholder="Enter Name" style={styles.input} value={formData.username} onChange={handleChange} required />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Phone Number</label>
                                    <div style={styles.inputContainer}>
                                        <span style={styles.prefix}>+91</span>
                                        <input name="phoneNumber" placeholder="10-digit number" style={styles.inputNoBorder} value={formData.phoneNumber} onChange={handleChange} required maxLength="10" />
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Email Address</label>
                                    <input name="email" type="email" placeholder="name@luxury.com" style={styles.input} value={formData.email} onChange={handleChange} required />
                                </div>

                                <div style={styles.row}>
                                    <div style={styles.halfGroup}>
                                        <label style={styles.label}>Gender</label>
                                        <div style={styles.selectWrapper}>
                                            <select name="gender" style={styles.select} value={formData.gender} onChange={handleChange} required>
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={styles.halfGroup}>
                                        <label style={styles.label}>Birth Date</label>
                                        <div style={styles.dateInputWrapper}>
                                            <input
                                                name="dob"
                                                type="date"
                                                style={styles.dateInput}
                                                value={formData.dob}
                                                onChange={handleChange}
                                                required
                                            />
                                            <span style={styles.calendarIcon}>📅</span>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" style={styles.primaryBtn} disabled={loading}>
                                    {loading ? 'Processing...' : 'Apply for Access'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifySignup} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Security PIN</label>
                                    <input
                                        type="password"
                                        name="otp"
                                        placeholder="••••"
                                        style={styles.pinInput}
                                        value={formData.otp}
                                        onChange={handleChange}
                                        required
                                        maxLength="4"
                                        autoFocus
                                        autoComplete="off"
                                    />
                                </div>
                                <button type="submit" style={styles.primaryBtn} disabled={loading}>
                                    {loading ? 'Verifying...' : 'Complete Registration'}
                                </button>
                                <button type="button" onClick={() => setStep(1)} style={styles.changeBtn}>
                                    Edit Details
                                </button>
                            </form>
                        )}

                        {msg && (
                            <div style={{
                                ...styles.alert,
                                color: msg.includes("successfully") || msg.includes("approved") ? '#10b981' : '#ef4444',
                                backgroundColor: msg.includes("successfully") || msg.includes("approved") ? '#f0fdf4' : '#fef2f2'
                            }}>
                                {msg}
                            </div>
                        )}
                    </div>

                    <div style={styles.cardFooter}>
                        <p style={styles.footerText}>Already part of the Palette?</p>
                        <Link to="/login" style={styles.link}>Sign In to Member Profile</Link>
                    </div>
                </div>

                <button onClick={() => navigate('/')} style={styles.closeBtn}>Return to Discovery Center</button>
            </main>
        </div>
    );
};

const styles = {
    page: {
        background: '#F9FAFB',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    mainWrapper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
    },
    card: {
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #EAEAEA',
        overflow: 'hidden',
    },
    brandHeader: {
        padding: '40px 40px 20px 40px',
        textAlign: 'center'
    },
    badgeWrapper: {
        width: '45px',
        height: '45px',
        backgroundColor: '#F9FAFB',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 15px auto',
        fontSize: '1.2rem'
    },
    logo: { fontSize: '1.5rem', fontWeight: '900', color: '#131921', margin: 0, letterSpacing: '-0.5px' },
    subtitle: { fontSize: '0.7rem', color: '#B2BEC3', marginTop: '8px', fontWeight: '800', letterSpacing: '2px' },
    formContent: { padding: '0 40px 30px 40px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' },

    inputGroup: { textAlign: 'left', width: '100%' },
    halfGroup: { flex: 1, textAlign: 'left' },
    label: { fontSize: '0.75rem', fontWeight: '800', color: '#131921', marginBottom: '8px', display: 'block', textTransform: 'uppercase' },

    input: { width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px solid #EAEAEA', backgroundColor: '#F9FAFB', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
    inputContainer: { display: 'flex', alignItems: 'center', background: '#F9FAFB', border: '1.5px solid #EAEAEA', borderRadius: '14px', overflow: 'hidden' },
    prefix: { padding: '0 15px', color: '#131921', fontSize: '0.95rem', borderRight: '1px solid #EAEAEA', fontWeight: '700' },
    inputNoBorder: { flex: 1, padding: '14px', border: 'none', outline: 'none', fontSize: '0.95rem', background: 'transparent' },

    row: { display: 'flex', gap: '15px', width: '100%' },

    selectWrapper: { position: 'relative' },
    select: {
        width: '100%',
        padding: '14px',
        borderRadius: '14px',
        border: '1.5px solid #EAEAEA',
        backgroundColor: '#F9FAFB',
        fontSize: '0.95rem',
        outline: 'none',
        appearance: 'none',
        cursor: 'pointer'
    },

    dateInputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        border: '1.5px solid #EAEAEA',
        borderRadius: '14px',
        overflow: 'hidden'
    },
    dateInput: {
        width: '100%',
        padding: '14px',
        border: 'none',
        backgroundColor: 'transparent',
        fontSize: '0.95rem',
        outline: 'none',
        cursor: 'pointer',
        color: '#131921',
        fontFamily: 'inherit'
    },
    calendarIcon: {
        position: 'absolute',
        right: '12px',
        pointerEvents: 'none',
        fontSize: '1rem',
        opacity: 0.6
    },

    pinInput: { width: '100%', padding: '16px', borderRadius: '14px', border: '2px solid #FF9900', fontSize: '1.8rem', textAlign: 'center', letterSpacing: '12px', background: '#FFFAF5', outline: 'none', fontWeight: '900' },
    primaryBtn: { width: '100%', padding: '18px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', marginTop: '10px' },
    changeBtn: { background: 'none', border: 'none', color: '#B2BEC3', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', marginTop: '-5px' },
    alert: { fontSize: '0.85rem', fontWeight: '700', padding: '12px', borderRadius: '10px', marginTop: '15px', textAlign: 'center' },
    cardFooter: { padding: '30px 40px', backgroundColor: '#F9FAFB', borderTop: '1px solid #EAEAEA', textAlign: 'center' },
    footerText: { fontSize: '0.85rem', color: '#636E72', margin: '0 0 5px 0', fontWeight: '500' },
    link: { color: '#FF9900', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem' },
    closeBtn: { marginTop: '30px', background: 'none', border: 'none', color: '#B2BEC3', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px' }
};

export default Signup;