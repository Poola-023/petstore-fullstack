import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ user, setUser, cart }) => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!user) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) { console.error("Session sync failed"); }
            }
        }

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [user, setUser]);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div style={styles.page}>
            {/* ✨ SHARED BOUTIQUE NAVBAR */}
            <nav style={styles.navbar}>
                <div style={styles.navBrand} onClick={() => navigate('/')}>
                    <div style={styles.logoContainer}>
                        <div style={styles.logoBadge}><span style={styles.pawIcon}>🐾</span></div>
                        <div style={styles.brandTextGroup}>
                            <h1 style={styles.logoText}>PAWS<span style={{color: '#FF9900'}}>&</span>PALETTE</h1>
                            <div style={styles.subHeaderRow}>
                                <span style={styles.logoSubText}>THE SOULFUL DISCOVERY CENTER</span>
                                <span style={styles.dotSeparator}>•</span>
                                <span style={styles.onlineBoutiqueText}>PREMIUM ONLINE BOUTIQUE</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.navActions}>
                    <div style={styles.navLinkItemActive}>
                        <span style={styles.navActionText}>About Us</span>
                    </div>

                    {!user && (
                        <div style={styles.partnerLink} onClick={() => navigate('/vendor-login')}>
                            <span style={styles.navActionText}>Partner Portal</span>
                        </div>
                    )}

                    <div style={styles.cartContainer} onClick={() => navigate('/cart')}>
                        <div style={styles.cartIconWrapper}>
                            <span style={styles.cartIcon}>🛒</span>
                            {cart?.length > 0 && <span style={styles.cartBadge}>{cart.length}</span>}
                        </div>
                        <span style={styles.cartText}>My Bag</span>
                    </div>

                    {user ? (
                        <div style={styles.accountMenu} ref={menuRef}>
                            <div style={styles.profileTrigger} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                                <div style={styles.avatar}>{user.username?.charAt(0).toUpperCase()}</div>
                                <div style={styles.triggerText}>
                                    <span style={styles.greeting}>Member Profile</span>
                                    <span style={styles.subGreeting}>{user.username} {isProfileOpen ? '▴' : '▾'}</span>
                                </div>
                            </div>
                            {isProfileOpen && (
                                <div style={styles.dropdown}>
                                    <div style={styles.menuItems}>
                                        <div style={styles.dropItem} onClick={() => navigate('/user-dashboard')}>👤 Account Overview</div>
                                        <div style={styles.dropItem} onClick={() => navigate('/order-history')}>🐾 Adoption History</div>
                                        <hr style={styles.hr} />
                                        <div style={{...styles.dropItem, color: '#FF4757'}} onClick={handleLogout}>🚪 Sign Out</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button style={styles.signInBtn} onClick={() => navigate('/login')}>Sign In</button>
                    )}
                </div>
            </nav>

            {/* ✨ HERO SECTION WITH GRADIENT BLEND */}
            <header style={styles.hero}>
                <div style={styles.heroOverlay}>
                    <span style={styles.heroBadge}>ESTABLISHED 2026</span>
                    <h1 style={styles.heroTitle}>Where Every Pet <br/> Has a Story.</h1>
                    <p style={styles.heroSub}>The most refined pet adoption journey in Hyderabad. <br/> Curated companions from health-certified boutique partners.</p>
                    <div style={styles.heroActions}>
                        <button style={styles.primaryBtn} onClick={() => navigate('/all-pets')}>Explore Collection</button>
                        <button style={styles.secondaryBtn} onClick={() => navigate('/dashboard')}>Meet Partners</button>
                    </div>
                </div>
            </header>

            {/* ✨ STATISTICS BAR WITH GLASS EFFECT */}
            <section style={styles.statsBar}>
                <div style={styles.statItem}><h3>500+</h3><p>Verified Adoptions</p></div>
                <div style={styles.statItem}><h3>12</h3><p>Elite Boutiques</p></div>
                <div style={styles.statItem}><h3>100%</h3><p>Health Certified</p></div>
                <div style={styles.statItem}><h3>24/7</h3><p>Direct Support</p></div>
            </section>

            {/* ✨ THE SOULFUL JOURNEY (Process) */}
            <section style={styles.journeySection}>
                <h2 style={styles.sectionTitle}>The Soulful Journey</h2>
                <div style={styles.journeyGrid}>
                    <div style={styles.journeyStep}>
                        <div style={styles.stepHeader}>
                            <div style={styles.stepNum}>01</div>
                            <h4>Discovery</h4>
                        </div>
                        <p>Browse our curated palette of companions from Hyderabad's top partners.</p>
                    </div>
                    <div style={styles.journeyStep}>
                        <div style={styles.stepHeader}>
                            <div style={styles.stepNum}>02</div>
                            <h4>Verification</h4>
                        </div>
                        <p>Receive digital health records and verified lineage for your chosen friend.</p>
                    </div>
                    <div style={styles.journeyStep}>
                        <div style={styles.stepHeader}>
                            <div style={styles.stepNum}>03</div>
                            <h4>Onboarding</h4>
                        </div>
                        <p>Secure payment and real-time tracking as your pet begins their journey home.</p>
                    </div>
                </div>
            </section>

            {/* ✨ DISCOVERY CATEGORIES WITH HOVER CARDS */}
            <section style={styles.gridSection}>
                <h2 style={styles.gridHeading}>Discovery Categories</h2>
                <div style={styles.catGrid}>
                    {[
                        { label: 'Noble Dogs', icon: '🐕', cat: 'Dog' },
                        { label: 'Soulful Cats', icon: '🐈', cat: 'Cat' },
                        { label: 'Exotic Avian', icon: '🦜', cat: 'Bird' },
                        { label: 'Aquatic Life', icon: '🐠', cat: 'Fish' }
                    ].map((item, i) => (
                        <div key={i} style={styles.catCard} onClick={() => navigate(`/all-pets?category=${item.cat}`)}>
                            <div style={styles.catImgBox}>{item.icon}</div>
                            <h4>{item.label}</h4>
                            <span style={styles.catLink}>Discover →</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ✨ TRUST & SAFETY FEATURES */}
            <section style={styles.trustSection}>
                <div style={styles.trustCard}>
                    <span style={styles.featureIcon}>🛡️</span>
                    <h3>Verified Boutiques</h3>
                    <p>Every partner is physically vetted in Hyderabad to ensure care standards.</p>
                </div>
                <div style={styles.trustCard}>
                    <span style={styles.featureIcon}>📋</span>
                    <h3>Health Verification</h3>
                    <p>All adoptions include official health reports and certifications.</p>
                </div>
            </section>

            {/* ✨ PARTNER CTA WITH BOUTIQUE THEME */}
            <section style={styles.ctaSection}>
                <div style={styles.ctaContent}>
                    <h2>Own a Boutique?</h2>
                    <p>Join Hyderabad's elite network of discovery partners.</p>
                    <button style={styles.ctaBtn} onClick={() => navigate('/vendor-login')}>Access Partner Portal</button>
                </div>
            </section>

            <footer style={styles.miniFooter}>
                © 2026 PAWS & PALETTE • REFINED CARE FOR REFINED PETS • HYDERABAD
            </footer>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 6%', backgroundColor: '#131921', color: '#FFFFFF', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 30px rgba(0,0,0,0.4)' },
    logoContainer: { display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer' },
    logoBadge: { backgroundColor: '#FF9900', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    pawIcon: { fontSize: '1.4rem', color: '#131921' },
    brandTextGroup: { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px' },
    logoText: { fontSize: '1.5rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '0.5px', margin: 0, lineHeight: '1' },
    subHeaderRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' },
    logoSubText: { fontSize: '0.58rem', fontWeight: '700', color: '#FF9900', letterSpacing: '1.2px', textTransform: 'uppercase' },
    dotSeparator: { color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' },
    onlineBoutiqueText: { fontSize: '0.58rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' },

    navActions: { display: 'flex', alignItems: 'center', gap: '30px' },
    navLinkItemActive: { cursor: 'pointer', borderBottom: '2px solid #FF9900', paddingBottom: '2px' },
    navActionText: { fontSize: '0.85rem', fontWeight: '700', color: '#FFFFFF' },
    partnerLink: { cursor: 'pointer', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(255, 255, 255, 0.05)', transition: '0.3s' },
    cartContainer: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
    cartIconWrapper: { position: 'relative' },
    cartBadge: { position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#FF9900', color: '#131921', borderRadius: '4px', padding: '2px 5px', fontSize: '0.7rem', fontWeight: '900' },
    cartText: { fontSize: '0.85rem', fontWeight: '800', marginLeft: '8px', color: '#FFFFFF' },
    accountMenu: { position: 'relative' },
    profileTrigger: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
    avatar: { width: '35px', height: '35px', borderRadius: '12px', backgroundColor: '#FF9900', color: '#131921', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' },
    triggerText: { display: 'flex', flexDirection: 'column' },
    greeting: { fontSize: '0.6rem', color: '#FF9900', fontWeight: '600' },
    subGreeting: { fontSize: '0.85rem', fontWeight: '800', color: '#FFFFFF' },
    dropdown: { position: 'absolute', top: '130%', right: 0, width: '220px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden' },
    menuItems: { padding: '10px' },
    dropItem: { padding: '12px 15px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', color: '#2D3436' },
    hr: { border: 'none', borderTop: '1px solid #F1F2F6', margin: '8px 0' },
    signInBtn: { backgroundColor: '#FF9900', color: '#131921', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' },

    // HERO SECTION
    hero: { height: '85vh', backgroundImage: 'url("https://wallpapers.com/images/featured/dog-wj7msvc5kj9v6cyy.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid #EAEAEA' },
    heroOverlay: { height: '100%', background: 'linear-gradient(to right, rgba(19, 25, 33, 0.95) 20%, rgba(19, 25, 33, 0.3) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10%', color: '#FFFFFF' },
    heroBadge: { color: '#FF9900', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '4px', marginBottom: '20px' },
    heroTitle: { fontSize: '5rem', fontWeight: '950', lineHeight: '1', letterSpacing: '-3px', marginBottom: '30px' },
    heroSub: { fontSize: '1.3rem', lineHeight: '1.7', marginBottom: '45px', color: 'rgba(255,255,255,0.75)', maxWidth: '650px' },
    heroActions: { display: 'flex', gap: '20px' },
    primaryBtn: { padding: '22px 50px', backgroundColor: '#FF9900', color: '#131921', border: 'none', borderRadius: '18px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 30px rgba(255, 153, 0, 0.3)' },
    secondaryBtn: { padding: '22px 50px', backgroundColor: 'transparent', color: '#FFFFFF', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '18px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', transition: '0.3s' },

    // STATS BAR
    statsBar: { padding: '60px 10%', display: 'flex', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottom: '1px solid #F1F2F6', marginTop: '-40px', width: '80%', margin: '0 auto', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative', zIndex: 5 },
    statItem: { textAlign: 'center' },

    // JOURNEY SECTION
    journeySection: { padding: '120px 10% 80px 10%', textAlign: 'center' },
    sectionTitle: { fontSize: '3rem', fontWeight: '950', marginBottom: '80px', letterSpacing: '-1.5px', color: '#131921' },
    journeyGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
    journeyStep: { textAlign: 'left', padding: '45px', borderRadius: '32px', backgroundColor: '#FFFFFF', border: '1px solid #F1F2F6', transition: '0.3s' },
    stepHeader: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' },
    stepNum: { fontSize: '1.8rem', fontWeight: '900', color: '#FF9900', backgroundColor: 'rgba(255, 153, 0, 0.1)', padding: '10px 15px', borderRadius: '12px' },

    // CATEGORY SECTION
    gridSection: { padding: '100px 10%', backgroundColor: '#F9FAFB' },
    gridHeading: { fontSize: '2.2rem', fontWeight: '950', marginBottom: '50px', color: '#131921', textAlign: 'center' },
    catGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px' },
    catCard: { padding: '50px 30px', borderRadius: '28px', backgroundColor: '#FFFFFF', border: '1px solid #F1F2F6', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
    catImgBox: { fontSize: '3.5rem', marginBottom: '25px' },
    catLink: { fontSize: '0.85rem', fontWeight: '800', color: '#FF9900', marginTop: '15px', display: 'block' },

    // TRUST SECTION
    trustSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '100px 10%', backgroundColor: '#FFFFFF' },
    trustCard: { padding: '50px', borderRadius: '35px', backgroundColor: '#131921', color: '#FFFFFF', textAlign: 'center' },
    featureIcon: { fontSize: '3rem', marginBottom: '25px', display: 'block' },

    // CTA SECTION
    ctaSection: { padding: '120px 10%', textAlign: 'center', background: 'linear-gradient(135deg, #131921 0%, #1e293b 100%)', color: '#FFFFFF' },
    ctaContent: { maxWidth: '800px', margin: '0 auto' },
    ctaBtn: { marginTop: '40px', padding: '20px 50px', backgroundColor: 'transparent', border: '2.5px solid #FF9900', color: '#FF9900', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', transition: '0.3s' },
    miniFooter: { padding: '50px', textAlign: 'center', backgroundColor: '#000', color: '#444', fontSize: '0.75rem', letterSpacing: '3px', fontWeight: '900', borderTop: '1px solid #111' }
};

export default Home;