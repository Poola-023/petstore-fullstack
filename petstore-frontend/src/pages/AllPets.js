import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import SubFooter from './SubFooter';

const AllPets = ({ user, setUser, cart }) => {
    const navigate = useNavigate();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✨ Advanced Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: 'All',
        age: 'All',
        vaccinated: 'All',
        maxPrice: 50000
    });

    const API_BASE = `http://${window.location.hostname}:8090/api`;

    useEffect(() => {
        fetch(`${API_BASE}/pets/all`)
            .then(res => res.json())
            .then(data => {
                setPets(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch pets", err);
                setLoading(false);
            });
    }, [API_BASE]);

    // Helper: Calculate age category from DOB
    const getAgeCategory = (dob) => {
        if (!dob) return 'Unknown';
        const months = (new Date() - new Date(dob)) / (1000 * 60 * 60 * 24 * 30);
        if (months <= 6) return 'Baby';
        if (months <= 24) return 'Young';
        return 'Adult';
    };

    // ✨ Apply Filters
    const filteredPets = pets.filter(pet => {
        const matchesSearch = pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              pet.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filters.category === 'All' || pet.category === filters.category;
        const matchesVaccination = filters.vaccinated === 'All' || pet.isVaccinated === filters.vaccinated;
        const matchesPrice = pet.price <= filters.maxPrice;

        let matchesAge = true;
        if (filters.age !== 'All') {
            matchesAge = getAgeCategory(pet.dob) === filters.age;
        }

        return matchesSearch && matchesCategory && matchesVaccination && matchesPrice && matchesAge;
    });

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            {/* Header Banner */}
            <div style={styles.headerBanner}>
                <h1 style={styles.headerTitle}>Find Your Perfect Companion</h1>
                <p style={styles.headerSub}>Use our advanced filters to find the exact breed, age, and personality you are looking for.</p>

                <div style={styles.searchBar}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search for breeds like 'Golden Retriever' or 'Persian'..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={styles.mainLayout}>
                {/* ✨ FILTER SIDEBAR */}
                <aside style={styles.filterSidebar}>
                    <h3 style={styles.filterTitle}>Advanced Filters</h3>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Species / Category</label>
                        <select style={styles.select} value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                            <option value="All">All Species</option>
                            <option value="Dog">Dogs</option>
                            <option value="Cat">Cats</option>
                            <option value="Bird">Birds</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Age Group</label>
                        <select style={styles.select} value={filters.age} onChange={(e) => setFilters({...filters, age: e.target.value})}>
                            <option value="All">Any Age</option>
                            <option value="Baby">Baby (0-6 months)</option>
                            <option value="Young">Young (6-24 months)</option>
                            <option value="Adult">Adult (2+ years)</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Health & Safety</label>
                        <select style={styles.select} value={filters.vaccinated} onChange={(e) => setFilters({...filters, vaccinated: e.target.value})}>
                            <option value="All">Any Status</option>
                            <option value="yes">Vaccinated Only</option>
                            <option value="no">Not Vaccinated</option>
                        </select>
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Max Price: ₹{filters.maxPrice.toLocaleString('en-IN')}</label>
                        <input
                            type="range"
                            min="5" max="1000" step="5"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                            style={styles.rangeInput}
                        />
                    </div>

                    <button style={styles.resetBtn} onClick={() => {
                        setSearchTerm('');
                        setFilters({ category: 'All', age: 'All', vaccinated: 'All', maxPrice: 50000 });
                    }}>Reset Filters</button>
                </aside>

                {/* PET GRID */}
                <main style={styles.petGridContainer}>
                    {loading ? (
                        <h3 style={{textAlign: 'center', marginTop: '50px'}}>Summoning companions...</h3>
                    ) : filteredPets.length === 0 ? (
                        <div style={styles.emptyState}>
                            <h2>No companions match your exact filters.</h2>
                            <p>Try broadening your search criteria.</p>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {filteredPets.map(pet => (
                                <div key={pet.id} style={styles.petCard} onClick={() => navigate(`/pet/${pet.id}`)}>
                                    <div style={styles.imageWrapper}>
                                        <img src={`data:image/jpeg;base64,${pet.image}`} alt={pet.breed} style={styles.petImg} />
                                        {pet.isVaccinated === 'yes' && <span style={styles.vaccineBadge}>🛡️ Vaccinated</span>}
                                    </div>
                                    <div style={styles.petDetails}>
                                        <div style={styles.petMeta}>
                                            <span style={styles.metaTag}>{pet.category}</span>
                                            <span style={styles.metaTag}>{getAgeCategory(pet.dob)}</span>
                                        </div>
                                        <h3 style={styles.petBreed}>{pet.breed}</h3>
                                        <p style={styles.petPrice}>₹{pet.price.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
            <SubFooter />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    headerBanner: { backgroundColor: '#131921', padding: '60px 5%', textAlign: 'center', color: '#fff' },
    headerTitle: { fontSize: '2.5rem', fontWeight: '900', margin: '0 0 10px 0' },
    headerSub: { color: '#9CA3AF', fontSize: '1.1rem', marginBottom: '30px' },
    searchBar: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', maxWidth: '600px', margin: '0 auto', borderRadius: '20px', padding: '5px 15px' },
    searchIcon: { fontSize: '1.2rem', marginRight: '10px' },
    searchInput: { flex: 1, padding: '15px 10px', border: 'none', outline: 'none', fontSize: '1rem', borderRadius: '20px', fontWeight: '600' },

    mainLayout: { display: 'flex', gap: '30px', maxWidth: '1400px', margin: '40px auto', padding: '0 5%', alignItems: 'flex-start' },

    // Sidebar
    filterSidebar: { width: '280px', backgroundColor: '#fff', padding: '25px', borderRadius: '24px', border: '1px solid #EAEAEA', position: 'sticky', top: '20px' },
    filterTitle: { fontSize: '1.2rem', fontWeight: '900', color: '#131921', margin: '0 0 20px 0', borderBottom: '2px solid #F3F4F6', paddingBottom: '10px' },
    filterGroup: { marginBottom: '20px' },
    filterLabel: { display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' },
    select: { width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #EAEAEA', fontSize: '0.95rem', outline: 'none', fontWeight: '600' },
    rangeInput: { width: '100%', accentColor: '#FF9900' },
    resetBtn: { width: '100%', padding: '12px', backgroundColor: '#FFF7ED', color: '#FF9900', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', marginTop: '10px' },

    // Grid
    petGridContainer: { flex: 1 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
    petCard: { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #EAEAEA', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', ':hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' } },
    imageWrapper: { position: 'relative', height: '220px' },
    petImg: { width: '100%', height: '100%', objectFit: 'cover' },
    vaccineBadge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: '#ECFDF5', color: '#059669', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' },
    petDetails: { padding: '20px' },
    petMeta: { display: 'flex', gap: '8px', marginBottom: '10px' },
    metaTag: { backgroundColor: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' },
    petBreed: { margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: '900', color: '#131921' },
    petPrice: { margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#FF9900' },
    emptyState: { textAlign: 'center', padding: '50px', color: '#6B7280' }
};

export default AllPets;