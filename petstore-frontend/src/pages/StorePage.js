import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageNavigation from './PageNavigation';

const StorePage = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();

    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStorePets = async () => {
            try {
                // REAL-TIME: Fetching pets for this specific vendor from your MySQL DB
                const res = await fetch(`http://localhost:8090/api/pets/vendor/${vendorId}`);
                if (res.ok) {
                    const data = await res.json();
                    setPets(data);
                    setFilteredPets(data);
                }
            } catch (err) {
                console.error("Connection error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStorePets();
    }, [vendorId]);

    useEffect(() => {
        let result = pets;
        if (activeCategory !== 'All') {
            result = result.filter(pet => pet.category?.toLowerCase() === activeCategory.toLowerCase());
        }
        if (searchTerm) {
            result = result.filter(pet =>
                pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredPets(result);
    }, [activeCategory, searchTerm, pets]);

    return (
        <div style={styles.page}>
            {/* 1. Cleaned Navbar (Cart Removed) */}
            <nav style={styles.navbar}>
                <div style={styles.navBrand} onClick={() => navigate('/')}>
                    <span style={styles.logoText}>USHA<span style={{color: '#FF9900'}}>PETS</span></span>
                </div>

                <div style={styles.searchContainer}>
                    <div style={styles.searchBox}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search GSD, Persian, Birds..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right side spacer for visual balance */}
                <div style={styles.navRight}></div>
            </nav>
            <PageNavigation />
            <main style={styles.main}>
                <div style={styles.filterSection}>
                    <h2 style={styles.storeTitle}>Partner Inventory</h2>
                    <div style={styles.filterBar}>
                        {['All', 'Dog', 'Cat', 'Bird', 'Fish'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={activeCategory === cat ? styles.activeFilter : styles.filterBtn}
                            >
                                {cat === 'All' ? '🏠 All' : cat === 'Dog' ? '🐕 Dogs' : cat === 'Cat' ? '🐈 Cats' : cat === 'Bird' ? '🦜 Birds' : '🐠 Fish'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loader}>Syncing live inventory...</div>
                ) : filteredPets.length > 0 ? (
                    <div style={styles.grid}>
                        {filteredPets.map(pet => (
                            <div key={pet.id} style={styles.card} onClick={() => navigate(`/pet-details/${pet.id}`)}>
                                <div style={styles.imgWrapper}>
                                    <img
                                        src={pet.image ? `data:image/jpeg;base64,${pet.image}` : "https://via.placeholder.com/300"}
                                        style={styles.petImg}
                                        alt={pet.name}
                                    />
                                    <div style={styles.categoryBadge}>{pet.category}</div>
                                </div>
                                <div style={styles.cardBody}>
                                    <h3 style={styles.petName}>{pet.name}</h3>
                                    <p style={styles.breedText}>{pet.breed} • {pet.age} Months</p>
                                    <div style={styles.priceRow}>
                                        <span style={styles.price}>₹{pet.price.toLocaleString('en-IN')}</span>
                                        {pet.isVaccinated === 'yes' && <span style={styles.vaxBadge}>✓ Vaccinated</span>}
                                    </div>
                                    {/* Action Row Updated to a single button */}
                                    <div style={styles.actionRow}>
                                        <button style={styles.viewBtn}>View Profile</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🐾</div>
                        <h3>No companions found</h3>
                        <button onClick={() => {setActiveCategory('All'); setSearchTerm('');}} style={styles.resetBtn}>Reset Search</button>
                    </div>
                )}
            </main>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    navbar: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 6%', height: '80px', backgroundColor: '#131921', color: 'white',
        position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    },
    navBrand: { cursor: 'pointer', flex: 1 },
    logoText: { fontSize: '1.6rem', fontWeight: '900' },
    searchContainer: { flex: 2, display: 'flex', justifyContent: 'center' },
    searchBox: {
        width: '100%', maxWidth: '500px', backgroundColor: '#fff',
        borderRadius: '10px', display: 'flex', alignItems: 'center', padding: '0 15px'
    },
    searchIcon: { color: '#94A3B8', marginRight: '10px' },
    searchInput: { width: '100%', padding: '12px 0', border: 'none', outline: 'none', color: '#333' },
    navRight: { flex: 1 }, // Keeps search centered
    main: { padding: '40px 6%', maxWidth: '1400px', margin: '0 auto' },
    filterSection: { marginBottom: '40px' },
    storeTitle: { fontSize: '2.2rem', fontWeight: '900', color: '#1E293B', textAlign: 'center', marginBottom: '25px' },
    filterBar: { display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' },
    filterBtn: { padding: '12px 24px', borderRadius: '14px', border: '1px solid #E2E8F0', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748B' },
    activeFilter: { padding: '12px 24px', borderRadius: '14px', border: 'none', backgroundColor: '#FF9900', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' },
    card: { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', cursor: 'pointer' },
    imgWrapper: { height: '220px', position: 'relative' },
    petImg: { width: '100%', height: '100%', objectFit: 'cover' },
    categoryBadge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: 'rgba(255,255,255,0.95)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' },
    cardBody: { padding: '20px' },
    petName: { fontSize: '1.3rem', fontWeight: '800', margin: '0 0 5px 0' },
    breedText: { color: '#64748B', fontSize: '0.9rem', marginBottom: '15px' },
    priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    price: { fontSize: '1.5rem', fontWeight: '900' },
    vaxBadge: { fontSize: '0.7rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' },
    actionRow: { display: 'flex', gap: '10px' },
    viewBtn: { flex: 1, padding: '14px', backgroundColor: '#FF9900', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' },
    loader: { textAlign: 'center', padding: '100px', fontSize: '1.2rem' },
    emptyState: { textAlign: 'center', padding: '80px 0' },
    resetBtn: { marginTop: '20px', padding: '12px 25px', backgroundColor: '#1E293B', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }
};

export default StorePage;