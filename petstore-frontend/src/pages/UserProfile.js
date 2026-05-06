import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SubFooter from './SubFooter';
import PageNavigation from './PageNavigation';

const UserProfile = ({ user, setUser, cart }) => {
    const navigate = useNavigate();

    // --- LOGIC (UNTOUCHED) ---
    const [activeMenu, setActiveMenu] = useState('profile');
    const nameParts = (user?.username || '').split(' ');
    const [formData, setFormData] = useState({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        gender: user?.gender || 'Male',
        email: user?.email || '',
        phone: user?.phoneNumber || ''
    });

    const [editPersonal, setEditPersonal] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [editPhone, setEditPhone] = useState(false);
    const [profileImg, setProfileImg] = useState(user?.profileImg || null);
    const [loading, setLoading] = useState(false);

    const PAGE_SIZE = 5;
    const [addresses, setAddresses] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressFormData, setAddressFormData] = useState({});
    const [initialAddressData, setInitialAddressData] = useState({});
    const addressFormRef = useRef(null);

    const [sessions, setSessions] = useState([]);
    const [fetchingSessions, setFetchingSessions] = useState(false);

    const API_BASE = `http://${window.location.hostname}:8090/api`;

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }, []);

    const renderProfileImage = (imgData) => {
        if (!imgData) return null;
        return imgData.startsWith('data:image') ? imgData : `data:image/jpeg;base64,${imgData}`;
    };

    const getDeviceStatus = (lastSeen) => {
        const lastSeenDate = new Date(lastSeen);
        const now = new Date();
        const diffInMinutes = (now - lastSeenDate) / (1000 * 60);

        if (diffInMinutes < 5) {
            return (
                <div style={styles.statusActive}>
                    <span style={styles.pulseDot}></span> Active Now
                </div>
            );
        } else {
            return (
                <div style={styles.statusLastSeen}>
                    Last seen: {lastSeenDate.toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                </div>
            );
        }
    };

    useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

    useEffect(() => {
        if (activeMenu === 'address' && user?.userId) fetchAddressesPage(currentPage, showAll);
        if (activeMenu === 'devices' && user?.userId) fetchSessions();
    }, [activeMenu, currentPage, showAll, user?.userId]);

    useEffect(() => {
        if (showAddressForm && addressFormRef.current) {
            addressFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [showAddressForm]);

    useEffect(() => {
        if (!user?.userId) return;
        const heartbeat = setInterval(async () => {
            const deviceInfo = "Web Browser";
            try {
                await fetch(`${API_BASE}/users/sessions/heartbeat/${user.userId}/${deviceInfo}`, {
                    method: 'PUT',
                    headers: getAuthHeaders()
                });
            } catch (e) { console.error("Heartbeat failed"); }
        }, 180000);
        return () => clearInterval(heartbeat);
    }, [user, API_BASE, getAuthHeaders]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSaveProfile = async (section) => {
        setLoading(true);
        const userId = user?.userId || user?.id;
        const updatedUsername = `${formData.firstName} ${formData.lastName}`.trim();
        const payload = { id: userId, username: updatedUsername, email: formData.email, phoneNumber: formData.phone, gender: formData.gender };
        try {
            const response = await fetch(`${API_BASE}/users/update/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                setUser({ ...user, ...payload });
                const { profileImg, ...leanUser } = { ...user, ...payload };
                localStorage.setItem('user', JSON.stringify(leanUser));
                if (section === 'personal') setEditPersonal(false);
                if (section === 'email') setEditEmail(false);
                if (section === 'phone') setEditPhone(false);
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Img = reader.result;
            setProfileImg(base64Img);
            try {
                await fetch(`${API_BASE}/users/updateImage/${user?.userId || user?.id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ profileImg: base64Img.split(',')[1] })
                });
            } catch (err) { console.error(err); }
        };
        reader.readAsDataURL(file);
    };

    const fetchAddressesPage = async (page = 0, isShowAll = showAll) => {
        const userId = user?.userId || user?.id;
        try {
            const res = await fetch(`${API_BASE}/address/fetch/${userId}?page=${page}&size=${PAGE_SIZE}&showAll=${isShowAll}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAddresses(data);
                    setTotalElements(data.length);
                } else {
                    setAddresses(data.content || []);
                    setCurrentPage(data.number || 0);
                    setTotalPages(data.totalPages || 1);
                    setTotalElements(data.totalElements || 0);
                }
            }
        } catch (err) { console.error(err); }
    };

    const handleAddNewAddress = () => {
        const emptyForm = { addressId: null, fullName: user?.username || '', mobile: '', altMobile: '', houseDetails: '', areaLocality: '', city: '', pincode: '', addressType: 'HOME' };
        setAddressFormData(emptyForm);
        setInitialAddressData(emptyForm);
        setShowAddressForm(true);
    };

    const handleAddressRowClick = (addr) => {
        setAddressFormData({ ...addr });
        setInitialAddressData({ ...addr });
        setShowAddressForm(true);
    };

    const handleAddressSubmit = async () => {
        try {
            const res = await fetch(`${API_BASE}/address/save/${user?.userId || user?.id}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(addressFormData)
            });
            if (res.ok) {
                setShowAddressForm(false);
                fetchAddressesPage(currentPage, showAll);
            }
        } catch (err) { console.error(err); }
    };

    const handleAddressDelete = async () => {
        if (window.confirm("Remove this location?")) {
            await fetch(`${API_BASE}/address/delete/${addressFormData.addressId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            setShowAddressForm(false);
            fetchAddressesPage(currentPage, showAll);
        }
    };

    const handleToggleShowAll = (e) => { setShowAll(e.target.checked); setCurrentPage(0); };
    const handleNextPage = () => { if (currentPage < totalPages - 1) fetchAddressesPage(currentPage + 1, showAll); };
    const handlePrevPage = () => { if (currentPage > 0) fetchAddressesPage(currentPage - 1, showAll); };

    const fetchSessions = async () => {
        setFetchingSessions(true);
        const userId = user?.userId || user?.id;
        try {
            const res = await fetch(`${API_BASE}/users/sessions/${userId}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) setSessions(await res.json());
        } catch (err) { console.error("Session sync failed"); }
        finally { setFetchingSessions(false); }
    };

    const handleLogoutDevice = async (sessionId) => {
        if (window.confirm("Remote sign-out this device?")) {
            try {
                const res = await fetch(`${API_BASE}/users/sessions/${sessionId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (res.ok) setSessions(sessions.filter(s => s.id !== sessionId));
            } catch (err) { console.error("Logout failed"); }
        }
    };

    if (!user) return null;

    // --- JSX (STYLISH VERSION) ---
    return (
        <div style={styles.pageBackground}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <PageNavigation />

            <div style={styles.mainLayout}>
                {/* ⬅️ SIDEBAR */}
                <div style={styles.sidebar}>
                    <div style={styles.helloCard}>
                        <div style={styles.avatarWrapper}>
                            {profileImg ? (
                                <img src={renderProfileImage(profileImg)} alt="P" style={styles.avatarImg} />
                            ) : (
                                <div style={styles.avatarPlaceholder}>{user.username?.charAt(0).toUpperCase()}</div>
                            )}
                            <label style={styles.uploadIcon}>📷 <input type="file" hidden onChange={handleImageChange} accept="image/*" /></label>
                        </div>
                        <div style={styles.helloTextContainer}>
                            <span style={styles.helloTextsmall}>Welcome back,</span>
                            <span style={styles.helloName}>{user.username}</span>
                        </div>
                    </div>

                    <div style={styles.menuCard}>
                        <div style={styles.menuSectionHeader}><span style={styles.menuTextHeader}>ACCOUNT SETTINGS</span></div>
                        <div style={styles.submenuList}>
                            <div style={activeMenu === 'profile' ? styles.activeSubmenuItem : styles.submenuItem} onClick={() => setActiveMenu('profile')}>Profile Information</div>
                            <div style={activeMenu === 'address' ? styles.activeSubmenuItem : styles.submenuItem} onClick={() => setActiveMenu('address')}>Manage Addresses</div>
                            <div style={activeMenu === 'devices' ? styles.activeSubmenuItem : styles.submenuItem} onClick={() => setActiveMenu('devices')}>Login Devices</div>
                        </div>

                        <div style={styles.logoutSection} onClick={() => {
                            localStorage.clear();
                            navigate('/login');
                        }}>
                            <span style={styles.logoutText}>Logout from Hub</span>
                        </div>
                    </div>
                </div>

                {/* ➡️ MAIN CONTENT */}
                <div style={styles.mainContent}>

                    {/* --- TAB: PROFILE --- */}
                    {activeMenu === 'profile' && (
                        <div className="fade-in">
                            <div style={styles.sectionHeader}>
                                <span style={styles.sectionTitle}>Personal Information</span>
                                <span style={styles.editToggle} onClick={() => setEditPersonal(!editPersonal)}>{editPersonal ? 'Cancel' : 'Edit Details'}</span>
                            </div>
                            <div style={styles.inputRow}>
                                <div style={styles.inputContainer}>
                                    <input
                                        style={editPersonal ? styles.inputActive : styles.inputDisabled}
                                        disabled={!editPersonal}
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div style={styles.inputContainer}>
                                    <input
                                        style={editPersonal ? styles.inputActive : styles.inputDisabled}
                                        disabled={!editPersonal}
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Last Name"
                                    />
                                </div>
                                {editPersonal && <button style={styles.saveBtn} onClick={() => handleSaveProfile('personal')} disabled={loading}>{loading ? '...' : 'Save'}</button>}
                            </div>

                            <div style={styles.genderSection}>
                                <span style={styles.genderLabel}>Your Gender</span>
                                <div style={styles.radioGroup}>
                                    <label style={styles.radioLabel}>
                                        <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} disabled={!editPersonal} style={styles.radioInput}/> Male
                                    </label>
                                    <label style={styles.radioLabel}>
                                        <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} disabled={!editPersonal} style={styles.radioInput}/> Female
                                    </label>
                                </div>
                            </div>

                            <div style={styles.divider}></div>

                            {/* Email Section */}
                            <div style={styles.sectionHeader}>
                                <span style={styles.sectionTitle}>Email Address</span>
                                <span style={styles.editToggle} onClick={() => setEditEmail(!editEmail)}>{editEmail ? 'Cancel' : 'Edit'}</span>
                            </div>
                            <div style={styles.inputRow}>
                                <div style={{width: '350px'}}>
                                    <input style={editEmail ? styles.inputActive : styles.inputDisabled} disabled={!editEmail} name="email" value={formData.email} onChange={handleChange} />
                                </div>
                                {editEmail && <button style={styles.saveBtn} onClick={() => handleSaveProfile('email')} disabled={loading}>Save</button>}
                            </div>

                            <div style={styles.divider}></div>

                            {/* Mobile Section */}
                            <div style={styles.sectionHeader}>
                                <span style={styles.sectionTitle}>Mobile Number</span>
                                <span style={styles.editToggle} onClick={() => setEditPhone(!editPhone)}>{editPhone ? 'Cancel' : 'Edit'}</span>
                            </div>
                            <div style={styles.inputRow}>
                                <div style={{width: '350px'}}>
                                    <input style={editPhone ? styles.inputActive : styles.inputDisabled} disabled={!editPhone} name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                                {editPhone && <button style={styles.saveBtn} onClick={() => handleSaveProfile('phone')} disabled={loading}>Save</button>}
                            </div>
                        </div>
                    )}

                    {/* --- TAB: ADDRESS --- */}
                    {activeMenu === 'address' && (
                        <div className="fade-in">
                            <div style={styles.sectionHeader}><span style={styles.sectionTitle}>Manage Addresses</span></div>
                            <div style={styles.tableContainer}>
                                <div style={styles.tableToolbar}>
                                    <div style={styles.toolbarLeft}>
                                        <h3 style={styles.tableTitle}>Delivery Hubs</h3>
                                        <label style={styles.checkboxLabel}>
                                            <input type="checkbox" checked={showAll} onChange={handleToggleShowAll} style={styles.checkbox} />
                                            Show all
                                        </label>
                                    </div>
                                    <button style={styles.addBtn} onClick={handleAddNewAddress}>+ Add New Address</button>
                                </div>
                                <table style={styles.table}>
                                    <thead>
                                        <tr><th style={styles.th}>Type</th><th style={styles.th}>Recipient</th><th style={styles.th}>Address Details</th><th style={styles.th}>Mobile</th></tr>
                                    </thead>
                                    <tbody>
                                        {addresses.length === 0 ? (
                                            <tr><td colSpan="4" style={styles.emptyText}>No locations found.</td></tr>
                                        ) : (
                                            addresses.map(addr => (
                                                <tr key={addr.addressId} style={styles.clickableTr} onClick={() => handleAddressRowClick(addr)}>
                                                    <td style={styles.td}><span style={styles.badge}>{addr.addressType}</span></td>
                                                    <td style={styles.td}><strong style={styles.strongText}>{addr.fullName}</strong></td>
                                                    <td style={styles.td}>{addr.houseDetails}, {addr.city}</td>
                                                    <td style={styles.td}>📞 {addr.mobile}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: DEVICES --- */}
                    {activeMenu === 'devices' && (
                        <div className="fade-in">
                            <div style={styles.sectionHeader}>
                                <span style={styles.sectionTitle}>Login Devices</span>
                                <button style={styles.refreshBtn} onClick={fetchSessions}>{fetchingSessions ? 'Syncing...' : 'Refresh'}</button>
                            </div>
                            <div style={styles.sessionList}>
                                {sessions.map((s, idx) => (
                                    <div key={s.id} style={styles.sessionCard}>
                                        <div style={styles.sessionIcon}>{s.deviceInfo.includes('PC') || s.deviceInfo.includes('Windows') ? '💻' : '📱'}</div>
                                        <div style={styles.sessionDetails}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                <h4 style={styles.sessionName}>{s.deviceInfo}</h4>
                                                {idx === 0 && <span style={styles.activeBadge}>THIS DEVICE</span>}
                                            </div>
                                            <div style={styles.statusRow}>{getDeviceStatus(s.lastSeen)}</div>
                                            <p style={styles.sessionMeta}>📍 {s.ipAddress} • {new Date(s.loginTime).toLocaleDateString()}</p>
                                        </div>
                                        {idx !== 0 && <button style={styles.signoutBtn} onClick={() => handleLogoutDevice(s.id)}>Sign Out</button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <SubFooter />
            <style>{`
                @keyframes pulseGreen {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .fade-in { animation: fadeIn 0.4s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

// ✨ STYLISH OVERHAUL
const styles = {
    pageBackground: { backgroundColor: '#F1F3F6', minHeight: '100vh', fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" },
    mainLayout: { display: 'flex', gap: '25px', maxWidth: '1280px', margin: '30px auto', padding: '0 20px', alignItems: 'flex-start' },

    // Sidebar
    sidebar: { width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' },
    helloCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' },
    avatarWrapper: { position: 'relative', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' },
    avatarPlaceholder: { width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#FF9900', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '900' },
    uploadIcon: { position: 'absolute', bottom: '0', right: '0', backgroundColor: '#fff', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: '0.75rem' },
    helloTextContainer: { display: 'flex', flexDirection: 'column' },
    helloTextsmall: { fontSize: '0.75rem', color: '#878787', fontWeight: '500' },
    helloName: { fontSize: '1.1rem', fontWeight: '800', color: '#212121' },

    menuCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '15px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' },
    menuSectionHeader: { padding: '10px 25px' },
    menuTextHeader: { fontSize: '0.7rem', fontWeight: '800', color: '#878787', letterSpacing: '1px' },
    submenuList: { display: 'flex', flexDirection: 'column' },
    submenuItem: { padding: '15px 25px', fontSize: '0.9rem', color: '#212121', cursor: 'pointer', fontWeight: '500', transition: '0.2s' },
    activeSubmenuItem: { padding: '15px 25px', fontSize: '0.9rem', color: '#FF9900', fontWeight: '800', backgroundColor: '#F5FAFF', borderRight: '4px solid #FF9900' },
    logoutSection: { margin: '15px 15px 0', padding: '15px', borderTop: '1px solid #F0F0F0', color: '#FF4D4D', fontWeight: '700', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem' },

    // Main Content
    mainContent: { flex: 1, backgroundColor: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', minHeight: '650px' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    sectionTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#212121' },
    editToggle: { fontSize: '0.85rem', color: '#FF9900', fontWeight: '700', cursor: 'pointer' },

    inputRow: { display: 'flex', gap: '20px', alignItems: 'center' },
    inputContainer: { width: '250px' },
    inputDisabled: { width: '100%', padding: '12px 16px', border: '1px solid #F0F0F0', borderRadius: '8px', backgroundColor: '#F9F9F9', color: '#878787', fontWeight: '500', outline: 'none' },
    inputActive: { width: '100%', padding: '12px 16px', border: '1.5px solid #FF9900', borderRadius: '8px', backgroundColor: '#fff', color: '#212121', fontWeight: '600', outline: 'none' },
    saveBtn: { backgroundColor: '#131921', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },

    genderSection: { marginTop: '25px' },
    genderLabel: { fontSize: '0.85rem', color: '#878787', fontWeight: '600', marginBottom: '12px', display: 'block' },
    radioGroup: { display: 'flex', gap: '40px' },
    radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#212121', cursor: 'pointer' },
    radioInput: { accentColor: '#FF9900', width: '18px', height: '18px' },
    divider: { height: '1px', backgroundColor: '#F0F0F0', margin: '35px 0' },

    // Tables
    tableContainer: { border: '1px solid #F0F0F0', borderRadius: '12px', overflow: 'hidden' },
    tableToolbar: { padding: '15px 20px', backgroundColor: '#FBFBFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    toolbarLeft: { display: 'flex', alignItems: 'center', gap: '30px' },
    tableTitle: { margin: 0, fontSize: '1rem', fontWeight: '700', color: '#212121' },
    checkboxLabel: { fontSize: '0.8rem', fontWeight: '600', color: '#878787', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    checkbox: { accentColor: '#FF9900', width: '16px', height: '16px' },
    addBtn: { backgroundColor: '#FF9900', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '15px 20px', textAlign: 'left', color: '#878787', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' },
    td: { padding: '20px', fontSize: '0.9rem', borderTop: '1px solid #F0F0F0', color: '#212121' },
    badge: { backgroundColor: '#F5FAFF', color: '#FF9900', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' },
    clickableTr: { cursor: 'pointer', transition: 'background 0.2s' },
    strongText: { color: '#212121', fontWeight: '700' },
    emptyText: { padding: '50px', textAlign: 'center', color: '#878787', fontSize: '0.9rem' },

    // Devices
    sessionCard: { display: 'flex', alignItems: 'center', padding: '25px', borderRadius: '12px', border: '1px solid #F0F0F0', marginBottom: '15px' },
    sessionIcon: { width: '50px', height: '50px', backgroundColor: '#F9F9F9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginRight: '20px' },
    sessionDetails: { flex: 1 },
    sessionName: { fontSize: '1rem', fontWeight: '700', margin: 0, color: '#212121' },
    activeBadge: { backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: '0.65rem', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' },
    statusRow: { marginTop: '5px' },
    statusActive: { color: '#2E7D32', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' },
    pulseDot: { width: '8px', height: '8px', backgroundColor: '#2E7D32', borderRadius: '50%', animation: 'pulseGreen 2s infinite' },
    statusLastSeen: { color: '#878787', fontSize: '0.8rem', fontWeight: '500' },
    sessionMeta: { color: '#878787', fontSize: '0.75rem', marginTop: '4px' },
    signoutBtn: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #FFEBEB', color: '#FF4D4D', fontWeight: '700', cursor: 'pointer', backgroundColor: '#fff', fontSize: '0.8rem' },
    refreshBtn: { background: 'none', border: '1px solid #F0F0F0', padding: '6px 14px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.75rem' }
};

export default UserProfile;