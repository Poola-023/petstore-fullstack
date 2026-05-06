import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditVendorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // State for form and image previews
    const [formData, setFormData] = useState({
        storeName: '',
        bio: '',
        address: '',
        upiId: '',
        banner: null,
        storeImg: null
    });

    // ✨ SECURITY HELPER: Get JWT Token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        const fetchVendor = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/vendor-login');
                return;
            }

            try {
                const res = await fetch(`http://${window.location.hostname}:8090/api/vendors/${id}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        storeName: data.storeName || '',
                        bio: data.bio || '',
                        address: data.address || '',
                        upiId: data.upiId || '',
                        banner: data.banner || null,
                        storeImg: data.storeImg || null
                    });
                } else if (res.status === 401 || res.status === 403) {
                    navigate('/vendor-login');
                }
            } catch (err) {
                console.error("Failed to fetch vendor details");
            }
        };
        fetchVendor();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                setFormData(prev => ({ ...prev, [fieldName]: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`http://${window.location.hostname}:8080/api/vendors/update-profile/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (currentUser && (currentUser.id === id || currentUser.vendorId === id)) {

                    // ✨ CRITICAL FIX: Remove massive images before saving to localStorage
                    // This prevents the QuotaExceededError crash!
                    const { banner, storeImg, ...safeFormData } = formData;

                    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...safeFormData }));
                }

                alert("Boutique Profile Updated!");
                navigate(`/vendor-profile/${id}`);
            } else {
                alert("Server error during update. Make sure you are authorized.");
            }
        } catch (err) {
            console.error("Update Error:", err);
            alert("An error occurred while saving. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Edit Boutique Profile</h2>
                <p style={styles.subtitle}>Customize your brand appearance</p>

                <form onSubmit={handleSubmit} style={styles.form}>

                    {/* Store Profile Image Section */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Profile Image (Square)</label>
                        {formData.storeImg && (
                            <img
                                src={`data:image/jpeg;base64,${formData.storeImg}`}
                                alt="Preview"
                                style={styles.preview}
                            />
                        )}
                        <input type="file" onChange={(e) => handleFileChange(e, 'storeImg')} style={styles.fileInput} accept="image/*" />
                    </div>

                    {/* Banner Image Section */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Store Banner (Landscape)</label>
                        {formData.banner && (
                            <img
                                src={`data:image/jpeg;base64,${formData.banner}`}
                                alt="Banner Preview"
                                style={styles.bannerPreview}
                            />
                        )}
                        <input type="file" onChange={(e) => handleFileChange(e, 'banner')} style={styles.fileInput} accept="image/*" />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Boutique Name</label>
                        <input name="storeName" value={formData.storeName} onChange={handleChange} style={styles.input} required />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Boutique Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} style={styles.textarea} placeholder="Describe your soulful care..." />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Shop Location</label>
                        <input name="address" value={formData.address} onChange={handleChange} style={styles.input} required />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>UPI ID for Adoption Fees</label>
                        <input name="upiId" value={formData.upiId} onChange={handleChange} style={styles.input} required />
                    </div>

                    <div style={styles.btnRow}>
                        <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>Cancel</button>
                        <button type="submit" style={styles.saveBtn} disabled={loading}>
                            {loading ? "Processing..." : "Apply Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    card: { backgroundColor: '#fff', width: '100%', maxWidth: '550px', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' },
    title: { fontSize: '1.8rem', fontWeight: '900', color: '#131921', margin: '0 0 10px 0' },
    subtitle: { color: '#64748b', fontSize: '0.95rem', marginBottom: '35px' },
    form: { display: 'flex', flexDirection: 'column', gap: '22px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    label: { fontSize: '0.8rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
    input: { padding: '14px', borderRadius: '14px', border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '1rem' },
    textarea: { padding: '14px', borderRadius: '14px', border: '1.5px solid #e2e8f0', minHeight: '120px', outline: 'none', fontSize: '1rem' },
    preview: { width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', marginBottom: '10px', border: '2px solid #FF9900' },
    bannerPreview: { width: '100%', height: '120px', borderRadius: '16px', objectFit: 'cover', marginBottom: '10px' },
    fileInput: { fontSize: '0.85rem' },
    btnRow: { display: 'flex', gap: '15px', marginTop: '15px' },
    saveBtn: { flex: 2, padding: '16px', backgroundColor: '#131921', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' },
    cancelBtn: { flex: 1, padding: '16px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' }
};

export default EditVendorProfile;