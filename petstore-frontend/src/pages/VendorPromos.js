import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';

const VendorPromos = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [promoBanners, setPromoBanners] = useState([]);
    const [showPromoForm, setShowPromoForm] = useState(false);
    const [newPromo, setNewPromo] = useState({ discount: '', bio: '', image: null });
    const [editingPromoId, setEditingPromoId] = useState(null);

    const API_BASE = `http://${window.location.hostname}:8090/api`;

    // ✨ SECURITY HELPER: Get JWT Token
    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    };

    const fetchPromos = async (vendorId) => {
        try {
            // ✨ FIXED: Added Auth Headers
            const res = await fetch(`${API_BASE}/promos/vendor/${vendorId}`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setPromoBanners(await res.json());
            } else if (res.status === 401 || res.status === 403) {
                navigate('/vendor-login');
            }
        } catch (err) { console.error("Error fetching promos:", err); }
    };

    useEffect(() => {
        // ✨ FIXED: Check both 'user' and 'vendor' keys, and ensure token exists
        const savedVendor = JSON.parse(localStorage.getItem('user') || localStorage.getItem('vendor'));
        const token = localStorage.getItem('token');

        if (!savedVendor || !token) { navigate('/vendor-login'); return; }

        setVendor(savedVendor);
        fetchPromos(savedVendor.id || savedVendor.vendorId);
    }, [navigate]);

    const handlePromoImageUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setNewPromo({ ...newPromo, image: reader.result.split(',')[1] });
        reader.readAsDataURL(file);
    };

    const handleSavePromo = async (e) => {
        e.preventDefault();
        if (!editingPromoId && !newPromo.image) return alert("Please upload an image.");

        const url = editingPromoId ? `${API_BASE}/promos/update/${editingPromoId}` : `${API_BASE}/promos/add`;
        const method = editingPromoId ? 'PUT' : 'POST';

        try {
            // ✨ FIXED: Added Auth Headers
            const res = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...newPromo, vendorId: vendor.id || vendor.vendorId })
            });

            if (res.ok) {
                alert(`Promotional Ad ${editingPromoId ? 'updated' : 'saved'} successfully!`);
                resetPromoForm();
                fetchPromos(vendor.id || vendor.vendorId);
            } else { alert("Failed to save promo ad."); }
        } catch (err) { alert("Server connection error."); }
    };

    const handleEditPromo = (promo) => {
        setEditingPromoId(promo.id);
        setNewPromo({ discount: promo.discount, bio: promo.bio, image: null });
        setShowPromoForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeletePromo = async (promoId) => {
        if (!window.confirm("Are you sure you want to permanently delete this promotional ad?")) return;
        try {
            // ✨ FIXED: Added Auth Headers
            const res = await fetch(`${API_BASE}/promos/delete/${promoId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                fetchPromos(vendor.id || vendor.vendorId);
                resetPromoForm();
            }
        } catch (err) { alert("Server connection error."); }
    };

    const resetPromoForm = () => {
        setShowPromoForm(false);
        setEditingPromoId(null);
        setNewPromo({ discount: '', bio: '', image: null });
    };

    return (
        <div style={styles.container}>
            <VendorSidebar activeTab="promo" vendor={vendor} />
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.welcomeText}>Promotional Ads</h1>
                        <p style={styles.dateText}>{vendor?.storeName?.toUpperCase() || 'OFFICIAL BOUTIQUE'}</p>
                    </div>
                    <button onClick={() => showPromoForm ? resetPromoForm() : setShowPromoForm(true)} style={styles.primaryBtn}>
                        {showPromoForm ? 'Cancel' : '+ New Promo Ad'}
                    </button>
                </header>

                <div style={styles.contentFade}>
                    {showPromoForm && (
                        <form style={styles.promoForm} onSubmit={handleSavePromo}>
                            <h3 style={{marginTop: 0, marginBottom: '20px'}}>
                                {editingPromoId ? 'Edit Promotional Ad' : 'Create Promotional Ad'}
                            </h3>
                            <div style={styles.formRow}>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Discount Percentage (%)</label>
                                    <input type="number" min="1" max="100" style={styles.inputField} placeholder="e.g., 25" value={newPromo.discount} onChange={(e) => setNewPromo({...newPromo, discount: e.target.value})} required />
                                </div>
                            </div>
                            <div style={styles.formRow}>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Offer Details (Bio)</label>
                                    <textarea style={styles.textArea} placeholder="e.g., Special Diwali offer!" value={newPromo.bio} onChange={(e) => setNewPromo({...newPromo, bio: e.target.value})} required rows="3"></textarea>
                                </div>
                            </div>
                            <div style={styles.formRow}>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>{editingPromoId ? 'Update Banner Image (Optional)' : 'Upload Banner Image'}</label>
                                    <input type="file" accept="image/*" style={styles.fileInput} onChange={(e) => handlePromoImageUpload(e.target.files[0])} />
                                </div>
                            </div>
                            <div style={styles.formActionsRow}>
                                <button type="submit" style={styles.savePromoBtn}>{editingPromoId ? 'Update Promo Ad' : 'Save Promo Ad'}</button>
                                {editingPromoId && <button type="button" style={styles.deletePromoBtn} onClick={() => handleDeletePromo(editingPromoId)}>🗑️ Delete Ad</button>}
                                <button type="button" style={styles.cancelPromoBtn} onClick={resetPromoForm}>Cancel</button>
                            </div>
                        </form>
                    )}

                    <div style={styles.promoGrid}>
                        {promoBanners.length === 0 && !showPromoForm ? (
                            <div style={styles.noDataBox}><p style={styles.emptyText}>No promotional ads running. Create one to boost sales!</p></div>
                        ) : (
                            promoBanners.map((promo) => (
                                <div key={promo.id} style={styles.promoCard} className="promo-card" onClick={() => handleEditPromo(promo)}>
                                    <div style={styles.promoImgWrapper}>
                                        <img src={`data:image/jpeg;base64,${promo.image}`} alt="Promo Banner" style={styles.promoImg} />
                                        <div style={styles.promoBadge}>{promo.discount}% OFF</div>
                                        <div style={styles.promoHoverOverlay} className="promo-hover-overlay">
                                            <span style={styles.hoverEditIcon}>✏️ Click to Edit</span>
                                        </div>
                                    </div>
                                    <div style={styles.promoDetails}><p style={styles.promoBio}>{promo.bio}</p></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    main: { flex: 1, padding: '40px 50px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    welcomeText: { fontSize: '2rem', fontWeight: '900', color: '#131921', margin: 0 },
    dateText: { color: '#FF9900', fontSize: '0.8rem', fontWeight: '800', marginTop: '5px', letterSpacing: '0.5px' },
    primaryBtn: { padding: '12px 24px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '800' },

    promoForm: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '30px' },
    formRow: { marginBottom: '15px' },
    formCol: { display: 'flex', flexDirection: 'column' },
    label: { fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '8px' },
    inputField: { padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' },
    textArea: { padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' },
    fileInput: { fontSize: '0.85rem', cursor: 'pointer' },
    formActionsRow: { display: 'flex', gap: '15px', marginTop: '20px' },
    savePromoBtn: { padding: '12px 24px', backgroundColor: '#FF9900', color: '#131921', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' },
    deletePromoBtn: { padding: '12px 24px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #f87171', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' },
    cancelPromoBtn: { padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' },

    promoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    promoCard: { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' },
    promoImgWrapper: { height: '160px', position: 'relative' },
    promoImg: { width: '100%', height: '100%', objectFit: 'cover' },
    promoBadge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: '#059669', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '900', zIndex: 2 },
    promoHoverOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', zIndex: 1 },
    hoverEditIcon: { backgroundColor: '#fff', color: '#131921', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '800', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
    promoDetails: { padding: '20px' },
    promoBio: { fontSize: '0.95rem', color: '#475569', margin: 0, lineHeight: '1.5' },
    noDataBox: { backgroundColor: '#fff', border: '1px dashed #cbd5e1', padding: '40px', borderRadius: '20px', textAlign: 'center' },
    emptyText: { color: '#64748b', fontSize: '0.95rem', fontWeight: '600', margin: 0 },
    contentFade: { animation: 'fadeIn 0.4s ease' }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
    .promo-card:hover .promo-hover-overlay { opacity: 1 !important; }
    .promo-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-color: #cbd5e1 !important; }
`;
document.head.appendChild(styleSheet);

export default VendorPromos;