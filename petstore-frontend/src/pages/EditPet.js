import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EditPet = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Safety check: if state is lost on refresh, redirect back
    const [pet, setPet] = useState(state?.pet || null);
    const [newImage, setNewImage] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!pet) {
            navigate('/vendor-dashboard');
        }
    }, [pet, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        // These keys must match the @RequestParam names in Java exactly
        formData.append("name", pet.name);
        formData.append("breed", pet.breed);
        formData.append("price", pet.price);
        formData.append("quantity", pet.quantity);
        formData.append("description", pet.description || "");

        if (newImage) {
            formData.append("image", newImage);
        }

        try {
            const res = await fetch(`http://localhost:8090/api/pets/update/${pet.id}`, {
                method: 'PUT',
                // DO NOT set Content-Type header; browser does it for FormData
                body: formData
            });

            if (res.ok) {
                alert("Pet updated successfully!");
                navigate('/vendor-dashboard', { state: { activeTab: 'products' } });
            } else {
                const errorMsg = await res.text();
                console.error("Server Error:", errorMsg);
                alert("Update failed. Check if all fields are filled.");
            }
        } catch (err) {
            console.error("Network error:", err);
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this pet?")) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/api/pets/delete/${pet.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert("Pet deleted successfully.");
                navigate('/vendor-dashboard', { state: { activeTab: 'products' } });
            }
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!pet) return <div style={{padding: '50px', textAlign: 'center'}}>Redirecting...</div>;

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Edit Pet: {pet.name}</h2>

                <div style={styles.imgBox}>
                    <img
                        src={preview || `data:image/jpeg;base64,${pet.image}`}
                        style={styles.petImg}
                        alt="Pet Preview"
                    />
                    <label style={styles.fileLabel}>
                        Change Pet Photo
                        <input
                            type="file"
                            hidden
                            onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                    setNewImage(file);
                                    setPreview(URL.createObjectURL(file));
                                }
                            }}
                            accept="image/*"
                        />
                    </label>
                </div>

                <form onSubmit={handleUpdate} style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.group}>
                            <label style={styles.inputLabel}>Pet Name</label>
                            <input
                                style={styles.input}
                                value={pet.name}
                                onChange={e => setPet({...pet, name: e.target.value})}
                                required
                            />
                        </div>
                        <div style={styles.group}>
                            <label style={styles.inputLabel}>Breed</label>
                            <input
                                style={styles.input}
                                value={pet.breed}
                                onChange={e => setPet({...pet, breed: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.group}>
                            <label style={styles.inputLabel}>Price (₹)</label>
                            <input
                                style={styles.input}
                                type="number"
                                value={pet.price}
                                onChange={e => setPet({...pet, price: e.target.value})}
                                required
                            />
                        </div>
                        <div style={styles.group}>
                            <label style={styles.inputLabel}>Available Stock</label>
                            <input
                                style={styles.input}
                                type="number"
                                value={pet.quantity}
                                onChange={e => setPet({...pet, quantity: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.group}>
                        <label style={styles.inputLabel}>Description</label>
                        <textarea
                            style={styles.textarea}
                            value={pet.description}
                            onChange={e => setPet({...pet, description: e.target.value})}
                            placeholder="Tell potential owners about this pet's soulful personality..."
                        />
                    </div>

                    <div style={styles.buttonContainer}>
                        <button type="submit" style={styles.saveBtn} disabled={loading}>
                            {loading ? "Saving Changes..." : "Update Pet Details"}
                        </button>
                        <button type="button" style={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
                            Delete Listing
                        </button>
                    </div>

                    <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>
                        Cancel and Go Back
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' },
    card: { backgroundColor: '#fff', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '550px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
    title: { textAlign: 'center', marginBottom: '30px', fontWeight: '800', fontSize: '1.8rem', color: '#0f172a' },
    imgBox: { textAlign: 'center', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    petImg: { width: '160px', height: '160px', borderRadius: '24px', objectFit: 'cover', border: '4px solid #f1f5f9', boxShadow: '0 8px 15px rgba(0,0,0,0.05)' },
    fileLabel: { display: 'block', marginTop: '12px', color: '#0ea5e9', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    row: { display: 'flex', gap: '20px' },
    group: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    inputLabel: { fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginLeft: '4px' },
    input: { padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' },
    textarea: { padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', minHeight: '100px', fontSize: '1rem', resize: 'vertical', outline: 'none' },
    buttonContainer: { display: 'flex', gap: '15px', marginTop: '10px' },
    saveBtn: { flex: 2, padding: '16px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)' },
    deleteBtn: { flex: 1, padding: '16px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' },
    cancelBtn: { padding: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }
};

export default EditPet;