import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Adjust path if needed
import SubFooter from './SubFooter'; // Adjust path if needed

const AdminDashboard = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} />

            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>Admin Control Panel</h1>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </header>

                <div style={styles.grid}>
                    <div style={styles.card}>
                        <h3>User Management</h3>
                        <p>View, edit, or remove users and vendors from the platform.</p>
                    </div>
                    <div style={styles.card}>
                        <h3>Platform Analytics</h3>
                        <p>View total platform revenue, adoption rates, and traffic.</p>
                    </div>
                    <div style={styles.card}>
                        <h3>Approve Vendors</h3>
                        <p>Review new boutique partner applications.</p>
                    </div>
                </div>
            </div>

            <SubFooter />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    container: { maxWidth: '1200px', margin: '40px auto', padding: '0 20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    title: { fontSize: '2rem', fontWeight: '900', color: '#131921', margin: 0 },
    logoutBtn: { padding: '10px 20px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #EAEAEA', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }
};

export default AdminDashboard;