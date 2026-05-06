import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import PageNavigation from './PageNavigation';

const MyPets = ({ user, setUser, cart }) => {
    const [myPets, setMyPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API = `http://${window.location.hostname}:8090/api/orders/my-adoptions`;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchMyPets = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = user.userId || user.id;
                const res = await fetch(`${API}/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log("MyPets Data:", data); // Check console to see the field names
                    setMyPets(data);
                }
            } catch (err) {
                console.error("Error fetching adopted pets", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPets();
    }, [user, navigate, API]);

    // ✨ FIXED: Universal Image Resolver
    const renderPetImage = (pet) => {
        // Checks all possible backend keys: petImage, image, pet_image, or nested pet.image
        const imgData = pet.petImage || pet.image || pet.pet_image || (pet.pet && pet.pet.image);

        if (!imgData) return null;

        // If it's a URL
        if (typeof imgData === 'string' && imgData.startsWith('http')) return imgData;

        // If it's already a base64 string with prefix
        if (typeof imgData === 'string' && imgData.startsWith('data:image')) return imgData;

        // If it's a raw base64 string from MySQL
        return `data:image/jpeg;base64,${imgData}`;
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <PageNavigation />
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>My Soulful <span style={{color: '#FF9900'}}>Companions</span></h1>
                    <p style={styles.subtitle}>MANAGE YOUR PET'S DIGITAL HEALTH VAULT & GROWTH JOURNAL</p>
                </header>

                {loading ? (
                    <div style={styles.loaderBox}>
                         <div style={styles.spinner}></div>
                         <p>Retrieving your companion records...</p>
                    </div>
                ) : myPets.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🐾</div>
                        <h3 style={styles.emptyTitle}>Your family is waiting</h3>
                        <p style={styles.emptyDesc}>You haven't adopted any companions yet.</p>
                        <button onClick={() => navigate('/all-pets')} style={styles.browseBtn}>Browse Boutique</button>
                    </div>
                ) : (
                    <div style={styles.vaultList}>
                        {myPets.map(pet => (
                            <div key={pet.orderId || pet.id} style={styles.vaultCard}>
                                <div style={styles.petIdentity}>
                                    <div style={styles.imageContainer}>
                                        {renderPetImage(pet) ? (
                                            <img src={renderPetImage(pet)} alt={pet.petNames} style={styles.petImg} />
                                        ) : (
                                            <div style={styles.imagePlaceholder}>🐾</div>
                                        )}
                                    </div>
                                    <div style={styles.identityText}>
                                        <h3 style={styles.petName}>{pet.petNames || 'Companion'}</h3>
                                        <span style={styles.dateBadge}>
                                            Adopted {new Date(pet.orderDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.actionConsole}>
                                    <div style={styles.actionRow}>
                                        <button style={styles.actionBtn} onClick={() => navigate(`/digital-passport/${pet.petId}`)}>
                                            <span style={styles.icon}>📜</span>
                                            <div style={styles.btnText}>
                                                <strong style={styles.strong}>Health Passport</strong>
                                                <p style={styles.p}>Medical Records</p>
                                            </div>
                                        </button>
                                        <button style={{...styles.actionBtn, backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5'}} onClick={() => navigate(`/book-service/${pet.petId}`)}>
                                            <span style={{...styles.icon, color: '#D97706'}}>📅</span>
                                            <div style={styles.btnText}>
                                                <strong style={{...styles.strong, color: '#D97706'}}>Book Service</strong>
                                                <p style={{...styles.p, color: '#D97706'}}>Grooming & Vets</p>
                                            </div>
                                        </button>
                                    </div>
                                    <div style={styles.actionRow}>
                                        <button style={{...styles.actionBtn, backgroundColor: '#F8FAFC'}} onClick={() => navigate(`/growth-journal/${pet.petId}`)}>
                                            <span style={styles.icon}>📸</span>
                                            <div style={styles.btnText}>
                                                <strong style={styles.strong}>Growth Journal</strong>
                                                <p style={styles.p}>Milestone Gallery</p>
                                            </div>
                                        </button>
                                        <button style={{...styles.actionBtn, backgroundColor: '#131921', color: '#fff'}} onClick={() => navigate(`/publish-story/${pet.petId}`)}>
                                            <span style={styles.icon}>🌟</span>
                                            <div style={styles.btnText}>
                                                <strong style={{...styles.strong, color: '#fff'}}>Share Story</strong>
                                                <p style={{...styles.p, color: '#94A3B8'}}>Join Community</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    container: { padding: '120px 8% 60px 8%', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '60px', textAlign: 'left' },
    title: { fontSize: '3rem', fontWeight: '900', color: '#131921', margin: 0, letterSpacing: '-1.5px' },
    subtitle: { color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1.5px', marginTop: '10px' },
    vaultList: { display: 'flex', flexDirection: 'column', gap: '30px' },
    vaultCard: { backgroundColor: '#fff', borderRadius: '35px', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' },
    petIdentity: { display: 'flex', alignItems: 'center', gap: '25px', flex: 1 },
    imageContainer: { width: '130px', height: '130px', borderRadius: '30px', overflow: 'hidden', backgroundColor: '#F1F5F9', border: '1px solid #EAEAEA' },
    petImg: { width: '100%', height: '100%', objectFit: 'cover' },
    imagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' },
    identityText: { display: 'flex', flexDirection: 'column', gap: '5px' },
    petName: { fontSize: '1.8rem', fontWeight: '900', color: '#131921', margin: 0 },
    dateBadge: { fontSize: '0.85rem', color: '#64748B', fontWeight: '600' },
    actionConsole: { flex: 1.2, display: 'flex', flexDirection: 'column', gap: '15px' },
    actionRow: { display: 'flex', gap: '15px' },
    actionBtn: { flex: 1, padding: '15px 20px', borderRadius: '20px', border: '1px solid #F1F5F9', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', textAlign: 'left', transition: '0.2s' },
    btnText: { display: 'flex', flexDirection: 'column' },
    icon: { fontSize: '1.4rem' },
    strong: { fontSize: '0.9rem', fontWeight: '800', color: '#131921', margin: 0 },
    p: { margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600' },
    loaderBox: { textAlign: 'center', padding: '100px 0' },
    spinner: { width: '40px', height: '40px', border: '4px solid #F3F4F6', borderTop: '4px solid #FF9900', borderRadius: '50%', margin: '0 auto 20px auto', animation: 'spin 1s linear infinite' },
    emptyState: { textAlign: 'center', padding: '100px 0' },
    browseBtn: { padding: '15px 35px', borderRadius: '15px', background: '#FF9900', border: 'none', fontWeight: '900', cursor: 'pointer' }
};

export default MyPets;