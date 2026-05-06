import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';

const VendorInventory = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [pets, setPets] = useState([]);

    const [editingPetId, setEditingPetId] = useState(null);
    const [formData, setFormData] = useState({
        category: '', breed: '', price: '', maleQuantity: '', femaleQuantity: '',
        dob: '', color: '', isVaccinated: 'no', vaccinationDose: '', description: '', image: null
    });
    const [isUpdating, setIsUpdating] = useState(false);

    const editFormRef = useRef(null);
    const API_BASE = `http://${window.location.hostname}:8090/api`;

    // ✨ SECURITY HELPER
    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
    };

    useEffect(() => {
        // ✨ CRITICAL FIX: Look for 'user' key first, ensure token exists
        const savedVendor = JSON.parse(localStorage.getItem('user') || localStorage.getItem('vendor'));
        const token = localStorage.getItem('token');

        if (!savedVendor || !token) {
            navigate('/vendor-login');
            return;
        }

        setVendor(savedVendor);

        // ✨ CRITICAL FIX: Safely pull the ID regardless of how the object is shaped
        const activeVendorId = savedVendor.id || savedVendor.vendorId || savedVendor.userId;
        fetchPets(activeVendorId);
    }, [navigate, API_BASE]);

    const fetchPets = (vendorId) => {
        // ✨ FIXED: Added Security Headers
        fetch(`${API_BASE}/pets/vendor/${vendorId}`, { headers: getAuthHeaders() })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    navigate('/vendor-login');
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then(setPets)
            .catch(console.error);
    };

    const handleEditClick = (pet) => {
        setEditingPetId(pet.id);
        let formattedDob = '';
        if (pet.dob) {
            const date = new Date(pet.dob);
            formattedDob = date.toISOString().split('T')[0];
        }
        setFormData({
            category: pet.category || 'Dog',
            breed: pet.breed || '',
            price: pet.price || '',
            maleQuantity: pet.maleQuantity || '0',
            femaleQuantity: pet.femaleQuantity || '0',
            dob: formattedDob,
            color: pet.color || '',
            isVaccinated: pet.isVaccinated || 'no',
            vaccinationDose: pet.vaccinationDose || '',
            description: pet.description || '',
            image: null
        });
        setTimeout(() => {
            editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image: reader.result.split(',')[1] }));
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        const totalQuantity = parseInt(formData.maleQuantity || 0) + parseInt(formData.femaleQuantity || 0);

        const payload = {
            ...formData,
            vendorId: vendor.id || vendor.vendorId || vendor.userId, // ✨ FIX: Keep pet attached to vendor
            quantity: totalQuantity.toString()
        };

        try {
            // ✨ FIXED: Added Security Headers
            const res = await fetch(`${API_BASE}/pets/update/${editingPetId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Companion updated successfully!");
                fetchPets(vendor.id || vendor.vendorId || vendor.userId);
                setEditingPetId(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const errorText = await res.text();
                alert(`Failed to update companion: ${errorText}`);
            }
        } catch (err) {
            alert("Connection error. Ensure your backend is running.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeletePet = async () => {
        if (!window.confirm("Are you sure you want to completely remove this listing?")) return;
        try {
            // ✨ FIXED: Added Security Headers
            const res = await fetch(`${API_BASE}/pets/${editingPetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                fetchPets(vendor.id || vendor.vendorId || vendor.userId);
                setEditingPetId(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("Failed to delete companion.");
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div style={styles.container}>
            <VendorSidebar activeTab="products" vendor={vendor} />
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.welcomeText}>Inventory Management</h1>
                        <p style={styles.dateText}>{vendor?.storeName?.toUpperCase() || 'OFFICIAL BOUTIQUE'}</p>
                    </div>
                    <button onClick={() => navigate('/add-pet')} style={styles.primaryBtn}>+ New Listing</button>
                </header>

                <div style={styles.contentFade}>
                    <div style={styles.petGrid}>
                        {pets.map((pet) => {
                            const isEditingThis = editingPetId === pet.id;
                            return (
                                <div
                                    key={pet.id}
                                    style={{
                                        ...styles.petCard,
                                        borderColor: isEditingThis ? '#FF9900' : '#e2e8f0',
                                        boxShadow: isEditingThis ? '0 0 0 3px rgba(255, 153, 0, 0.2)' : ''
                                    }}
                                    onClick={() => handleEditClick(pet)}
                                >
                                    <div style={styles.imageWrapper}>
                                        {/* Standard Base64 Image Render */}
                                        <img src={`data:image/jpeg;base64,${pet.image}`} alt={pet.breed} style={styles.petImg} />
                                        <span style={{...styles.typeBadge, backgroundColor: pet.category === 'Dog' ? '#dcfce7' : '#fef2f2', color: pet.category === 'Dog' ? '#166534' : '#991b1b'}}>{pet.category || 'Pet'}</span>
                                        {isEditingThis && <div style={styles.editingOverlay}>✏️ Editing</div>}
                                    </div>
                                    <div style={styles.petDetails}>
                                        <h4 style={styles.petCardTitle}>{pet.breed}</h4>
                                        <div style={styles.petCardFooter}>
                                            <span style={styles.petCardPrice}>₹{pet.price}</span>
                                            <span style={styles.petCardQty}>Qty: {pet.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {editingPetId && (
                    <div ref={editFormRef} style={styles.editSectionFade}>
                        <div style={styles.editCard}>
                            <div style={styles.editHeader}>
                                <div>
                                    <h2 style={styles.editTitle}>Edit Companion Details</h2>
                                    <p style={styles.editSub}>Update the information for your selected {formData.category.toLowerCase()}.</p>
                                </div>
                                <button style={styles.closeBtn} onClick={() => setEditingPetId(null)}>✕ Close</button>
                            </div>

                            <form onSubmit={handleUpdateSubmit} style={styles.form}>
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Category</label>
                                        <select name="category" value={formData.category} onChange={handleChange} style={styles.input}>
                                            <option value="Dog">Dog</option>
                                            <option value="Cat">Cat</option>
                                            <option value="Bird">Bird</option>
                                            <option value="Fish">Fish</option>
                                            <option value="Rabbit">Rabbit</option>
                                            <option value="Turtle">Turtle</option>
                                            <option value="Hamster">Hamster</option>
                                            <option value="Guinea Pig">Guinea Pig</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Breed / Name</label>
                                        <input type="text" name="breed" value={formData.breed} onChange={handleChange} style={styles.input} required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Price (₹)</label>
                                        <input type="number" name="price" value={formData.price} onChange={handleChange} style={styles.input} required />
                                    </div>
                                </div>
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Male Quantity</label>
                                        <input type="number" name="maleQuantity" value={formData.maleQuantity} onChange={handleChange} style={styles.input} min="0" required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Female Quantity</label>
                                        <input type="number" name="femaleQuantity" value={formData.femaleQuantity} onChange={handleChange} style={styles.input} min="0" required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Color</label>
                                        <input type="text" name="color" value={formData.color} onChange={handleChange} style={styles.input} />
                                    </div>
                                </div>
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Date of Birth</label>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={styles.input} required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Vaccinated?</label>
                                        <select name="isVaccinated" value={formData.isVaccinated} onChange={handleChange} style={styles.input}>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Vaccine Details (Optional)</label>
                                        <input type="text" name="vaccinationDose" value={formData.vaccinationDose} onChange={handleChange} style={styles.input} disabled={formData.isVaccinated === 'no'} placeholder={formData.isVaccinated === 'no' ? 'N/A' : 'e.g., Rabies 1st Dose'} />
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Bio / Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} style={styles.textarea} rows="3" required></textarea>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Update Image (Leave blank to keep current)</label>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{...styles.input, paddingTop: '10px'}} />
                                </div>
                                <div style={styles.actionRow}>
                                    <button type="submit" style={styles.saveBtn} disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>
                                    <button type="button" style={styles.deleteBtn} onClick={handleDeletePet}>🗑️ Delete Listing</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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
    petGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
    petCard: { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', ':hover': { transform: 'translateY(-5px)'} },
    imageWrapper: { height: '160px', position: 'relative' },
    petImg: { width: '100%', height: '100%', objectFit: 'cover' },
    typeBadge: { position: 'absolute', top: '10px', left: '10px', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', zIndex: 2 },
    editingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 153, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '900', color: '#9a3412', zIndex: 1 },
    petDetails: { padding: '15px' },
    petCardTitle: { margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '800' },
    petCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' },
    petCardPrice: { fontSize: '1rem', fontWeight: '900' },
    petCardQty: { fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' },
    editSectionFade: { animation: 'fadeInUp 0.4s ease', marginTop: '40px' },
    editCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' },
    editHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' },
    editTitle: { margin: '0 0 5px 0', fontSize: '1.6rem', fontWeight: '900', color: '#131921' },
    editSub: { margin: 0, color: '#64748b', fontSize: '0.95rem' },
    closeBtn: { background: 'none', border: 'none', color: '#64748b', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: '8px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formRow: { display: 'flex', gap: '20px' },
    formGroup: { flex: 1, display: 'flex', flexDirection: 'column' },
    label: { fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '8px' },
    input: { padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', backgroundColor: '#f8fafc' },
    textarea: { padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', backgroundColor: '#f8fafc', resize: 'vertical' },
    actionRow: { display: 'flex', gap: '15px', marginTop: '10px' },
    saveBtn: { padding: '14px 30px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: '0.2s' },
    deleteBtn: { padding: '14px 20px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #f87171', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', transition: '0.2s', marginLeft: 'auto' },
    contentFade: { animation: 'fadeIn 0.4s ease' }
};

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .pet-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
`;
document.head.appendChild(styleSheet);
export default VendorInventory;