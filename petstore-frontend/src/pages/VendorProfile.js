import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VendorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✨ FIXED: Check correct user storage key to verify ownership
    const currentUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('vendor'));
    const currentUserId = currentUser?.id || currentUser?.vendorId;
    const isOwner = currentUser?.role === 'VENDOR' && String(currentUserId) === String(id);

    // ✨ HELPER: Get Security Headers (Handles both logged-in and public visitors gracefully)
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        } : {
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                const headers = getAuthHeaders();

                // ✨ FIXED: Added Auth Headers
                const vRes = await fetch(`http://${window.location.hostname}:8090/api/vendors/${id}`, { headers });
                if (vRes.ok) {
                    const vData = await vRes.json();
                    setVendor(vData);
                }

                // ✨ FIXED: Replaced hardcoded localhost and added Auth Headers
                const pRes = await fetch(`http://${window.location.hostname}:8090/api/pets/vendor/${id}`, { headers });
                if (pRes.ok) {
                    const pData = await pRes.json();
                    setPets(pData);
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVendorData();
    }, [id]);

    if (loading) return <div style={styles.loader}>✨ Loading Storefront...</div>;
    if (!vendor) return <div style={styles.loader}>Vendor not found.</div>;

    return (
        <div style={styles.page}>
            {/* 1. Header & Banner Section */}
            <div style={{
                ...styles.banner,
                backgroundImage: vendor.banner ? `url(data:image/jpeg;base64,${vendor.banner})` : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)'
            }}>
                <div style={styles.navButtons}>
                    <button onClick={() => navigate(-1)} style={styles.navBtn}>← Back</button>
                    {isOwner && (
                        <button onClick={() => navigate(`/edit-vendor-profile/${id}`)} style={styles.editBtn}>
                            ✎ Edit My Shop
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Floating Profile Card */}
            <div style={styles.mainContainer}>
                <div style={styles.profileCard}>
                    <div style={styles.profilePrimary}>
                        <div style={styles.avatarWrapper}>
                            {/* ✨ UPDATED: Display storeImg if available, else show Avatar Initials */}
                            <div style={styles.avatar}>
                                {vendor.storeImg ? (
                                    <img
                                        src={`data:image/jpeg;base64,${vendor.storeImg}`}
                                        alt={vendor.storeName}
                                        style={styles.avatarImg}
                                    />
                                ) : (
                                    vendor.storeName?.charAt(0).toUpperCase() || vendor.username?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div style={styles.verifiedBadge}>✓ Verified</div>
                        </div>

                        <div style={styles.metaSection}>
                            <h1 style={styles.storeTitle}>{vendor.storeName || vendor.username}</h1>
                            <p style={styles.storeBio}>{vendor.bio || "Welcome to my soulful pet store! We provide healthy and happy companions for your home."}</p>

                            <div style={styles.quickLinks}>
                                <div style={styles.linkItem}>
                                    <span style={styles.linkIcon}>📍</span>
                                    <span>{vendor.address || "Hyderabad, India"}</span>
                                </div>
                                <div style={styles.linkItem}>
                                    <span style={styles.linkIcon}>💳</span>
                                    <span>UPI: {vendor.upiId || "Available"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Pet Listings Grid */}
                <div style={styles.inventoryHeader}>
                    <h2 style={styles.sectionTitle}>Available Companions ({pets.length})</h2>
                    <div style={styles.line}></div>
                </div>

                <div style={styles.petGrid}>
                    {pets.map(pet => (
                        <div key={pet.id} style={styles.petCard} onClick={() => navigate(`/pet/${pet.id}`)}>
                            <div style={styles.petImgWrapper}>
                                <img src={`data:image/jpeg;base64,${pet.image}`} alt={pet.name} style={styles.petImg} />
                                <div style={styles.petOverlay}>View Details</div>
                            </div>
                            <div style={styles.petDetails}>
                                <h4 style={styles.petName}>{pet.name}</h4>
                                <p style={styles.petBreed}>{pet.breed}</p>
                                <div style={styles.priceRow}>
                                    <span style={styles.petPrice}>₹{pet.price.toLocaleString('en-IN')}</span>
                                    <span style={styles.petType}>{pet.category || 'Pet'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: '60px' },
    banner: { height: '320px', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
    navButtons: { padding: '30px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    navBtn: { padding: '10px 20px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
    editBtn: { padding: '10px 24px', backgroundColor: '#FF9900', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', boxShadow: '0 4px 15px rgba(255, 153, 0, 0.3)' },

    mainContainer: { maxWidth: '1100px', margin: '-100px auto 0', padding: '0 20px', position: 'relative' },
    profileCard: { backgroundColor: '#fff', borderRadius: '32px', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' },
    profilePrimary: { display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' },
    avatarWrapper: { textAlign: 'center' },

    avatar: { width: '130px', height: '130px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3.5rem', fontWeight: '900', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },

    verifiedBadge: { marginTop: '12px', backgroundColor: '#dcfce7', color: '#166534', padding: '5px 15px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '800', display: 'inline-block' },

    metaSection: { flex: 1, minWidth: '300px' },
    storeTitle: { fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0', letterSpacing: '-1px' },
    storeBio: { color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '600px', marginBottom: '25px' },
    quickLinks: { display: 'flex', gap: '25px', color: '#475569', fontSize: '0.9rem', fontWeight: '600' },
    linkItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    linkIcon: { fontSize: '1.1rem' },

    inventoryHeader: { marginTop: '60px', marginBottom: '35px', textAlign: 'center' },
    sectionTitle: { fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0' },
    line: { width: '60px', height: '4px', backgroundColor: '#FF9900', margin: '0 auto', borderRadius: '2px' },

    petGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px' },
    petCard: { backgroundColor: '#fff', borderRadius: '28px', overflow: 'hidden', border: '1px solid #f1f5f9', cursor: 'pointer', transition: '0.3s ease-in-out', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    petImgWrapper: { height: '200px', position: 'relative', overflow: 'hidden' },
    petImg: { width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s' },
    petOverlay: { position: 'absolute', bottom: '0', left: '0', right: '0', padding: '15px', background: 'rgba(15, 23, 42, 0.7)', color: '#fff', textAlign: 'center', fontWeight: '700', transform: 'translateY(100%)', transition: '0.3s' },
    petDetails: { padding: '20px' },
    petName: { fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 5px 0' },
    petBreed: { fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', marginBottom: '15px' },
    priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    petPrice: { fontSize: '1.3rem', fontWeight: '900', color: '#FF9900' },
    petType: { fontSize: '0.7rem', color: '#475569', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', fontWeight: '700', textTransform: 'uppercase' },

    loader: { textAlign: 'center', padding: '150px', fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }
};

export default VendorProfile;