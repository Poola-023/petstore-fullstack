import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';


const CategorySearch = ({ user, setUser, cart }) => {
    // Grabs the category name from the URL (e.g., "Dog", "Cat")
    const { categoryName } = useParams();
    const navigate = useNavigate();

    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add smooth hover styles
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; }
            .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 15px 35px rgba(0,0,0,0.08) !important; }
        `;
        document.head.appendChild(styleSheet);
    }, []);

    useEffect(() => {
        const fetchCategoryPets = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://${window.location.hostname}:8090/api/pets/category/${categoryName}`);
                if (res.ok) {
                    const data = await res.json();
                    setPets(data);
                } else {
                    console.error("Failed to fetch category data");
                }
            } catch (err) {
                console.error("Connection error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryPets();
    }, [categoryName]); // Re-fetch if the user clicks a different category from the Navbar

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            <div style={styles.contentWrapper}>
                <header style={styles.header}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
                    <div>
                        <h1 style={styles.pageTitle}>Explore {categoryName}s</h1>
                        <p style={styles.subTitle}>Find your perfect soulful companion.</p>
                    </div>
                </header>

                {loading ? (
                    <div style={styles.loader}>Loading {categoryName}s...</div>
                ) : pets.length === 0 ? (
                    <div style={styles.emptyState}>
                        <h2>No {categoryName}s available right now.</h2>
                        <p>Check back later or explore our other soulful companions!</p>
                        <button style={styles.browseBtn} onClick={() => navigate('/all-pets')}>Browse All Pets</button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {pets.map(pet => {
                            const oldPrice = pet.price + (pet.price * 0.10);

                            return (
                                <div
                                    key={pet.id}
                                    style={styles.productCard}
                                    className="hover-lift"
                                    onClick={() => navigate(`/pet/${pet.id}`)}
                                >
                                    <div style={styles.productImgWrapper}>
                                        <img
                                            src={pet.image ? `data:image/jpeg;base64,${pet.image}` : "https://via.placeholder.com/300"}
                                            alt={pet.breed}
                                            style={styles.productImg}
                                        />
                                        {parseInt(pet.quantity) <= 0 && (
                                            <div style={styles.outOfStockBadge}>Sold Out</div>
                                        )}
                                    </div>
                                    <div style={styles.productInfo}>
                                        <h4 style={styles.productName}>{pet.breed}</h4>

                                        <div style={styles.ratingRow}>
                                            <span style={styles.stars}>⭐⭐⭐⭐⭐</span>
                                            <span style={styles.reviewCount}>(Verified)</span>
                                        </div>

                                        <div style={styles.pricingRow}>
                                            <span style={styles.oldPrice}>₹{oldPrice.toLocaleString('en-IN')}</span>
                                            <span style={styles.newPrice}>₹{pet.price.toLocaleString('en-IN')}</span>
                                            <span style={styles.discountBadge}>10% OFF</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer user={user} setUser={setUser} cart={cart} />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#FAFBFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' },
    contentWrapper: { padding: '40px 6%', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' },

    header: { display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '40px' },
    backBtn: { background: '#fff', border: '1px solid #EAEAEA', color: '#111827', cursor: 'pointer', fontSize: '1rem', padding: '10px 18px', borderRadius: '10px', fontWeight: '700', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    pageTitle: { fontSize: '2.5rem', fontWeight: '900', color: '#111827', margin: '0 0 5px 0', textTransform: 'capitalize' },
    subTitle: { fontSize: '1.1rem', color: '#6B7280', margin: 0 },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '30px', paddingBottom: '60px' },

    // Card Styles (matching your Dashboard exactly)
    productCard: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #EAEAEA', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' },
    productImgWrapper: { height: '240px', width: '100%', overflow: 'hidden', borderBottom: '1px solid #F3F4F6', position: 'relative' },
    productImg: { width: '100%', height: '100%', objectFit: 'cover' },
    outOfStockBadge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: 'rgba(239, 68, 68, 0.95)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', backdropFilter: 'blur(4px)' },
    productInfo: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', padding: '20px 15px', textAlign: 'center' },
    productName: { fontSize: '1.25rem', fontWeight: '900', color: '#111827', margin: 0, width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    ratingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
    stars: { color: '#FBBF24', fontSize: '1.1rem' },
    reviewCount: { color: '#9CA3AF', fontSize: '0.85rem', fontWeight: '500' },
    pricingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '5px' },
    oldPrice: { color: '#9CA3AF', fontSize: '1rem', textDecoration: 'line-through', fontWeight: '600' },
    newPrice: { color: '#111827', fontSize: '1.3rem', fontWeight: '900' },
    discountBadge: { border: '1px solid #E5E7EB', color: '#9CA3AF', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', backgroundColor: '#F9FAFB' },

    loader: { textAlign: 'center', padding: '100px', fontWeight: '900', color: '#064E3B', fontSize: '1.2rem' },

    emptyState: { textAlign: 'center', padding: '80px 20px', backgroundColor: '#fff', borderRadius: '20px', border: '1px dashed #EAEAEA' },
    browseBtn: { marginTop: '20px', padding: '15px 30px', backgroundColor: '#064E3B', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }
};

export default CategorySearch;