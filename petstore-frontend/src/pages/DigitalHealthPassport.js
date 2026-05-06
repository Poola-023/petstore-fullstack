import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import PageNavigation from './PageNavigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✨ Direct import to fix 'not a function' error

const DigitalHealthPassport = ({ user, setUser, cart }) => {
    const { petId } = useParams();
    const navigate = useNavigate();

    const [pet, setPet] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = `http://${window.location.hostname}:8090/api`;

    // ✨ FETCH DATA LOGIC
    const fetchPassportData = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            // 1. Fetch Pet Details
            const petRes = await fetch(`${API_BASE}/pets/${petId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (petRes.ok) setPet(await petRes.json());

            // 2. Fetch Health Records (Assume endpoint exists)
            const recordRes = await fetch(`${API_BASE}/health-records/pet/${petId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (recordRes.ok) setRecords(await recordRes.json());

        } catch (err) {
            console.error("Health Passport sync failed:", err);
        } finally {
            setLoading(false);
        }
    }, [petId, API_BASE]);

    useEffect(() => {
        if (!user) navigate('/login');
        fetchPassportData();
    }, [user, navigate, fetchPassportData]);

    // ✨ THE CORRECTED PDF GENERATOR
    const generatePawsport = () => {
        const doc = new jsPDF();

        // 1. Header & Branding
        doc.setFillColor(19, 25, 33); // Navy
        doc.rect(0, 0, 210, 45, 'F');

        doc.setTextColor(255, 153, 0); // Orange
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("PET & CONNECT", 20, 28);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("OFFICIAL DIGITAL HEALTH PASSPORT", 145, 28);

        // 2. Pet Image (If exists)
        if (pet?.image) {
            try {
                doc.addImage(`data:image/jpeg;base64,${pet.image}`, 'JPEG', 155, 55, 35, 35);
            } catch (e) { console.error("PDF Image add failed"); }
        }

        // 3. Identity Table
        doc.setTextColor(19, 25, 33);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`Companion Profile: ${pet?.breed || 'Unknown'}`, 20, 60);

        const identityData = [
            ["Passport ID", pet?.id || 'N/A'],
            ["Breed / Category", `${pet?.breed} (${pet?.category})`],
            ["Guardian Name", user?.username || 'Verified Member'],
            ["Verification Status", "✅ Fully Certified"]
        ];

        autoTable(doc, {
            startY: 70,
            margin: { left: 20 },
            tableWidth: 120,
            head: [['Attribute', 'Details']],
            body: identityData,
            theme: 'striped',
            headStyles: { fillColor: [19, 25, 33], textColor: [255, 153, 0] },
            styles: { fontSize: 9 }
        });

        // 4. Vaccination & Medical Records Table
        const nextY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.text("Medical & Vaccination Timeline", 20, nextY);

        const medicalBody = records.map(r => [
            new Date(r.date || r.entryDate).toLocaleDateString(),
            r.vaccineName || r.title,
            r.doseNumber || '-',
            r.status || 'Verified'
        ]);

        autoTable(doc, {
            startY: nextY + 8,
            margin: { left: 20, right: 20 },
            head: [['Date', 'Treatment / Vaccine', 'Dose', 'Status']],
            body: medicalBody.length > 0 ? medicalBody : [['-', 'No medical records found in vault', '-', '-']],
            headStyles: { fillColor: [255, 153, 0], textColor: [19, 25, 33] },
            styles: { fontSize: 9, halign: 'center' }
        });

        // 5. Footer / Security Stamp
        const finalY = doc.lastAutoTable.finalY + 30;
        doc.setDrawColor(226, 232, 240);
        doc.line(20, finalY - 5, 190, finalY - 5);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("This document is a certified digital copy of the pet's growth and health history.", 20, finalY);
        doc.text(`Issued by Pet & Connect Hyderabad Hub | Timestamp: ${new Date().toLocaleString()}`, 20, finalY + 5);

        // 6. Save File
        doc.save(`${pet?.breed}_Health_Passport.pdf`);
    };

    if (loading) return <div style={styles.loader}>Accessing Health Vault...</div>;

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <PageNavigation />

            <div style={styles.container}>
                <header style={styles.header}>
                    <div style={styles.titleSection}>
                        <span style={styles.badge}>MEMBER EXCLUSIVE</span>
                        <h1 style={styles.title}>Digital <span style={{color: '#FF9900'}}>Pawsport</span></h1>
                        <p style={styles.subtitle}>Official medical records for {pet?.breed}.</p>
                    </div>
                    <button style={styles.downloadBtn} onClick={generatePawsport}>
                        <span style={{fontSize: '1.2rem'}}>📥</span> Download PDF
                    </button>
                </header>

                <div style={styles.vaultCard}>
                    <div style={styles.vaultHeader}>
                        <div style={styles.petCircle}>
                            <img src={`data:image/jpeg;base64,${pet?.image}`} alt="pet" style={styles.petImg} />
                        </div>
                        <div style={styles.vaultMeta}>
                            <h2 style={styles.petName}>{pet?.breed}</h2>
                            <p style={styles.idText}>SECURE VAULT ID: {pet?.id}</p>
                        </div>
                    </div>

                    <div style={styles.recordList}>
                        <h3 style={styles.recordTitle}>Stored Records ({records.length})</h3>
                        {records.length === 0 ? (
                            <div style={styles.emptyState}>No medical history logged yet.</div>
                        ) : (
                            records.map(record => (
                                <div key={record.id} style={styles.recordItem}>
                                    <div style={styles.recordDate}>
                                        {new Date(record.date).toLocaleDateString()}
                                    </div>
                                    <div style={styles.recordInfo}>
                                        <p style={styles.treatment}>{record.vaccineName}</p>
                                        <span style={styles.statusLabel}>{record.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' },
    badge: { color: '#FF9900', fontWeight: '900', fontSize: '0.7rem', letterSpacing: '1.5px' },
    title: { fontSize: '3rem', fontWeight: '950', color: '#131921', margin: '10px 0' },
    subtitle: { color: '#64748B', fontSize: '1.1rem', fontWeight: '500' },

    downloadBtn: {
        backgroundColor: '#131921', color: '#fff', border: 'none', padding: '16px 30px',
        borderRadius: '18px', fontWeight: '900', cursor: 'pointer', display: 'flex',
        alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(19,25,33,0.15)'
    },

    vaultCard: { backgroundColor: '#fff', borderRadius: '40px', padding: '50px', border: '1px solid #F1F5F9', boxShadow: '0 20px 60px rgba(0,0,0,0.03)' },
    vaultHeader: { display: 'flex', alignItems: 'center', gap: '30px', borderBottom: '1px solid #F1F5F9', paddingBottom: '40px', marginBottom: '40px' },
    petCircle: { width: '120px', height: '120px', borderRadius: '40px', overflow: 'hidden', border: '4px solid #F8FAFC' },
    petImg: { width: '100%', height: '100%', objectFit: 'cover' },
    petName: { fontSize: '2.2rem', fontWeight: '900', color: '#131921', margin: 0 },
    idText: { color: '#94A3B8', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '1px', marginTop: '5px' },

    recordList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    recordTitle: { fontSize: '1.2rem', fontWeight: '800', marginBottom: '10px' },
    recordItem: { display: 'flex', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '20px', alignItems: 'center', gap: '30px' },
    recordDate: { fontWeight: '900', color: '#131921', fontSize: '0.9rem' },
    treatment: { fontWeight: '700', color: '#1e293b', margin: 0 },
    statusLabel: { color: '#059669', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase' },

    loader: { textAlign: 'center', padding: '100px', fontWeight: '900', color: '#94A3B8' },
    emptyState: { padding: '40px', textAlign: 'center', color: '#94A3B8', border: '2px dashed #E2E8F0', borderRadius: '25px' }
};

export default DigitalHealthPassport;