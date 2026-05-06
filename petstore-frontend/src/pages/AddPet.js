import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const breedOptions = {
    Dog: [
        "Labrador Retriever", "German Shepherd", "Golden Retriever", "Bulldog", "Poodle",
        "Beagle", "Rottweiler", "Siberian Husky", "Doberman Pinscher", "Pomeranian",
        "Dachshund", "Great Dane", "Shih Tzu", "Chihuahua", "Border Collie"
    ],
    Cat: [
        "Persian Cat", "Siamese Cat", "Maine Coon", "Bengal Cat", "British Shorthair",
        "Ragdoll", "Sphynx Cat", "Scottish Fold", "American Shorthair", "Abyssinian Cat",
        "Russian Blue", "Birman"
    ]
};

const AddPet = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✨ SECURITY HELPER: Get JWT Token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // ✨ FIXED: Check the correct 'user' key and ensure they have a token
    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('vendor'));
        const token = localStorage.getItem('token');

        if (!currentUser || !token || currentUser.role !== 'VENDOR') {
            navigate('/vendor-login');
        } else {
            setVendor(currentUser);
        }
    }, [navigate]);

    const defaultPetState = {
        category: 'Dog',
        breed: '',
        color: '',
        dob: '',
        price: '',
        maleQuantity: '0',
        femaleQuantity: '0',
        isVaccinated: 'no',
        vaccinationDose: '',
        description: '',
        image: null
    };

    const [bulkPets, setBulkPets] = useState([{ ...defaultPetState }]);

    const handleBulkChange = (index, field, value) => {
        const updatedPets = [...bulkPets];
        updatedPets[index][field] = value;

        if (field === 'isVaccinated' && value === 'no') {
            updatedPets[index]['vaccinationDose'] = '';
        }
        if (field === 'category') {
            updatedPets[index]['breed'] = '';
        }

        setBulkPets(updatedPets);
    };

    const handleBulkImageUpload = (index, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            handleBulkChange(index, 'image', base64String);
        };
        reader.readAsDataURL(file);
    };

    const addBulkRow = () => {
        setBulkPets([...bulkPets, { ...defaultPetState }]);
    };

    const removeBulkRow = (index) => {
        const updatedPets = bulkPets.filter((_, i) => i !== index);
        setBulkPets(updatedPets);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!vendor) return navigate('/vendor-login');

        const finalBulkData = bulkPets
            .filter(pet => pet.breed.trim() !== '' && pet.price !== '')
            .map(pet => ({
                ...pet,
                vendorId: vendor.id || vendor.vendorId, // ✨ FIXED: Safely get Vendor ID
                quantity: String((parseInt(pet.maleQuantity) || 0) + (parseInt(pet.femaleQuantity) || 0))
            }));

        if (finalBulkData.length === 0) {
            alert("Please fill in all required fields (Breed, Price) for at least one pet.");
            setLoading(false);
            return;
        }

        const invalidQuantities = finalBulkData.some(pet => parseInt(pet.quantity) === 0);
        if (invalidQuantities) {
            alert("Please ensure every listed pet has at least 1 Male or 1 Female specified.");
            setLoading(false);
            return;
        }

        try {
            // ✨ FIXED: Added Auth Headers to the Fetch call
            const res = await fetch(`http://${window.location.hostname}:8090/api/pets/saveBulk`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(finalBulkData)
            });

            if (res.ok) {
                alert(`Successfully added ${finalBulkData.length} pet listings!`);
                navigate('/vendor-dashboard', { state: { activeTab: 'products' } });
            } else {
                const errorText = await res.text();
                alert(`Failed to save pets.\nServer says: ${errorText}`);
            }
        } catch (err) {
            alert("Could not connect to the server.");
        }
        finally { setLoading(false); }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <button onClick={() => navigate('/vendor-dashboard', { state: { activeTab: 'products' } })} style={styles.backBtn}>←</button>
                        <h2 style={styles.title}>Add Multiple Pets</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.bulkNote}>
                        <strong>Tip:</strong> The total available quantity is automatically calculated based on your Male (♂) and Female (♀) inputs!
                    </div>

                    {bulkPets.map((pet, index) => (
                        <div key={index} style={styles.bulkRowCard}>

                            {/* --- ROW 1: Basic Info & Image --- */}
                            <div style={styles.bulkRow}>
                                <div style={styles.bulkNumber}>{index + 1}</div>

                                <select style={{...styles.bulkInput, width: '120px'}} value={pet.category} onChange={e => handleBulkChange(index, 'category', e.target.value)}>
                                    <option value="Dog">Dog</option>
                                    <option value="Cat">Cat</option>
                                    <option value="Bird">Bird</option>
                                    <option value="Other">Other</option>
                                </select>

                                {breedOptions[pet.category] ? (
                                    <select style={{...styles.bulkInput, flex: 1.5}} value={pet.breed} onChange={e => handleBulkChange(index, 'breed', e.target.value)} required >
                                        <option value="" disabled>Select Breed *</option>
                                        {breedOptions[pet.category].map(breed => (
                                            <option key={breed} value={breed}>{breed}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input style={{...styles.bulkInput, flex: 1.5}} placeholder="Enter Breed *" value={pet.breed} onChange={e => handleBulkChange(index, 'breed', e.target.value)} required />
                                )}

                                <input style={{...styles.bulkInput, flex: 1}} placeholder="Colour" value={pet.color} onChange={e => handleBulkChange(index, 'color', e.target.value)} />

                                <div style={styles.dateWrapper}>
                                    <span style={styles.dateLabel}>DOB</span>
                                    <input style={styles.dateInput} type="date" value={pet.dob} onChange={e => handleBulkChange(index, 'dob', e.target.value)} required />
                                </div>

                                <input style={{...styles.bulkInput, width: '110px'}} type="number" placeholder="Price (₹) *" value={pet.price} onChange={e => handleBulkChange(index, 'price', e.target.value)} required />

                                <div style={styles.bulkFileContainer}>
                                    <input type="file" accept="image/*" style={styles.bulkFileInput} title="Upload Pet Image" onChange={(e) => handleBulkImageUpload(index, e.target.files[0])} />
                                    {pet.image && <span style={styles.fileSuccess}>✓ Image Set</span>}
                                </div>
                            </div>

                            {/* --- ROW 2: Quantities, Vaccines, Description --- */}
                            <div style={{...styles.bulkRow, marginTop: '12px', paddingLeft: '35px'}}>

                                <div style={styles.qtyWrapper}>
                                    <span style={styles.qtyLabel}>♂</span>
                                    <input style={styles.qtyInput} type="number" min="0" placeholder="0" value={pet.maleQuantity} onChange={e => handleBulkChange(index, 'maleQuantity', e.target.value)} />
                                </div>
                                <div style={styles.qtyWrapper}>
                                    <span style={{...styles.qtyLabel, color: '#ec4899'}}>♀</span>
                                    <input style={styles.qtyInput} type="number" min="0" placeholder="0" value={pet.femaleQuantity} onChange={e => handleBulkChange(index, 'femaleQuantity', e.target.value)} />
                                </div>

                                <select style={{...styles.bulkInput, width: '140px'}} value={pet.isVaccinated} onChange={e => handleBulkChange(index, 'isVaccinated', e.target.value)}>
                                    <option value="no">Not Vaccinated</option>
                                    <option value="yes">Vaccinated</option>
                                </select>

                                {pet.isVaccinated === 'yes' && (
                                    <select style={{...styles.bulkInput, width: '140px'}} value={pet.vaccinationDose} onChange={e => handleBulkChange(index, 'vaccinationDose', e.target.value)} required >
                                        <option value="" disabled>Select Dose...</option>
                                        <option value="1st">1st Dose</option>
                                        <option value="2nd">2nd Dose</option>
                                        <option value="3rd">3rd Dose</option>
                                        <option value="Fully">Fully Vaccinated</option>
                                    </select>
                                )}

                                <input style={{...styles.bulkInput, flex: 1}} placeholder="Description (Add characteristics, temperament, info...)" value={pet.description} onChange={e => handleBulkChange(index, 'description', e.target.value)} />

                                {bulkPets.length > 1 ? (
                                    <button type="button" style={styles.removeBtn} onClick={() => removeBulkRow(index)}>✕</button>
                                ) : (
                                    <div style={{width: '35px'}}></div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px'}}>
                        <button type="button" style={styles.addBtn} onClick={addBulkRow}>+ Add Another Pet</button>
                        <button type="submit" disabled={loading} style={styles.saveBtnBulk}>
                            {loading ? "Saving All..." : `Save ${bulkPets.length} Listings`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', fontFamily: 'Inter, sans-serif' },
    card: { backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '1200px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', marginBottom: '50px' },
    cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 25px', borderBottom: '1px solid #f1f5f9' },
    backBtn: { background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem', padding: '8px 12px', borderRadius: '8px', marginRight: '15px' },
    title: { color: '#1e293b', margin: 0, fontSize: '1.25rem', fontWeight: '700' },

    form: { padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' },
    bulkNote: { backgroundColor: '#F0FDF4', color: '#166534', padding: '12px 15px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #DCFCE7' },
    bulkRowCard: { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', backgroundColor: '#f8fafc', transition: 'box-shadow 0.2s', ':hover': { boxShadow: '0 4px 10px rgba(0,0,0,0.03)' } },

    bulkRow: { display: 'flex', gap: '12px', alignItems: 'center' },
    bulkNumber: { fontWeight: 'bold', color: '#94a3b8', width: '20px', textAlign: 'center', fontSize: '0.9rem' },
    bulkInput: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' },

    dateWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', padding: '0 5px' },
    dateLabel: { fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', paddingRight: '5px', borderRight: '1px solid #e2e8f0' },
    dateInput: { border: 'none', outline: 'none', padding: '8px', fontSize: '0.85rem', width: '110px' },

    qtyWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' },
    qtyLabel: { padding: '0 12px', fontSize: '1.1rem', color: '#3b82f6', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' },
    qtyInput: { border: 'none', outline: 'none', padding: '10px', fontSize: '0.9rem', width: '50px', textAlign: 'center' },

    bulkFileContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '130px', marginLeft: '5px' },
    bulkFileInput: { fontSize: '0.75rem', width: '100%', cursor: 'pointer' },
    fileSuccess: { fontSize: '0.7rem', color: '#16a34a', fontWeight: 'bold', marginTop: '4px' },

    removeBtn: { backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', width: '35px', height: '35px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
    addBtn: { backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' },
    saveBtnBulk: { padding: '12px 30px', backgroundColor: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'opacity 0.2s' }
};

export default AddPet;