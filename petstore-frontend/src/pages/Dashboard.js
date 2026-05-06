import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

import logo from '../img/AddLogo.png';
import DogImg from '../img/Dog1.png';
import CatImg from '../img/Cat1.png';
import BirdImg from '../img/Bird.png';
import RabbitImg from '../img/Rabbit.jpg';
import FishImg from '../img/Fish.png';
import TurtleImg from '../img/Turtle.png';
import HamsterImg from '../img/Hamster.png';
import GuineaPigImg from '../img/GuineaPig.png';
import Add_1 from '../img/Add_1.png';
import Add_2 from '../img/Add_2.png';
import Add_3 from '../img/Add_3.png';

const CategoryCarousel = ({ title, categories, viewAllPath, navigate }) => {
    const rowRef = useRef(null);

    const scrollRow = (direction) => {
        if (rowRef.current) {
            const scrollAmount = 400;
            rowRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (!categories || categories.length === 0) return null;

    return (
        <section style={styles.section}>
            <div style={styles.carouselHeader}>
                <h2 style={styles.sectionTitleLeft}>{title}</h2>
                <div style={styles.carouselControls}>
                    <button style={styles.viewAllBtn} onClick={() => navigate(viewAllPath)}>View All</button>
                    <button style={styles.arrowBtnSmall} className="hover-lift" onClick={() => scrollRow('left')}>‹</button>
                    <button style={styles.arrowBtnSmall} className="hover-lift" onClick={() => scrollRow('right')}>›</button>
                </div>
            </div>

            <div style={styles.carouselContainer} className="hide-scroll" ref={rowRef}>
                {categories.map((cat, idx) => (
                    <div
                        key={idx}
                        style={styles.categoryCard}
                        onClick={() => navigate(`/category/${cat.name}`)}
                    >
                        <div style={styles.categoryImgWrapper} className="category-hover">
                            <img src={cat.img} alt={cat.name} style={styles.categoryImg} />
                        </div>
                        <h4 style={styles.categoryName}>{cat.name}</h4>
                    </div>
                ))}
            </div>
        </section>
    );
};

const ProductCarousel = ({ title, products, viewAllPath, navigate }) => {
    const rowRef = useRef(null);

    const scrollRow = (direction) => {
        if (rowRef.current) {
            const scrollAmount = 300;
            rowRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <section style={styles.section}>
            <div style={styles.carouselHeader}>
                <h2 style={styles.sectionTitleLeft}>{title}</h2>
                <div style={styles.carouselControls}>
                    <button style={styles.viewAllBtn} onClick={() => navigate(viewAllPath)}>View All</button>
                    <button style={styles.arrowBtnSmall} className="hover-lift" onClick={() => scrollRow('left')}>‹</button>
                    <button style={styles.arrowBtnSmall} className="hover-lift" onClick={() => scrollRow('right')}>›</button>
                </div>
            </div>

            <div style={styles.carouselContainer} className="hide-scroll" ref={rowRef}>
                {products.map(pet => {
                    const basePrice = pet.price || 0;
                    const discount = pet.discountPercentage || 0;
                    const discountedPrice = discount > 0 ? basePrice - (basePrice * (discount / 100)) : basePrice;

                    return (
                        <div key={pet.id} style={styles.productCard} className="hover-lift" onClick={() => navigate(`/pet/${pet.id}`)}>
                            <div style={styles.productImgWrapper}>
                                <img src={pet.image ? `data:image/jpeg;base64,${pet.image}` : "https://via.placeholder.com/300"} alt={pet.breed} style={styles.productImg} />
                            </div>
                            <div style={styles.productInfo}>
                                <h4 style={styles.productName}>{pet.breed}</h4>

                                <div style={styles.ratingRow}>
                                    <span style={styles.stars}>⭐⭐⭐⭐⭐</span>
                                    <span style={styles.reviewCount}>(Verified)</span>
                                </div>

                                <div style={styles.pricingRow}>
                                    {discount > 0 && <span style={styles.oldPrice}>₹{basePrice.toLocaleString('en-IN')}</span>}
                                    <span style={styles.newPrice}>₹{discountedPrice.toLocaleString('en-IN')}</span>
                                    {discount > 0 && <span style={styles.discountBadge}>{discount}% OFF</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

const Dashboard = ({ user, setUser, cart }) => {
    const navigate = useNavigate();
    {/*const API_BASE = `http://${window.location.hostname}:8090/api`;*/}
    const API_BASE = 'https://pet-connect-backend-production.up.railway.app/api';
    const [dashboardData, setDashboardData] = useState({ justArrived: [], bestSelling: [], popular: [] });
    const [vendors, setVendors] = useState([]);
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; }
            .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 15px 35px rgba(0,0,0,0.08) !important; }
            .category-hover { transition: all 0.3s ease; }
            .category-hover:hover { transform: scale(1.05); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08) !important; }
            .hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
            .hide-scroll::-webkit-scrollbar { display: none; }
            .banner-zoom:hover .banner-bg { transform: scale(1.05); }
            .banner-bg { transition: transform 0.6s ease; width: 100%; height: 100%; position: absolute; top: 0; left: 0; background-size: cover; background-position: center; z-index: 1;}
            .fade-in { animation: fadeIn 0.5s ease-in-out; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `;
        document.head.appendChild(styleSheet);
    }, []);

    // ✨ FIXED: Added state parsing and finally block
    useEffect(() => {
        const fetchAllData = async () => {
            const token = localStorage.getItem('token');

            // Allow public fetching if no token is present, else add JWT
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            try {
                const homeRes = await fetch(`${API_BASE}/dashboard/home`, { headers });
                const vendorRes = await fetch(`${API_BASE}/vendors/all`, { headers });
                const promoRes = await fetch(`${API_BASE}/promos/all`, { headers });

                if (homeRes.ok && vendorRes.ok && promoRes.ok) {
                    const homeData = await homeRes.json();
                    const vendorData = await vendorRes.json();
                    const promoData = await promoRes.json();

                    // ✨ CRITICAL FIX: Actually set the state with the fetched JSON data
                    setDashboardData(homeData);
                    setVendors(vendorData);
                    setPromos(promoData);
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                // ✨ CRITICAL FIX: Tell the UI to stop spinning!
                setLoading(false);
            }
        };

        fetchAllData();
    }, [API_BASE]);

    const features = [
        { icon: '📦', title: 'Free delivery', desc: 'Guaranteed safe transport.' },
        { icon: '🛍️', title: '100% secure payment', desc: 'Verified boutique partners.' },
        { icon: '🛡️', title: 'Quality guarantee', desc: 'Health certified companions.' },
        { icon: '🏷️', title: 'Guaranteed savings', desc: 'Best adoption fees.' },
        { icon: '🎁', title: 'Daily offers', desc: 'Special boutique discounts.' }
    ];

    const categories = [
        { name: 'Dog', img: DogImg },
        { name: 'Cat', img: CatImg},
        { name: 'Bird', img: BirdImg },
        { name: 'Fish', img: FishImg },
        { name: 'Rabbit', img: RabbitImg },
        { name: 'Turtle', img: TurtleImg },
        { name: 'Hamster', img: HamsterImg },
        { name: 'Guinea Pig', img: GuineaPigImg }
    ];

    const getStoreName = (vendorId) => {
        const vendor = vendors.find(v => v.id === vendorId);
        return vendor ? vendor.storeName : 'Partner Boutique';
    };

    let displayBanners = [];
    if (promos && promos.length > 0) {
        displayBanners = promos.map(p => ({
            img: `url(data:image/jpeg;base64,${p.image})`,
            title: getStoreName(p.vendorId),
            sub: p.bio,
            badge: `${p.discount}% OFF - SHOP NOW`,
            action: () => navigate(`/all-pets?vendorId=${p.vendorId}&discount=${p.discount}`)
        }));
    } else {
        displayBanners = [
            { img: `url(${Add_1})`, title: 'Items on SALE', sub: 'Discounts up to 30%', badge: 'SHOP NOW', action: () => navigate('/all-pets') },
            { img: `url(${Add_3})`, title: 'Combo offers', sub: 'Discounts up to 50%', badge: 'SHOP NOW', action: () => navigate('/all-pets') },
            { img: `url(${Add_2})`, title: 'Discount Coupons', sub: 'Discounts up to 40%', badge: 'SHOP NOW', action: () => navigate('/all-pets') }
        ];
    }

    useEffect(() => {
        if (displayBanners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % displayBanners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [displayBanners.length]);

    const activeBanner = displayBanners[currentBannerIndex];

    return (
        <div style={styles.dashboard}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            <main style={styles.main}>

                {/* 1. HERO SECTION */}
                <div style={styles.heroAd} className="hover-lift">
                    <div style={styles.heroOverlay}>
                        <span style={styles.adBadge}>100% HEALTHY & VERIFIED</span>
                        <h1 style={styles.adTitle}>Find Your Perfect <br/>Soulful Companion</h1>
                        <button style={styles.adBtn} className="hover-lift" onClick={() => navigate('/all-pets')}>Shop Now</button>
                    </div>
                </div>

                {/* 2. CATEGORY CAROUSEL */}
                <CategoryCarousel title="Category" categories={categories} viewAllPath="/all-pets" navigate={navigate} />

                {/* 3. SINGLE AUTO-ROTATING PROMO BANNER */}
                <section style={styles.section}>
                    {activeBanner && (
                        <div
                            style={styles.singleBannerContainer}
                            className="banner-zoom hover-lift fade-in"
                            onClick={activeBanner.action}
                            key={currentBannerIndex}
                        >
                            <div style={{...styles.bannerBg, backgroundImage: activeBanner.img}} className="banner-bg"></div>

                            <div style={styles.bannerOverlayDark}>
                                <h5 style={styles.bannerHeadingWhite}>{activeBanner.title}</h5>
                                <h2 style={styles.bannerSubWhite}>{activeBanner.sub}</h2>
                                <span style={styles.bannerLinkWhite}>{activeBanner.badge}</span>
                            </div>

                            {displayBanners.length > 1 && (
                                <div style={styles.dotsContainer}>
                                    {displayBanners.map((_, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                ...styles.dot,
                                                backgroundColor: currentBannerIndex === idx ? '#FF9900' : 'rgba(255,255,255,0.4)',
                                                transform: currentBannerIndex === idx ? 'scale(1.2)' : 'scale(1)'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentBannerIndex(idx);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* 4. PRODUCT CAROUSEL */}
                {loading ? (
                    <div style={styles.loader}>Loading storefront...</div>
                ) : (
                    <ProductCarousel title="Best Selling Products" products={dashboardData.bestSelling} viewAllPath="/all-pets" navigate={navigate} />
                )}

                {/* 5. FEATURES ROW */}
                <div style={styles.featuresRow}>
                    {features.map((feat, idx) => (
                        <div key={idx} style={styles.featureCard} className="hover-lift">
                            <div style={styles.featureIconBox}>
                                <span style={styles.featureIcon}>{feat.icon}</span>
                            </div>
                            <h4 style={styles.featureTitle}>{feat.title}</h4>
                            <p style={styles.featureDesc}>{feat.desc}</p>
                        </div>
                    ))}
                </div>

            </main>
            <Footer user={user} setUser={setUser} cart={cart} />
        </div>
    );
};

const styles = {
    dashboard: { backgroundColor: '#FAFBFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    main: { padding: '40px 6%', maxWidth: '1400px', margin: '0 auto' },

    heroAd: { height: '500px', borderRadius: '24px', backgroundImage: `url(${logo})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '60px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' },
    heroOverlay: { height: '100%', background: 'linear-gradient(to right, rgba(19, 25, 33, 0.85), rgba(19, 25, 33, 0.1))', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', color: '#fff' },
    adBadge: { color: '#FF9900', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '15px' },
    adTitle: { fontSize: '3.8rem', fontWeight: '900', margin: '0 0 25px 0', lineHeight: '1.1' },
    adBtn: { width: 'fit-content', padding: '18px 45px', backgroundColor: '#FF9900', color: '#131921', border: 'none', borderRadius: '50px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer' },

    section: { marginBottom: '80px' },
    sectionTitleCenter: { fontSize: '2.2rem', fontWeight: '900', color: '#131921', textAlign: 'center', margin: '0 0 10px 0' },

    carouselHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #EAEAEA', paddingBottom: '15px', marginBottom: '30px' },
    sectionTitleLeft: { fontSize: '2rem', fontWeight: '900', color: '#111827', margin: 0 },
    carouselControls: { display: 'flex', alignItems: 'center', gap: '12px' },
    viewAllBtn: { backgroundColor: '#78C257', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '800', cursor: 'pointer' },
    arrowBtnSmall: { backgroundColor: '#fff', color: '#131921', border: '1px solid #EAEAEA', width: '40px', height: '40px', borderRadius: '8px', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },

    carouselContainer: { display: 'flex', gap: '30px', overflowX: 'auto', paddingBottom: '20px' },

    categoryCard: { flex: '0 0 calc(12.5% - 20px)', minWidth: '130px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
    categoryImgWrapper: { width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#fff', border: '4px solid #F3F4F6', boxShadow: '0 8px 20px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    categoryImg: { width: '100%', height: '100%', objectFit: 'cover' },
    categoryName: { fontSize: '1.1rem', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '0.3px' },

    productCard: { flex: '0 0 calc(20% - 20px)', minWidth: '240px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #EAEAEA', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    productImgWrapper: { height: '220px', width: '100%', overflow: 'hidden', borderBottom: '1px solid #F3F4F6' },
    productImg: { width: '100%', height: '100%', objectFit: 'cover' },
    productInfo: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', padding: '20px 15px', textAlign: 'center' },
    productName: { fontSize: '1.25rem', fontWeight: '900', color: '#111827', margin: 0, width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    ratingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
    stars: { color: '#FBBF24', fontSize: '1.1rem' },
    reviewCount: { color: '#9CA3AF', fontSize: '0.85rem', fontWeight: '500' },
    pricingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '5px' },
    oldPrice: { color: '#9CA3AF', fontSize: '1rem', textDecoration: 'line-through', fontWeight: '600' },
    newPrice: { color: '#111827', fontSize: '1.3rem', fontWeight: '900' },
    discountBadge: { border: '1px solid #E5E7EB', color: '#9CA3AF', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', backgroundColor: '#F9FAFB' },

    singleBannerContainer: {
        width: '100%',
        height: '420px',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
    },
    bannerBg: { },
    bannerOverlayDark: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2))',
        zIndex: 2
    },
    bannerHeadingWhite: { fontSize: '2.5rem', fontWeight: '900', color: '#fff', margin: '0 0 10px 0', textTransform: 'capitalize' },
    bannerSubWhite: { fontSize: '1.1rem', color: '#fff', margin: '0 0 35px 0', opacity: 0.9, lineHeight: '1.5', maxWidth: '60%' },
    bannerLinkWhite: { color: '#fff', borderBottom: '3px solid #FF9900', padding: '0 0 5px 0', fontSize: '1rem', fontWeight: '900', width: 'fit-content' },

    dotsContainer: {
        position: 'absolute',
        bottom: '25px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        zIndex: 3
    },
    dot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },

    featuresRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '20px' },
    featureCard: { border: '1px solid #EAEAEA', borderRadius: '16px', padding: '30px 20px', backgroundColor: '#fff', textAlign: 'center' },
    featureIconBox: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FFF5E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 20px', border: '1px dashed #FF9900' },
    featureTitle: { fontSize: '1.1rem', fontWeight: '900', color: '#131921', margin: '0 0 10px 0' },
    featureDesc: { fontSize: '0.85rem', color: '#636E72', margin: 0, lineHeight: '1.5', fontWeight: '500' },

    loader: { textAlign: 'center', padding: '100px', fontWeight: '900', color: '#FF9900', fontSize: '1.2rem' },
};

export default Dashboard;