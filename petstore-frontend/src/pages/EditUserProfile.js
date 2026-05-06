import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const EditUserProfile = ({ user, setUser, cart }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    // Local form state - initialized from global user prop
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        profileImg: user?.profileImg || null
    });

    // Handle session synchronization
    useEffect(() => {
        if (!user) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                setFormData({
                    username: parsed.username,
                    email: parsed.email,
                    phoneNumber: parsed.phoneNumber,
                    profileImg: parsed.profileImg
                });
            } else {
                navigate('/login');
            }
        }
    }, [user, setUser, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✨ UPDATE: Logic to read new image file
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profileImg: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // ✨ DELETE: Logic to set image to null
    const handleRemoveImage = () => {
        setFormData({ ...formData, profileImg: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        const userId = user?.userId || user?.id;

        try {
            // Sending the PUT request including the profileImg (even if null)
            const response = await fetch(`http://${window.location.hostname}:8090/api/users/update/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedUser = await response.json();

                // Sync global state and persistent storage
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setMsg({ text: 'Soulful identity updated successfully!', type: 'success' });

                // Navigate to home after brief confirmation
                setTimeout(() => navigate('/'), 1500);
            } else {
                setMsg({ text: 'Update failed. Check boutique server.', type: 'error' });
            }
        } catch (error) {
            // Offline/Fallback mode
            const updatedUser = { ...user, ...formData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMsg({ text: 'Saved locally (Server error). Redirecting...', type: 'success' });
            setTimeout(() => navigate('/'), 1500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            <main style={styles.container}>
                <div style={styles.formCard}>
                    <div style={styles.header}>
                        <h2 style={styles.title}>Refine Your Profile</h2>
                        <p style={styles.subtitle}>Curate your portrait and contact details</p>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Profile Image Area */}
                        <div style={styles.imageSection}>
                            <div style={styles.avatarWrapper}>
                                {formData.profileImg ? (
                                    <img src={formData.profileImg} alt="Preview" style={styles.avatar} />
                                ) : (
                                    <div style={styles.avatarPlaceholder}>
                                        {formData.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {/* One trigger for Update */}
                                <label style={styles.uploadBadge} title="Update Photo">
                                    📷
                                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                                </label>

                                {/* One trigger for Removal - only visible if img exists */}
                                {formData.profileImg && (
                                    <div style={styles.removeBadge} onClick={handleRemoveImage} title="Remove Photo">
                                        ✕
                                    </div>
                                )}
                            </div>
                            <p style={styles.imageNote}>Portrait Management</p>
                        </div>

                        <div style={styles.inputGrid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Member Name</label>
                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Boutique Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Verified Phone</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                    maxLength="10"
                                />
                            </div>
                        </div>

                        {msg.text && (
                            <div style={{
                                ...styles.alert,
                                backgroundColor: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                                color: msg.type === 'success' ? '#16A34A' : '#DC2626'
                            }}>
                                {msg.text}
                            </div>
                        )}

                        <div style={styles.actionRow}>
                            <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>
                                Discard
                            </button>
                            <button type="submit" disabled={loading} style={styles.saveBtn}>
                                {loading ? 'Saving...' : 'Confirm Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    container: { display: 'flex', justifyContent: 'center', padding: '60px 20px' },
    formCard: {
        width: '100%',
        maxWidth: '550px',
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        padding: '50px 40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #EAEAEA'
    },
    header: { textAlign: 'center', marginBottom: '40px' },
    title: { fontSize: '1.8rem', fontWeight: '950', color: '#131921', margin: 0, letterSpacing: '-1px' },
    subtitle: { fontSize: '0.85rem', color: '#B2BEC3', marginTop: '10px', fontWeight: '600' },

    imageSection: { textAlign: 'center', marginBottom: '35px' },
    avatarWrapper: { position: 'relative', width: '130px', height: '130px', margin: '0 auto' },
    avatar: { width: '100%', height: '100%', borderRadius: '45px', objectFit: 'cover', border: '4px solid #F9FAFB' },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: '45px',
        backgroundColor: '#FF9900',
        color: '#FFFFFF',
        fontSize: '3.5rem',
        fontWeight: '950',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    uploadBadge: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        backgroundColor: '#131921',
        width: '40px',
        height: '40px',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#FFFFFF'
    },
    removeBadge: {
        position: 'absolute',
        top: '0',
        right: '0',
        backgroundColor: '#FF4757',
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#FFFFFF',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    imageNote: { fontSize: '0.75rem', color: '#FF9900', marginTop: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' },

    form: { display: 'flex', flexDirection: 'column', gap: '25px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    label: { fontSize: '0.7rem', fontWeight: '900', color: '#131921', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: {
        padding: '16px',
        borderRadius: '16px',
        border: '1.5px solid #EAEAEA',
        backgroundColor: '#F9FAFB',
        fontSize: '1rem',
        outline: 'none',
        fontWeight: '600'
    },

    alert: { padding: '16px', borderRadius: '14px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '800' },

    actionRow: { display: 'flex', gap: '15px', marginTop: '15px' },
    saveBtn: {
        flex: 2,
        padding: '18px',
        backgroundColor: '#131921',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '18px',
        fontWeight: '900',
        cursor: 'pointer',
        boxShadow: '0 10px 20px rgba(19, 25, 33, 0.1)'
    },
    cancelBtn: {
        flex: 1,
        padding: '18px',
        backgroundColor: '#F1F2F6',
        color: '#636E72',
        border: 'none',
        borderRadius: '18px',
        fontWeight: '900',
        cursor: 'pointer'
    }
};

export default EditUserProfile;