import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [pets, setPets] = useState([]);
    const [orders, setOrders] = useState([]);

    const [dynamicSalesData, setDynamicSalesData] = useState([{ name: 'Loading', sales: 0 }]);
    const [dynamicPetData, setDynamicPetData] = useState([{ breed: 'Loading...', views: 1, inquiries: 1 }]);

    const API_BASE = `http://${window.location.hostname}:8090/api`;

    // ✨ HELPER: Get Security Headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        const savedVendor = JSON.parse(localStorage.getItem('vendor') || localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!savedVendor || !token) {
            navigate('/vendor-login');
            return;
        }

        setVendor(savedVendor);

        // Fetch Pets for Analytics
        fetch(`${API_BASE}/pets/vendor/${savedVendor.id || savedVendor.vendorId}`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(setPets)
            .catch(err => console.error("Error fetching pets for stats:", err));

        // Fetch Orders for Revenue Logic
        fetch(`${API_BASE}/orders/vendor/${savedVendor.id || savedVendor.vendorId}`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) setOrders(data);
            })
            .catch(err => console.error("Error fetching orders for stats:", err));

    }, [navigate, API_BASE]);

    const totalEarnings = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // ✨ GENERATE CHART DATA
    useEffect(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const last6Months = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            last6Months.push({
                name: months[d.getMonth()],
                monthIndex: d.getMonth(),
                year: d.getFullYear(),
                sales: 0
            });
        }

        orders.forEach(order => {
            const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
            const match = last6Months.find(m => m.monthIndex === orderDate.getMonth() && m.year === orderDate.getFullYear());
            if (match) {
                match.sales += (order.totalAmount || 0);
            }
        });
        setDynamicSalesData(last6Months);

        if (pets && pets.length > 0) {
            const formattedPets = pets.slice(0, 4).map(pet => ({
                breed: pet.breed.length > 12 ? pet.breed.substring(0, 12) + '...' : pet.breed,
                views: Math.floor((pet.price || 1000) / 100) + 150,
                inquiries: parseInt(pet.quantity) || 0
            }));
            setDynamicPetData(formattedPets);
        }

    }, [orders, pets]);

    return (
        <div style={styles.container}>
            <VendorSidebar activeTab="overview" vendor={vendor} />
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.welcomeText}>Analytics Overview</h1>
                        <p style={styles.dateText}>{vendor?.storeName?.toUpperCase() || 'BOUTIQUE PERFORMANCE'}</p>
                    </div>
                </header>

                <div style={styles.contentFade}>
                    {/* Top Stats */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCardBlue}>
                            <p style={styles.statLabel}>Total Revenue</p>
                            <h2 style={styles.statValue}>₹{totalEarnings.toLocaleString('en-IN')}</h2>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Total Adoptions</p>
                            <h2 style={styles.statValue}>{orders.length}</h2>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Active Listings</p>
                            <h2 style={styles.statValue}>{pets.length}</h2>
                        </div>
                    </div>

                    <div style={styles.chartsGrid}>
                        {/* LINE CHART */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>Revenue Trends (Last 6 Months)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dynamicSalesData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                    <Line type="monotone" dataKey="sales" stroke="#FF9900" strokeWidth={4} dot={{r: 4, fill: '#131921', strokeWidth: 2}} activeDot={{r: 8}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* BAR CHART */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>Inventory Popularity</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dynamicPetData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                                    <XAxis dataKey="breed" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="views" fill="#131921" radius={[6, 6, 0, 0]} barSize={20} name="Engagement Score" />
                                    <Bar dataKey="inquiries" fill="#FF9900" radius={[6, 6, 0, 0]} barSize={20} name="Quantity" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', backgroundColor: '#F9FAFB', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    main: { flex: 1, padding: '40px 50px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    welcomeText: { fontSize: '2rem', fontWeight: '900', color: '#131921', margin: 0 },
    dateText: { color: '#FF9900', fontSize: '0.8rem', fontWeight: '800', marginTop: '5px', letterSpacing: '0.5px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '30px' },
    statCardBlue: { background: 'linear-gradient(135deg, #131921 0%, #2A3B4C 100%)', padding: '30px', borderRadius: '24px', color: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' },
    statCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #EAEAEA', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    statLabel: { fontSize: '0.8rem', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 5px 0' },
    statValue: { fontSize: '2.2rem', fontWeight: '900', margin: 0 },
    chartsGrid: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '30px' },
    chartCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #EAEAEA', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' },
    chartTitle: { fontSize: '1.1rem', fontWeight: '900', color: '#131921', marginBottom: '25px' },
    contentFade: { animation: 'fadeIn 0.4s ease' }
};

export default VendorDashboard;