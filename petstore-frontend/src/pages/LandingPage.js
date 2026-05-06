import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={styles.page}>
            {/* 🛸 INTEGRATED NAVIGATION */}
            <nav style={{
                ...styles.nav,
                backgroundColor: scrolled ? 'rgba(19, 25, 33, 0.98)' : 'transparent',
                borderBottom: scrolled ? '1px solid #334155' : '1px solid rgba(255,255,255,0.1)',
                padding: scrolled ? '15px 8%' : '25px 8%'
            }}>
                <div style={styles.logo} onClick={() => navigate('/')}>
                    <div style={styles.logoIcon}>🐾</div>
                    <span style={styles.logoText}>Pet<span style={{color: '#FF9900'}}>&</span>Connect</span>
                </div>
                <div style={styles.navLinks}>
                    <span onClick={() => navigate('/all-pets')} style={styles.link}>The Boutique</span>
                    <span onClick={() => navigate('/success-stories')} style={styles.link}>Community</span>
                    <span style={styles.link}>Wellness</span>
                </div>
                <div style={styles.navAuth}>
                    {user ? (
                        <button style={styles.portalBtn} onClick={() => navigate(user.role === 'VENDOR' ? '/vendor-dashboard' : '/user-dashboard')}>
                            Access Portal
                        </button>
                    ) : (
                        <>
                            <span style={styles.loginText} onClick={() => navigate('/login')}>Login</span>
                            <button style={styles.joinBtn} onClick={() => navigate('/signup')}>Join the Family</button>
                        </>
                    )}
                </div>
            </nav>

            {/* 🚀 CONCEPT 1: THE IMMERSIVE HERO */}
            <header style={styles.hero}>
                <div style={styles.heroContent}>
                    <div style={styles.pillBadge}>✨ Redefining Pet Parenthood</div>
                    <h1 style={styles.heroTitle}>Premium Care for <br/> <span style={{color: '#FF9900'}}>Soulful Companions.</span></h1>
                    <p style={styles.heroSub}>
                        The ultimate ecosystem where technology meets compassion. Discover, manage, and
                        celebrate your pet's life in one high-performance dashboard.
                    </p>
                    <div style={styles.ctaRow}>
                        <button style={styles.mainCta} onClick={() => navigate('/all-pets')}>Explore Boutique</button>
                        <button style={styles.secondaryCta} onClick={() => navigate('/vendor-login')}>List your Boutique</button>
                    </div>
                </div>
            </header>

            {/* 📦 CONCEPT 2: THE BENTO FEATURE GRID */}
            <section style={styles.section}>
                <div style={styles.sectionHead}>
                    <h2 style={styles.title}>Engineered for Excellence</h2>
                    <p style={styles.sub}>A feature-rich platform designed for modern life.</p>
                </div>
                <div style={styles.bentoGrid}>
                    <div style={{...styles.bentoItem, gridColumn: 'span 2', background: '#131921', color: '#fff'}}>
                        <span style={styles.bentoEmoji}>📜</span>
                        <h3>Digital Health Passport</h3>
                        <p>Store medical history, vaccinations, and documents in an encrypted vault accessible anywhere.</p>
                    </div>
                    <div style={styles.bentoItem}>
                        <span style={styles.bentoEmoji}>🩺</span>
                        <h3>Pro Booking</h3>
                        <p>Instant scheduling with verified groomers and vets.</p>
                    </div>
                    <div style={styles.bentoItem}>
                        <span style={styles.bentoEmoji}>📸</span>
                        <h3>Growth Journal</h3>
                        <p>A private visual timeline for every milestone.</p>
                    </div>
                    <div style={{...styles.bentoItem, gridColumn: 'span 2', background: '#FF9900', color: '#131921'}}>
                        <span style={styles.bentoEmoji}>🏢</span>
                        <h3>Vendor ERP System</h3>
                        <p>Boutiques get professional-grade inventory management and revenue analytics out of the box.</p>
                    </div>
                </div>
            </section>

            {/* 🛡️ CONCEPT 3: TRUST & VERIFICATION */}
            <section style={styles.trustSection}>
                <div style={styles.trustGrid}>
                    <div style={styles.trustInfo}>
                        <h2 style={{...styles.title, color: '#fff'}}>Verified Safety. <br/> Always.</h2>
                        <p style={{color: '#94A3B8', fontSize: '1.1rem', marginBottom: '30px'}}>
                            Every pet listing and service provider on Pet & Connect undergoes a rigorous
                            verification process to ensure the highest standards of care.
                        </p>
                        <div style={styles.trustCheck}><span style={styles.check}>✔</span> 100% Verified Boutique Partners</div>
                        <div style={styles.trustCheck}><span style={styles.check}>✔</span> Secure Digital Documentation</div>
                        <div style={styles.trustCheck}><span style={styles.check}>✔</span> Real-Time Service Status Updates</div>
                    </div>
                    <div style={styles.trustVisual}>
                        <div style={styles.shieldBadge}>🛡️ Secure Cloud Sync</div>
                    </div>
                </div>
            </section>

            {/* 🛣️ CONCEPT 4: THE ADOPTION PIPELINE */}
            <section style={styles.section}>
                <div style={styles.sectionHead}>
                    <h2 style={styles.title}>The Lifecycle Journey</h2>
                    <p style={styles.sub}>From the first click to a lifetime of care.</p>
                </div>
                <div style={styles.pipeline}>
                    {[
                        {step: "01", name: "Discover", desc: "Find companions from ethical boutiques."},
                        {step: "02", name: "Onboard", desc: "Setup your pet's Digital Passport instantly."},
                        {step: "03", name: "Nurture", desc: "Book recurring care with professional partners."},
                        {step: "04", name: "Celebrate", desc: "Share success stories with the community."}
                    ].map((item, i) => (
                        <div key={i} style={styles.pipeItem}>
                            <span style={styles.pipeNum}>{item.step}</span>
                            <h4 style={styles.pipeName}>{item.name}</h4>
                            <p style={styles.pipeDesc}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
            {/* 🧘 CONCEPT 5: THE WELLNESS CIRCLE */}
            <section style={styles.wellnessSection}>
                <div style={styles.wellnessContent}>
                    <div style={styles.pillBadge}>COMMUNITY WELLNESS</div>
                    <h2 style={{...styles.title, color: '#fff'}}>Beyond the Bowl. <br/> <span style={{color: '#FF9900'}}>Holistic Thriving.</span></h2>
                    <p style={{color: '#94A3B8', fontSize: '1.1rem', margin: '20px 0 40px 0'}}>
                        Connect with local pet parents, access vet-verified nutrition guides,
                        and join neighborhood wellness meetups.
                    </p>

                    <div style={styles.wellnessGrid}>
                        <div style={styles.wellCard}>
                            <span style={styles.wellIcon}>🥗</span>
                            <h4>Nutrition Vault</h4>
                            <p>Tailored meal plans for every breed and life stage.</p>
                        </div>
                        <div style={styles.wellCard}>
                            <span style={styles.wellIcon}>🧘</span>
                            <h4>Doga & Meetups</h4>
                            <p>Find local pet yoga sessions and social walking groups.</p>
                        </div>
                        <div style={styles.wellCard}>
                            <span style={styles.wellIcon}>🧠</span>
                            <h4>Mindset Coaching</h4>
                            <p>Expert tips on pet anxiety and behavioral health.</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* 📈 WELLNESS AS A SERVICE (WaaS) */}
            <section style={styles.waasSection}>
                <div style={styles.waasGrid}>
                    <div style={styles.waasVisual}>
                        {/* Visual representation of an event calendar */}
                        <div style={styles.eventCard}>
                            <div style={{fontWeight: '900', color: '#FF9900'}}>Upcoming Event</div>
                            <div style={{fontSize: '1.2rem', margin: '10px 0'}}>Sunday Puppy Social</div>
                            <div style={{fontSize: '0.8rem', opacity: 0.7}}>12 Bookings • 3 Slots Left</div>
                        </div>
                    </div>
                    <div style={styles.waasInfo}>
                        <h2 style={styles.title}>Drive Foot Traffic with <br/> <span style={{color: '#FF9900'}}>Wellness Events.</span></h2>
                        <p style={{color: '#64748B', margin: '25px 0'}}>
                            Our platform isn't just for adoptions. Use our **Wellness Suite** to host workshops,
                            grooming clinics, and vaccination drives.
                        </p>
                        <ul style={styles.waasList}>
                            <li>✅ <strong>Event Ticketing:</strong> Manage RSVPs and payments.</li>
                            <li>✅ <strong>Subscription Plans:</strong> Offer monthly wellness memberships.</li>
                            <li>✅ <strong>Client Engagement:</strong> Send automated wellness reminders.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 🏁 FINAL CTA */}
            <section style={styles.footerCta}>
                <h2 style={{fontSize: '3rem', fontWeight: '900', margin: 0}}>Ready to Connect?</h2>
                <p style={{fontSize: '1.2rem', margin: '20px 0 40px 0', opacity: 0.8}}>Join thousands of soulful pet parents today.</p>
                <button style={styles.finalBtn} onClick={() => navigate('/signup')}>Create My Free Account</button>
            </section>
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },

    // Navbar
    nav: { position: 'fixed', top: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 3000, transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxSizing: 'border-box' },
    logo: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
    logoIcon: { backgroundColor: '#FF9900', padding: '6px', borderRadius: '10px', fontSize: '1.2rem' },
    logoText: { color: '#fff', fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1px' },
    navLinks: { display: 'flex', gap: '35px' },
    link: { color: '#94A3B8', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: '0.3s' },
    navAuth: { display: 'flex', alignItems: 'center', gap: '25px' },
    loginText: { color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem' },
    joinBtn: { backgroundColor: '#FF9900', color: '#131921', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' },
    portalBtn: { border: '2px solid #FF9900', background: 'transparent', color: '#FF9900', padding: '10px 24px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },

    // Hero
    hero: { height: '95vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#131921', background: 'radial-gradient(circle at top right, #1e293b, #131921)', color: '#fff', textAlign: 'center' },
    heroContent: { maxWidth: '850px', padding: '0 20px' },
    pillBadge: { background: 'rgba(255,153,0,0.1)', color: '#FF9900', padding: '8px 20px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '900', display: 'inline-block', marginBottom: '20px' },
    heroTitle: { fontSize: '5rem', fontWeight: '900', lineHeight: '1', margin: 0, letterSpacing: '-3px' },
    heroSub: { fontSize: '1.25rem', color: '#94A3B8', margin: '30px auto', maxWidth: '650px', lineHeight: '1.6' },
    ctaRow: { display: 'flex', gap: '20px', justifyContent: 'center' },
    mainCta: { padding: '22px 45px', borderRadius: '20px', background: '#FF9900', color: '#131921', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '1.1rem' },
    secondaryCta: { padding: '22px 45px', borderRadius: '20px', background: 'transparent', color: '#fff', fontWeight: '800', border: '2px solid #334155', cursor: 'pointer', fontSize: '1.1rem' },

    // Sections
    section: { padding: '120px 8%' },
    sectionHead: { textAlign: 'center', marginBottom: '80px' },
    title: { fontSize: '3rem', fontWeight: '900', color: '#131921', margin: 0, letterSpacing: '-1px' },
    sub: { color: '#64748B', fontSize: '1.1rem', marginTop: '10px' },

    // Bento Grid
    bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px' },
    bentoItem: { padding: '40px', borderRadius: '40px', backgroundColor: '#fff', border: '1px solid #E2E8F0', transition: '0.3s' },
    bentoEmoji: { fontSize: '2.5rem', display: 'block', marginBottom: '20px' },

    // Trust Section
    trustSection: { backgroundColor: '#131921', padding: '120px 8%', color: '#fff' },
    trustGrid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'center' },
    trustCheck: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', fontWeight: '700', color: '#CBD5E1' },
    check: { color: '#FF9900', fontWeight: '900' },
    trustVisual: { height: '400px', backgroundColor: '#1e293b', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    shieldBadge: { background: 'rgba(255,255,255,0.05)', padding: '20px 40px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '800' },

    // Pipeline
    pipeline: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' },
    pipeItem: { position: 'relative' },
    pipeNum: { fontSize: '4rem', fontWeight: '900', color: '#FF9900', opacity: 0.1, position: 'absolute', top: '-20px', left: 0 },
    pipeName: { fontSize: '1.4rem', fontWeight: '900', color: '#131921', marginBottom: '10px', position: 'relative' },
    pipeDesc: { color: '#64748B', fontSize: '0.95rem', lineHeight: '1.6' },

    // Final Footer CTA
    footerCta: { padding: '120px 8%', textAlign: 'center', backgroundColor: '#FF9900', color: '#131921' },
    finalBtn: { padding: '25px 60px', borderRadius: '25px', backgroundColor: '#131921', color: '#fff', fontWeight: '900', fontSize: '1.2rem', border: 'none', cursor: 'pointer' },

    // Add these to your styles object
    wellnessSection: { backgroundColor: '#1e293b', padding: '120px 8%', textAlign: 'center' },
    wellnessContent: { maxWidth: '1000px', margin: '0 auto' },
    wellnessGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginTop: '50px' },
    wellCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: '35px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' },
    wellIcon: { fontSize: '2rem', display: 'block', marginBottom: '15px' },

    // Add these to your styles object
    waasSection: { padding: '120px 8%', backgroundColor: '#fff' },
    waasGrid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'center' },
    waasVisual: { height: '400px', backgroundColor: '#F8FAFC', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' },
    eventCard: { padding: '30px', backgroundColor: '#131921', color: '#fff', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
    waasList: { listStyle: 'none', padding: 0, marginTop: '30px' }
};

export default LandingPage;