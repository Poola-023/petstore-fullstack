import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const UserAddress = ({ user, setUser, cart }) => {
    const [addresses, setAddresses] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [showAll, setShowAll] = useState(false);

    // Inline Form States
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [initialData, setInitialData] = useState({});
    const formRef = useRef(null);

    const PAGE_SIZE = 5;
    const navigate = useNavigate();
    const API = `http://${window.location.hostname}:8090/api/address`;

    // ✨ HELPER: Get JWT Headers for Security
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // ✨ FIXED: Consolidated Fetch Logic
    const fetchAddressesPage = async (page = 0, isShowAll = showAll) => {
        const userId = user?.userId || user?.id;
        if (!userId) return;

        try {
            const res = await fetch(`${API}/fetch/${userId}?page=${page}&size=${PAGE_SIZE}&showAll=${isShowAll}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAddresses(data);
                    setTotalElements(data.length);
                    setTotalPages(1);
                    setCurrentPage(0);
                } else {
                    setAddresses(data.content || []);
                    setCurrentPage(data.number || 0);
                    setTotalPages(data.totalPages || 1);
                    setTotalElements(data.totalElements || 0);
                }
            } else { setAddresses([]); }
        } catch (err) { console.error("Error fetching addresses:", err); }
    };

    // Initial Load & Dependencies
    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchAddressesPage(currentPage, showAll);
        }
    }, [user, currentPage, showAll]);

    // Scroll to form when it opens
    useEffect(() => {
        if (showForm && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [showForm]);

    const handleToggleShowAll = (e) => {
        setShowAll(e.target.checked);
        setCurrentPage(0);
    };

    const handleNextPage = () => { if (currentPage < totalPages - 1) fetchAddressesPage(currentPage + 1, showAll); };
    const handlePrevPage = () => { if (currentPage > 0) fetchAddressesPage(currentPage - 1, showAll); };

    const handleAddNew = () => {
        const emptyForm = {
            addressId: null,
            fullName: user?.username || '',
            mobile: '',
            altMobile: '',
            houseDetails: '',
            areaLocality: '',
            city: '',
            pincode: '',
            addressType: 'HOME'
        };
        setFormData(emptyForm);
        setInitialData(emptyForm);
        setShowForm(true);
    };

    const handleRowClick = (addr) => {
        setFormData({ ...addr });
        setInitialData({ ...addr });
        setShowForm(true);
    };

    const handleFormSubmit = async () => {
        if (!formData.fullName || !formData.mobile || !formData.houseDetails || !formData.areaLocality || !formData.pincode) {
            alert("Please fill in all required fields marked with an asterisk (*).");
            return;
        }

        try {
            const userId = user?.userId || user?.id;
            const res = await fetch(`${API}/save/${userId}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert(formData.addressId ? "Address updated successfully!" : "New address added!");
                setShowForm(false);
                fetchAddressesPage(currentPage, showAll);
            }
        } catch (err) { alert("Server error while saving."); }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to remove this location?")) {
            await fetch(`${API}/delete/${formData.addressId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            setShowForm(false);
            fetchAddressesPage(currentPage, showAll);
        }
    };

    const startItem = totalElements === 0 ? 0 : (currentPage * (showAll ? PAGE_SIZE : 1)) + 1;
    const endItem = Math.min((currentPage + 1) * (showAll ? PAGE_SIZE : 1), totalElements);

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <div style={styles.container}>

                <div style={styles.headerRow}>
                    <div style={styles.brandGroup}>
                        <h2 style={styles.title}>Boutique Addresses</h2>
                        <p style={styles.subtitle}>CONNECT • CARE • COMPANION</p>
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    <div style={styles.tableToolbar}>
                        <div style={styles.toolbarLeft}>
                            <h3 style={styles.tableTitle}>Delivery Address</h3>
                            <label style={styles.checkboxLabel}>
                                <input type="checkbox" checked={showAll} onChange={handleToggleShowAll} style={styles.checkbox} />
                                Show all Addresses
                            </label>
                        </div>
                        <button style={styles.addBtn} onClick={handleAddNew}>+ Add New Address</button>
                    </div>

                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Type</th>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>House Details</th>
                                <th style={styles.th}>Locality</th>
                                <th style={styles.th}>City & Pincode</th>
                                <th style={styles.th}>Mobile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addresses.length === 0 ? (
                                <tr><td colSpan="6" style={styles.emptyText}>No addresses found.</td></tr>
                            ) : (
                                addresses.map(addr => (
                                    <tr key={addr.addressId} style={styles.clickableTr} onClick={() => handleRowClick(addr)}>
                                        <td style={styles.td}><span style={styles.badge}>{addr.addressType}</span></td>
                                        <td style={styles.td}><strong style={styles.strongText}>{addr.fullName}</strong></td>
                                        <td style={styles.td}>{addr.houseDetails}</td>
                                        <td style={styles.td}>{addr.areaLocality}</td>
                                        <td style={styles.td}>{addr.city} - {addr.pincode}</td>
                                        <td style={styles.td}>📞 {addr.mobile}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {totalElements > 0 && (
                        <div style={styles.tableFooter}>
                            <div style={styles.showingText}>
                                Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalElements}</strong> addresses
                            </div>
                            <div style={styles.pageNumberGroup}>
                                <button style={{ ...styles.arrowBtn, opacity: currentPage === 0 ? 0.4 : 1 }} onClick={handlePrevPage} disabled={currentPage === 0}>&laquo;</button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button key={idx} onClick={() => fetchAddressesPage(idx, showAll)} style={{ ...styles.pageNumberBtn, backgroundColor: currentPage === idx ? '#FF9900' : 'transparent', color: currentPage === idx ? '#fff' : '#131921', borderColor: currentPage === idx ? '#FF9900' : '#EAEAEA' }}>{idx + 1}</button>
                                ))}
                                <button style={{ ...styles.arrowBtn, opacity: currentPage >= totalPages - 1 ? 0.4 : 1 }} onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>&raquo;</button>
                            </div>
                        </div>
                    )}
                </div>

                {showForm && (
                    <div ref={formRef} style={styles.formContainerWrapper}>
                        <div style={styles.enterpriseFormContainer}>
                            <div style={styles.formHeader}>
                                <h3 style={styles.formTitle}>{formData.addressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</h3>
                                <div style={styles.formActions}>
                                    <span style={styles.actionLink} onClick={handleFormSubmit}>Save</span>
                                    <span style={styles.separator}> | </span>
                                    <span style={styles.actionLink} onClick={() => setFormData(initialData)}>Reset</span>
                                    {formData.addressId && (
                                        <>
                                            <span style={styles.separator}> | </span>
                                            <span style={styles.actionLinkDanger} onClick={handleDelete}>Delete</span>
                                        </>
                                    )}
                                    <span style={styles.separator}> | </span>
                                    <span style={styles.actionLink} onClick={() => setShowForm(false)}>Cancel</span>
                                </div>
                            </div>

                            <div style={styles.formBody}>
                                <div style={styles.grid3Col}>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>*Recipient Name</label>
                                        <input style={styles.input} value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                                    </div>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>*Mobile Number</label>
                                        <input style={styles.input} value={formData.mobile || ''} maxLength="10" onChange={e => setFormData({...formData, mobile: e.target.value})} />
                                    </div>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>City</label>
                                        <input style={styles.input} value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
                                    </div>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>*House/Building</label>
                                        <input style={styles.input} value={formData.houseDetails || ''} onChange={e => setFormData({...formData, houseDetails: e.target.value})} />
                                    </div>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>*Area/Locality</label>
                                        <input style={styles.input} value={formData.areaLocality || ''} onChange={e => setFormData({...formData, areaLocality: e.target.value})} />
                                    </div>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>*Pincode</label>
                                        <input style={styles.input} value={formData.pincode || ''} maxLength="6" onChange={e => setFormData({...formData, pincode: e.target.value})} />
                                    </div>
                                    <div style={styles.fieldGroup}>
                                        <label style={styles.label}>Position/Type</label>
                                        <select style={styles.select} value={formData.addressType || 'HOME'} onChange={e => setFormData({...formData, addressType: e.target.value})}>
                                            <option value="HOME">HOME</option>
                                            <option value="WORK">WORK</option>
                                            <option value="OTHER">OTHER</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    container: { padding: '50px 8%', maxWidth: '1400px', margin: '0 auto' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
    title: { fontSize: '2rem', fontWeight: '900', color: '#131921', margin: 0 },
    subtitle: { fontSize: '0.7rem', color: '#FF9900', fontWeight: '800', letterSpacing: '3px', marginTop: '5px' },
    tableContainer: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #EAEAEA', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' },
    tableToolbar: { padding: '20px 25px', backgroundColor: '#FAFAFA', borderBottom: '1px solid #EAEAEA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    toolbarLeft: { display: 'flex', alignItems: 'center', gap: '25px' },
    tableTitle: { margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#131921' },
    checkboxLabel: { fontSize: '0.9rem', fontWeight: '700', color: '#636E72', display: 'flex', alignItems: 'center', cursor: 'pointer' },
    checkbox: { marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer', accentColor: '#FF9900' },
    addBtn: { backgroundColor: '#FF9900', color: '#131921', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '800', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '16px 25px', backgroundColor: '#fff', color: '#636E72', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', borderBottom: '1px solid #EAEAEA' },
    clickableTr: { borderBottom: '1px solid #EAEAEA', cursor: 'pointer', transition: '0.1s' },
    td: { padding: '20px 25px', fontSize: '0.95rem', color: '#131921' },
    strongText: { fontWeight: '800' },
    emptyText: { color: '#636E72', textAlign: 'center', padding: '40px' },
    badge: { backgroundColor: '#FFFAF5', color: '#FF9900', border: '1px solid #FFEDD5', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' },
    tableFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', backgroundColor: '#FAFAFA' },
    showingText: { fontSize: '0.9rem', color: '#636E72' },
    pageNumberGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
    arrowBtn: { backgroundColor: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' },
    pageNumberBtn: { width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' },
    formContainerWrapper: { marginTop: '30px' },
    enterpriseFormContainer: { border: '1px solid #EAEAEA', backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden' },
    formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA', padding: '20px 25px', borderBottom: '1px solid #EAEAEA' },
    formTitle: { fontSize: '1.2rem', fontWeight: '800', color: '#131921', margin: 0 },
    formActions: { fontSize: '0.9rem', fontWeight: '800' },
    actionLink: { color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' },
    actionLinkDanger: { color: '#EF4444', cursor: 'pointer', textDecoration: 'underline' },
    separator: { color: '#B2BEC3', margin: '0 10px' },
    formBody: { padding: '25px' },
    grid3Col: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.8rem', color: '#636E72', fontWeight: '800', textTransform: 'uppercase' },
    input: { padding: '12px 15px', border: '1.5px solid #EAEAEA', borderRadius: '10px', backgroundColor: '#F9FAFB', outline: 'none' },
    select: { padding: '12px 15px', border: '1.5px solid #EAEAEA', borderRadius: '10px', backgroundColor: '#F9FAFB', outline: 'none' }
};

export default UserAddress;