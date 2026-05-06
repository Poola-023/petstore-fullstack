import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';

const VendorDiscounts = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [pets, setPets] = useState([]);

    // ✨ NEW: UI View Mode
    const [discountMode, setDiscountMode] = useState('category'); // 'global', 'category', 'individual'

    // ✨ Discount States
    const [globalDiscount, setGlobalDiscount] = useState('');
    const [categoryDiscounts, setCategoryDiscounts] = useState({ Dog: '', Cat: '', Bird: '', Fish: '', Rabbit: '', Turtle: '', Hamster: '', 'Guinea Pig': '', Other: '' });
    const [petDiscounts, setPetDiscounts] = useState({});

    const allCategories = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Turtle', 'Hamster', 'Guinea Pig', 'Other'];
    const API_BASE = `http://${window.location.hostname}:8090/api`;

    // ✨ SECURITY HELPER: Get JWT Token
    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    };

    const fetchPets = async (vendorId) => {
        try {
            // ✨ FIXED: Added Auth Headers
            const res = await fetch(`${API_BASE}/pets/vendor/${vendorId}`, {
                headers: getAuthHeaders()
            });

            if (res.ok) {
                const data = await res.json();
                setPets(data);

                // 1. Check if all pets have the exact same discount (Store-wide pre-fill)
                if (data.length > 0) {
                    const firstDisc = data[0].discountPercentage || 0;
                    const allSame = data.every(p => (p.discountPercentage || 0) === firstDisc);
                    if (allSame && firstDisc > 0) setGlobalDiscount(firstDisc);
                    else setGlobalDiscount('');
                }

                // 2. Pre-fill Category Discounts
                const dbCatDiscounts = { ...categoryDiscounts };
                allCategories.forEach(category => {
                    const petsInCategory = data.filter(p => p.category === category);
                    if (petsInCategory.length > 0) {
                        const currentDiscount = petsInCategory[0].discountPercentage || 0;
                        dbCatDiscounts[category] = currentDiscount > 0 ? currentDiscount : '';
                    }
                });
                setCategoryDiscounts(dbCatDiscounts);

                // 3. Pre-fill Individual Pet Discounts
                const dbPetDiscounts = {};
                data.forEach(pet => {
                    dbPetDiscounts[pet.id] = pet.discountPercentage > 0 ? pet.discountPercentage : '';
                });
                setPetDiscounts(dbPetDiscounts);
            } else if (res.status === 401 || res.status === 403) {
                navigate('/vendor-login');
            }
        } catch (err) { console.error("Error fetching pets:", err); }
    };

    useEffect(() => {
        // ✨ FIXED: Check both 'user' and 'vendor' keys, and ensure token exists
        const savedVendor = JSON.parse(localStorage.getItem('user') || localStorage.getItem('vendor'));
        const token = localStorage.getItem('token');

        if (!savedVendor || !token) { navigate('/vendor-login'); return; }

        setVendor(savedVendor);
        fetchPets(savedVendor.id || savedVendor.vendorId);
    }, [navigate]);

    // ✨ HANDLER: Store-wide Discount
    const handleApplyGlobalDiscount = async () => {
        const discountValue = parseInt(globalDiscount);
        if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) return alert("Valid discount (0-100) required.");

        try {
            // ✨ FIXED: Added Auth Headers
            const res = await fetch(`${API_BASE}/pets/discount/vendor`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ vendorId: vendor.id || vendor.vendorId, discountPercentage: discountValue })
            });
            if (res.ok) {
                alert(`Successfully applied ${discountValue}% discount to ALL pets!`);
                fetchPets(vendor.id || vendor.vendorId);
            } else { alert("Failed to apply store-wide discount."); }
        } catch (err) { alert("Could not connect to the server."); }
    };

    // ✨ HANDLER: Category Discount
    const handleApplyCategoryDiscount = async (category) => {
        const discountValue = parseInt(categoryDiscounts[category]);
        if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) return alert("Valid discount (0-100) required.");

        try {
            // ✨ FIXED: Added Auth Headers
            const res = await fetch(`${API_BASE}/pets/discount/category`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ vendorId: vendor.id || vendor.vendorId, category: category, discountPercentage: discountValue })
            });
            if (res.ok) {
                alert(`Successfully updated ${category} discount!`);
                fetchPets(vendor.id || vendor.vendorId);
            } else { alert("Failed to apply category discount."); }
        } catch (err) { alert("Could not connect to the server."); }
    };

    // ✨ HANDLER: Individual Pet Discount
    const handleApplyIndividualDiscount = async (petId, petName) => {
        const discountValue = parseInt(petDiscounts[petId]);
        if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) return alert("Valid discount (0-100) required.");

        try {
            // ✨ FIXED: Added Auth Headers
            const res = await fetch(`${API_BASE}/pets/discount/pet`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ petId: petId, discountPercentage: discountValue })
            });
            if (res.ok) {
                alert(`Successfully updated discount for ${petName}!`);
                fetchPets(vendor.id || vendor.vendorId);
            } else { alert("Failed to apply individual discount."); }
        } catch (err) { alert("Could not connect to the server."); }
    };

    const activeCategories = allCategories.filter(category => pets.some(p => p.category === category));

    return (
        <div style={styles.container}>
            <VendorSidebar activeTab="discount" vendor={vendor} />
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.welcomeText}>Pricing & Offers</h1>
                        <p style={styles.dateText}>{vendor?.storeName?.toUpperCase() || 'OFFICIAL BOUTIQUE'}</p>
                    </div>
                </header>

                <div style={styles.contentFade}>

                    {/* ✨ DISCOUNT MODE TOGGLES */}
                    <div style={styles.toggleContainer}>
                        <button style={discountMode === 'global' ? styles.activeToggle : styles.toggleBtn} onClick={() => setDiscountMode('global')}>
                            Store-wide
                        </button>
                        <button style={discountMode === 'category' ? styles.activeToggle : styles.toggleBtn} onClick={() => setDiscountMode('category')}>
                            By Category
                        </button>
                        <button style={discountMode === 'individual' ? styles.activeToggle : styles.toggleBtn} onClick={() => setDiscountMode('individual')}>
                            Specific Companions
                        </button>
                    </div>

                    {/* 1. STORE-WIDE VIEW */}
                    {discountMode === 'global' && (
                        <div style={styles.globalCard}>
                            <h3 style={styles.globalTitle}>Apply Store-wide Sale</h3>
                            <p style={styles.globalSub}>This will instantly overwrite and apply the selected discount to <strong>EVERY single companion</strong> currently listed in your boutique.</p>

                            <div style={{...styles.discountInputRow, maxWidth: '400px', marginTop: '25px'}}>
                                <div style={styles.discountInputWrapper}>
                                    <input type="number" min="0" max="100" placeholder="0" style={styles.discountInput} value={globalDiscount} onChange={(e) => setGlobalDiscount(e.target.value)} />
                                    <span style={styles.percentSign}>% OFF</span>
                                </div>
                                <button style={styles.applyBtnGlobal} onClick={handleApplyGlobalDiscount} disabled={pets.length === 0}>
                                    Apply to All Pets
                                </button>
                            </div>
                            {pets.length === 0 && <p style={{color: '#ef4444', fontSize: '0.85rem', marginTop: '10px'}}>You have no pets in your inventory.</p>}
                        </div>
                    )}

                    {/* 2. BY CATEGORY VIEW */}
                    {discountMode === 'category' && (
                        <>
                            {activeCategories.length === 0 ? (
                                <div style={styles.noDataBox}><p style={styles.emptyText}>You need to add pets to your inventory first.</p></div>
                            ) : (
                                <div style={styles.discountGrid}>
                                    {activeCategories.map((category) => {
                                        const count = pets.filter(p => p.category === category).length;
                                        return (
                                            <div key={category} style={styles.discountCard}>
                                                <div style={styles.discountCardHeader}>
                                                    <h4 style={styles.discountCategoryName}>{category}</h4>
                                                    <span style={styles.discountCountBadge}>{count} Listings</span>
                                                </div>
                                                <div style={styles.discountInputRow}>
                                                    <div style={styles.discountInputWrapper}>
                                                        <input type="number" min="0" max="100" placeholder="0" style={styles.discountInput} value={categoryDiscounts[category] !== undefined ? categoryDiscounts[category] : ''} onChange={(e) => setCategoryDiscounts({...categoryDiscounts, [category]: e.target.value})} />
                                                        <span style={styles.percentSign}>% OFF</span>
                                                    </div>
                                                    <button style={styles.applyBtn} onClick={() => handleApplyCategoryDiscount(category)} disabled={count === 0}>
                                                        {categoryDiscounts[category] ? 'Update' : 'Apply'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* 3. INDIVIDUAL PETS VIEW */}
                    {discountMode === 'individual' && (
                        <>
                            {pets.length === 0 ? (
                                <div style={styles.noDataBox}><p style={styles.emptyText}>You need to add pets to your inventory first.</p></div>
                            ) : (
                                <div style={styles.individualGrid}>
                                    {pets.map(pet => {
                                        const basePrice = pet.price || 0;
                                        const currentDisc = parseInt(petDiscounts[pet.id]) || 0;
                                        const finalPrice = currentDisc > 0 ? basePrice - (basePrice * (currentDisc / 100)) : basePrice;

                                        return (
                                            <div key={pet.id} style={styles.petDiscountCard}>
                                                <img src={`data:image/jpeg;base64,${pet.image}`} alt={pet.breed} style={styles.petThumb} />
                                                <div style={styles.petDetailsCol}>
                                                    <h4 style={styles.petCardTitle}>{pet.breed}</h4>
                                                    <p style={styles.petPriceText}>Base: ₹{basePrice.toLocaleString('en-IN')}</p>
                                                    {currentDisc > 0 && <p style={styles.finalPriceText}>Sale: ₹{finalPrice.toLocaleString('en-IN')}</p>}
                                                </div>

                                                <div style={styles.petInputCol}>
                                                    <div style={{...styles.discountInputWrapper, marginBottom: '8px'}}>
                                                        <input type="number" min="0" max="100" placeholder="0" style={{...styles.discountInput, padding: '8px'}} value={petDiscounts[pet.id] !== undefined ? petDiscounts[pet.id] : ''} onChange={(e) => setPetDiscounts({...petDiscounts, [pet.id]: e.target.value})} />
                                                        <span style={{...styles.percentSign, padding: '0 10px', fontSize: '0.8rem'}}>%</span>
                                                    </div>
                                                    <button style={styles.applyBtnSmall} onClick={() => handleApplyIndividualDiscount(pet.id, pet.breed)}>
                                                        {pet.discountPercentage > 0 ? 'Update' : 'Apply'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                </div>
            </main>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    main: { flex: 1, padding: '40px 50px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    welcomeText: { fontSize: '2rem', fontWeight: '900', color: '#131921', margin: 0 },
    dateText: { color: '#FF9900', fontSize: '0.8rem', fontWeight: '800', marginTop: '5px', letterSpacing: '0.5px' },

    // ✨ Toggles
    toggleContainer: { display: 'flex', gap: '5px', marginBottom: '30px', backgroundColor: '#fff', padding: '8px', borderRadius: '16px', border: '1px solid #e2e8f0', width: 'fit-content' },
    toggleBtn: { padding: '12px 24px', border: 'none', backgroundColor: 'transparent', borderRadius: '10px', color: '#64748b', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' },
    activeToggle: { padding: '12px 24px', border: 'none', backgroundColor: '#131921', borderRadius: '10px', color: '#fff', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },

    // Global Section
    globalCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' },
    globalTitle: { fontSize: '1.6rem', fontWeight: '900', color: '#131921', margin: '0 0 10px 0' },
    globalSub: { color: '#64748b', fontSize: '1rem', margin: 0, lineHeight: '1.5' },
    applyBtnGlobal: { backgroundColor: '#FF9900', color: '#131921', border: 'none', padding: '0 25px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' },

    // Categories Section
    discountGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    discountCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' },
    discountCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    discountCategoryName: { margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' },
    discountCountBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' },

    discountInputRow: { display: 'flex', gap: '10px' },
    discountInputWrapper: { flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' },
    discountInput: { flex: 1, padding: '12px', border: 'none', outline: 'none', fontSize: '1rem', fontWeight: '700' },
    percentSign: { padding: '0 15px', color: '#64748b', fontWeight: '800', backgroundColor: '#f8fafc', borderLeft: '1px solid #cbd5e1', height: '100%', display: 'flex', alignItems: 'center' },
    applyBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' },

    // ✨ Individual Pets Section
    individualGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    petDiscountCard: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '15px', borderRadius: '20px', border: '1px solid #e2e8f0', gap: '15px' },
    petThumb: { width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover', backgroundColor: '#f8fafc' },
    petDetailsCol: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    petCardTitle: { margin: '0 0 5px 0', fontSize: '1.05rem', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    petPriceText: { margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '600' },
    finalPriceText: { margin: '2px 0 0 0', fontSize: '0.85rem', color: '#059669', fontWeight: '800' },
    petInputCol: { width: '100px', display: 'flex', flexDirection: 'column' },
    applyBtnSmall: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' },

    noDataBox: { backgroundColor: '#fff', border: '1px dashed #cbd5e1', padding: '40px', borderRadius: '20px', textAlign: 'center' },
    emptyText: { color: '#64748b', fontSize: '0.95rem', fontWeight: '600', margin: 0 },
    contentFade: { animation: 'fadeIn 0.4s ease' }
};

export default VendorDiscounts;