import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SubFooter from './SubFooter';

const ServiceBooking = ({ user, setUser, cart }) => {
    const { petId } = useParams();
    const navigate = useNavigate();
    const [petName, setPetName] = useState("your companion");

    const [booking, setBooking] = useState({
        serviceType: '',
        date: '',
        time: '',
        notes: ''
    });

    const services = [
        { id: 'groom', name: 'Premium Grooming', icon: '✂️', price: 1200 },
        { id: 'vet', name: 'Vet Consultation', icon: '🩺', price: 800 },
        { id: 'train', name: 'Behavioral Training', icon: '🎾', price: 2000 }
    ];

    useEffect(() => {
        // Optional: Fetch pet name using petId to personalize the header
        fetch(`http://${window.location.hostname}:8090/api/pets/${petId}`)
            .then(res => res.json())
            .then(data => setPetName(data.breed || data.name))
            .catch(() => {});
    }, [petId]);

    const handleConfirmBooking = async () => {
        if (!booking.serviceType || !booking.date || !booking.time) {
            return alert("Please select a service, date, and time.");
        }

        const payload = {
            userId: user.userId || user.id,
            petId: petId,
            serviceType: booking.serviceType,
            appointmentTime: `${booking.date}T${booking.time}:00`,
            notes: booking.notes,
            price: services.find(s => s.name === booking.serviceType)?.price
        };

        try {
            const res = await fetch(`http://${window.location.hostname}:8090/api/services/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("✨ Booking Successful! Check your dashboard for updates.");
                navigate('/my-pets');
            }
        } catch (err) {
            alert("Connection error. Try again later.");
        }
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>Book Service for {petName}</h1>
                    <p style={styles.subtitle}>Select a professional care package below</p>
                </header>

                <div style={styles.serviceGrid}>
                    {services.map(s => (
                        <div
                            key={s.id}
                            style={{...styles.serviceCard, borderColor: booking.serviceType === s.name ? '#FF9900' : '#EAEAEA'}}
                            onClick={() => setBooking({...booking, serviceType: s.name})}
                        >
                            <span style={styles.icon}>{s.icon}</span>
                            <h3 style={styles.sName}>{s.name}</h3>
                            <p style={styles.sPrice}>₹{s.price}</p>
                        </div>
                    ))}
                </div>

                {booking.serviceType && (
                    <div style={styles.formCard}>
                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Preferred Date</label>
                                <input type="date" style={styles.input} onChange={e => setBooking({...booking, date: e.target.value})} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Preferred Time</label>
                                <input type="time" style={styles.input} onChange={e => setBooking({...booking, time: e.target.value})} />
                            </div>
                        </div>
                        <label style={styles.label}>Special Instructions</label>
                        <textarea
                            style={styles.textarea}
                            placeholder="e.g. My pet is shy around strangers..."
                            onChange={e => setBooking({...booking, notes: e.target.value})}
                        />
                        <button style={styles.confirmBtn} onClick={handleConfirmBooking}>Confirm Appointment</button>
                    </div>
                )}
            </div>
            <SubFooter />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    container: { padding: '50px 8%', maxWidth: '1000px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '40px' },
    title: { fontSize: '2.2rem', fontWeight: '900', color: '#131921' },
    subtitle: { color: '#6B7280', marginTop: '5px' },
    serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' },
    serviceCard: { background: '#fff', padding: '25px', borderRadius: '20px', border: '2px solid', textAlign: 'center', cursor: 'pointer', transition: '0.2s' },
    icon: { fontSize: '2.5rem', display: 'block', marginBottom: '10px' },
    sName: { margin: '0 0 5px 0', fontWeight: '800' },
    sPrice: { color: '#FF9900', fontWeight: '900', fontSize: '1.2rem' },
    formCard: { background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    row: { display: 'flex', gap: '20px', marginBottom: '20px' },
    inputGroup: { flex: 1 },
    label: { display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '800', color: '#131921' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #EAEAEA', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #EAEAEA', minHeight: '100px', marginBottom: '25px', boxSizing: 'border-box' },
    confirmBtn: { width: '100%', padding: '18px', borderRadius: '14px', background: '#131921', color: '#fff', fontWeight: '800', border: 'none', cursor: 'pointer' }
};

export default ServiceBooking;