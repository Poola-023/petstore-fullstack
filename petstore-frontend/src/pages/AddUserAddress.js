import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AddUserAddress = ({ user }) => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const editData = state?.editAddress;

    // Capture initial state so we can reset to it
    const initialState = {
        addressId: editData?.addressId || null,
        fullName: editData?.fullName || user?.username || '',
        mobile: editData?.mobile || '',
        altMobile: editData?.altMobile || '',
        houseDetails: editData?.houseDetails || '',
        areaLocality: editData?.areaLocality || '',
        pincode: editData?.pincode || '',
        addressType: editData?.addressType || 'HOME'
    };

    const [formData, setFormData] = useState(initialState);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Basic validation
        if (!formData.fullName || !formData.mobile || !formData.houseDetails || !formData.areaLocality || !formData.pincode) {
            alert("Please fill in all required fields marked with an asterisk (*).");
            return;
        }

        try {
            const res = await fetch(`http://${window.location.hostname}:8090/api/address/save/${user.userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert(formData.addressId ? "Address updated successfully!" : "New address added!");
                navigate('/addresses');
            }
        } catch (err) { alert("Server error."); }
    };

    const handleReset = () => {
        setFormData(initialState);
    };

    const handleCancel = () => {
        navigate('/addresses');
    };

    return (
        <div style={styles.page}>
            <div style={styles.formContainer}>

                {/* ✨ Form Header mimicking the image */}
                <div style={styles.formHeader}>
                    <div style={styles.formTitle}>
                        {formData.addressId ? 'Edit Address Details' : 'Add New Address'}
                    </div>
                    <div style={styles.formActions}>
                        <span style={styles.actionLink} onClick={handleSubmit}>Save</span>
                        <span style={styles.separator}> | </span>
                        <span style={styles.actionLink} onClick={handleReset}>Reset</span>
                        <span style={styles.separator}> | </span>
                        <span style={styles.actionLink} onClick={handleCancel}>Cancel</span>
                    </div>
                </div>

                {/* ✨ Form Body mimicking the 3-column grid from the image */}
                <div style={styles.formBody}>
                    <div style={styles.grid3Col}>

                        {/* ROW 1 */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>*Recipient Name</label>
                            <input style={styles.input} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>*Mobile Number</label>
                            <input style={styles.input} value={formData.mobile} maxLength="10" onChange={e => setFormData({...formData, mobile: e.target.value})} required />
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Alt Mobile</label>
                            <input style={styles.input} value={formData.altMobile} maxLength="10" onChange={e => setFormData({...formData, altMobile: e.target.value})} />
                        </div>

                        {/* ROW 2 */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>*House/Building</label>
                            <input style={styles.input} value={formData.houseDetails} onChange={e => setFormData({...formData, houseDetails: e.target.value})} required />
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>*Area/Locality</label>
                            <input style={styles.input} value={formData.areaLocality} onChange={e => setFormData({...formData, areaLocality: e.target.value})} required />
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>*Pincode</label>
                            <input style={styles.input} value={formData.pincode} maxLength="6" onChange={e => setFormData({...formData, pincode: e.target.value})} required />
                        </div>

                        {/* ROW 3 */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>*Position/Type</label>
                            <select style={styles.select} value={formData.addressType} onChange={e => setFormData({...formData, addressType: e.target.value})}>
                                <option value="HOME">HOME</option>
                                <option value="WORK">WORK</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

const styles = {
    // Light gray background for the whole page to make the white form pop
    page: { backgroundColor: '#F4F4F4', minHeight: '100vh', padding: '20px', fontFamily: "Arial, sans-serif" },

    // Wide container
    formContainer: { width: '100%', maxWidth: '1200px', margin: '0 auto', border: '1px solid #B0B0B0', backgroundColor: '#F9F9F9' },

    // Header styling matching the image (gray background, blue links)
    formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E0E0E0', padding: '8px 12px', borderBottom: '1px solid #B0B0B0' },
    formTitle: { fontSize: '0.9rem', fontWeight: 'bold', color: '#333' },

    formActions: { fontSize: '0.85rem' },
    actionLink: { color: '#003399', cursor: 'pointer', textDecoration: 'none' },
    separator: { color: '#666', margin: '0 4px' },

    // Form body styling
    formBody: { padding: '20px' },

    // 3-column grid layout exactly like the image
    grid3Col: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px 40px' },

    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },

    // Tiny enterprise-style labels
    label: { fontSize: '0.8rem', color: '#555' },

    // Standard rectangular inputs
    input: { padding: '6px 8px', border: '1px solid #A0A0A0', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', backgroundColor: '#FFF' },
    select: { padding: '6px 8px', border: '1px solid #A0A0A0', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box', backgroundColor: '#FFF' }
};

export default AddUserAddress;