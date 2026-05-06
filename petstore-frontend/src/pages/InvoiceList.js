import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InvoiceList = ({ user }) => {
    const [invoices, setInvoices] = useState([]);
    const API = `http://${window.location.hostname}:8090/api/invoices/user/${user?.userId || user?.id}`;

    useEffect(() => {
        const fetchInvoices = async () => {
            const token = localStorage.getItem('token');
            const res = await fetch(API, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setInvoices(await res.json());
        };
        if (user) fetchInvoices();
    }, [API, user]);

    // ✨ NEW: PDF Generator Function
    const downloadPDF = (inv) => {
        const doc = new jsPDF();

        // Header Branding
        doc.setFontSize(22);
        doc.setTextColor(255, 153, 0); // Orange
        doc.text("Pet & Connect", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Official Digital Care Receipt", 14, 28);
        doc.text(`Issued to: ${user?.username || 'Valued Member'}`, 14, 34);

        // Invoice Meta
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Invoice ID: ${inv.id}`, 140, 20);
        doc.text(`Date: ${new Date(inv.issuedDate).toLocaleDateString()}`, 140, 28);

        // Horizontal Line
        doc.setLineWidth(0.5);
        doc.line(14, 40, 196, 40);

        // Table Data
        const tableColumn = ["Description", "Category", "Amount (INR)"];
        const tableRows = [
            [
                inv.itemType === 'SERVICE' ? 'Professional Pet Care Service' : 'Companion Adoption Fee',
                inv.itemType,
                `INR ${inv.amount.toLocaleString()}`
            ],
            ["GST (18%)", "Tax", `INR ${inv.tax.toLocaleString()}`]
        ];

        doc.autoTable({
            startY: 50,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [19, 25, 33] } // Dark Navy
        });

        // Grand Total
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Grand Total: INR ${inv.total.toLocaleString()}`, 140, finalY);

        // Footer
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("Thank you for trusting Pet & Connect with your companion's care.", 14, finalY + 20);

        doc.save(`${inv.id}_Receipt.pdf`);
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} />
            <div style={styles.container}>
                <h1 style={styles.title}>Billing & Receipts</h1>
                <div style={styles.grid}>
                    {invoices.length === 0 ? (
                        <p style={styles.empty}>No invoices found in your digital vault.</p>
                    ) : (
                        invoices.map(inv => (
                            <div key={inv.id} style={styles.card}>
                                <div style={styles.cardLeft}>
                                    <span style={styles.invId}>{inv.id}</span>
                                    <p style={styles.date}>{new Date(inv.issuedDate).toLocaleDateString()}</p>
                                </div>
                                <div style={styles.cardRight}>
                                    <p style={styles.typeTag}>{inv.itemType}</p>
                                    <h3 style={styles.total}>₹{inv.total.toLocaleString()}</h3>
                                    <button style={styles.downloadBtn} onClick={() => downloadPDF(inv)}>
                                        📥 Download PDF
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    container: { padding: '60px 10%', maxWidth: '900px', margin: '0 auto' },
    title: { fontSize: '2.5rem', fontWeight: '900', color: '#131921', marginBottom: '40px' },
    grid: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', border: '1px solid #EAEAEA', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    cardLeft: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    invId: { fontWeight: '900', color: '#FF9900', fontSize: '1.1rem' },
    date: { color: '#6B7280', marginTop: '5px', fontSize: '0.9rem' },
    cardRight: { textAlign: 'right' },
    typeTag: { fontSize: '0.7rem', fontWeight: '800', background: '#F3F4F6', color: '#4B5563', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' },
    total: { margin: '10px 0 15px 0', fontSize: '1.6rem', fontWeight: '900', color: '#131921' },
    downloadBtn: { padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#131921', color: '#fff', fontWeight: '800', cursor: 'pointer', transition: '0.2s' },
    empty: { textAlign: 'center', color: '#9CA3AF', marginTop: '50px' }
};

export default InvoiceList;