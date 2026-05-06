import React, { useState } from 'react';
import Navbar from './Navbar';
import SubFooter from './SubFooter';
import PageNavigation from './PageNavigation';
// ✨ IMPORT LOCAL ASSETS FROM YOUR FOLDER STRUCTURE
import NutritionImg from '../CareGuide/Nutrition.png';
import GroomingImg from '../CareGuide/Grooming.png';
import TrainingImg from '../CareGuide/Training.png';
import HealthImg from '../CareGuide/Health.png';
import LifestyleImg from '../CareGuide/Lifestyle.png';

const PetCareGuides = ({ user, setUser, cart }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedGuide, setSelectedGuide] = useState(null);

    const categories = ['All', 'Nutrition', 'Training', 'Health', 'Grooming', 'Lifestyle'];

    const guides = [
        {
            id: 1,
            title: "Puppy Nutrition 101: What to Feed Your New Best Friend",
            category: "Nutrition",
            img: NutritionImg,
            readTime: "5 min",
            content: "Proper nutrition is the foundation of a healthy life for your puppy. During the first year, their bodies are rapidly developing, requiring a precise balance of protein, calcium, and essential fats. We recommend grain-free, high-protein kibble specifically formulated for growth. Avoid table scraps and ensure fresh water is always available. Consult our boutique experts for a personalized meal plan based on your puppy's breed and weight.",
            featured: true
        },
        {
            id: 2,
            title: "Essential Grooming Tips for Persian Cats",
            category: "Grooming",
            img: GroomingImg,
            readTime: "8 min",
            content: "The luxurious coat of a Persian cat requires daily attention. Use a wide-toothed metal comb to prevent painful mats, especially around the neck and under the legs. Monthly professional grooming at our boutique includes deep-conditioning baths and nail trimming to keep your feline royalty looking and feeling their best. Remember, a clean coat is a healthy coat!"
        },
        {
            id: 3,
            title: "Behavioral Training for German Shepherds",
            category: "Training",
            img: TrainingImg,
            readTime: "12 min",
            content: "German Shepherds are highly intelligent and thrive on mental stimulation. Training should focus on positive reinforcement rather than discipline. Master the 'Sit', 'Stay', and 'Heel' commands early. Socialization with other pets and humans is critical for building confidence. Our boutique training sessions can help you channel their high energy into obedient, soulful companionship."
        },
        {
            id: 4,
            title: "Recognizing Early Signs of Illness in Birds",
            category: "Health",
            img: HealthImg,
            readTime: "6 min",
            content: "Birds are experts at hiding illness. Key signs to watch for include changes in droppings, fluffed feathers for long periods, or a change in vocalization patterns. If your companion is less active or has a discharge from their beak, contact an avian specialist immediately. Regular check-ups are vital for our feathered friends."
        },
        {
            id: 5,
            title: "The Art of Socializing Your Senior Dog",
            category: "Lifestyle",
            img: LifestyleImg,
            readTime: "7 min",
            content: "Socialization isn't just for puppies. Senior dogs benefit greatly from gentle, low-stress interactions. Short walks in quiet parks or calm meetups with other older dogs keep their minds sharp and prevent loneliness. Monitor their body language carefully and ensure they have a comfortable place to retreat if they feel overwhelmed."
        }
    ];

    const filteredGuides = activeCategory === 'All'
        ? guides
        : guides.filter(g => g.category === activeCategory);

    // ✨ FULL GUIDE COMPONENT (Reading Mode)
    const FullGuideView = ({ guide }) => (
        <div style={styles.detailContainer}>
            <button style={styles.backBtn} onClick={() => setSelectedGuide(null)}>← Back to Knowledge Hub</button>
            <div style={styles.detailWrapper}>
                <div style={styles.detailImgFrame}>
                    <img src={guide.img} alt={guide.title} style={styles.detailImg} />
                </div>
                <div style={styles.detailBody}>
                    <span style={styles.detailBadge}>{guide.category}</span>
                    <h1 style={styles.detailTitle}>{guide.title}</h1>
                    <div style={styles.detailMeta}>⏱️ {guide.readTime} read • Verified by Pet & Connect Experts</div>
                    <div style={styles.divider}></div>
                    <p style={styles.detailText}>{guide.content}</p>
                    <div style={styles.ctaBox}>
                        <p style={{margin: 0, fontWeight: '700'}}>Need help applying these tips?</p>
                        <button style={styles.ctaBtn}>Contact Our Specialist</button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />
            <PageNavigation />
            {selectedGuide ? (
                <FullGuideView guide={selectedGuide} />
            ) : (
                <>
                    <header style={styles.hero}>
                        <div style={styles.heroContent}>
                            <span style={styles.heroTag}>VERIFIED PET KNOWLEDGE</span>
                            <h1 style={styles.title}>The Paws <span style={{color: '#FF9900'}}>&</span> Palette Hub</h1>
                            <p style={styles.subtitle}>Curated expert advice for the modern pet guardian.</p>
                        </div>
                    </header>

                    <div style={styles.container}>
                        {/* CATEGORY FILTER */}
                        <div style={styles.filterBar}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    style={{
                                        ...styles.filterBtn,
                                        backgroundColor: activeCategory === cat ? '#131921' : '#fff',
                                        color: activeCategory === cat ? '#fff' : '#131921',
                                    }}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* GRID VIEW */}
                        <div style={styles.grid}>
                            {filteredGuides.map(guide => (
                                <div key={guide.id} style={styles.card} onClick={() => setSelectedGuide(guide)}>
                                    <div style={styles.imgWrapper}>
                                        <img src={guide.img} alt={guide.title} style={styles.cardImg} />
                                        <span style={styles.badgeOverlay}>{guide.category}</span>
                                    </div>
                                    <div style={styles.cardContent}>
                                        <span style={styles.readTimeText}>⏱️ {guide.readTime} read</span>
                                        <h3 style={styles.cardTitle}>{guide.title}</h3>
                                        <button style={styles.readBtn}>Read Article →</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
            <SubFooter />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    hero: { backgroundColor: '#131921', padding: '120px 20px 80px 20px', textAlign: 'center', color: '#fff' },
    heroTag: { color: '#FF9900', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1.5px', marginBottom: '15px', display: 'block' },
    title: { fontSize: '3.5rem', fontWeight: '950', margin: 0, letterSpacing: '-2px' },
    subtitle: { color: '#94A3B8', fontSize: '1.1rem', marginTop: '10px', fontWeight: '500' },

    container: { maxWidth: '1250px', margin: '0 auto', padding: '40px 20px' },

    filterBar: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '60px', flexWrap: 'wrap' },
    filterBtn: { padding: '12px 30px', borderRadius: '50px', fontWeight: '800', border: '1px solid #131921', cursor: 'pointer', transition: '0.3s' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' },
    card: { backgroundColor: '#fff', borderRadius: '35px', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9', cursor: 'pointer', transition: 'all 0.3s ease' },
    imgWrapper: { position: 'relative', height: '260px', backgroundColor: '#F1F5F9' },
    cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
    badgeOverlay: { position: 'absolute', top: '20px', left: '20px', backgroundColor: '#131921', color: '#FF9900', padding: '6px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900' },

    cardContent: { padding: '30px' },
    readTimeText: { fontSize: '0.8rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px', display: 'block' },
    cardTitle: { fontSize: '1.4rem', fontWeight: '900', color: '#131921', marginBottom: '25px', lineHeight: '1.3' },
    readBtn: { background: 'none', border: 'none', color: '#131921', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', padding: 0 },

    // Detail Reading View
    detailContainer: { maxWidth: '900px', margin: '140px auto 80px auto', padding: '0 20px' },
    backBtn: { background: 'none', border: 'none', color: '#64748B', fontWeight: '800', cursor: 'pointer', marginBottom: '30px' },
    detailWrapper: { backgroundColor: '#fff', borderRadius: '40px', overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' },
    detailImgFrame: { width: '100%', height: '450px', backgroundColor: '#F8FAFC' },
    detailImg: { width: '100%', height: '100%', objectFit: 'cover' },
    detailBody: { padding: '60px' },
    detailBadge: { color: '#FF9900', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' },
    detailTitle: { fontSize: '3rem', fontWeight: '950', color: '#131921', margin: '20px 0', lineHeight: '1.1' },
    detailMeta: { color: '#94A3B8', fontSize: '1rem', fontWeight: '600', marginBottom: '40px' },
    divider: { height: '1px', backgroundColor: '#F1F5F9', marginBottom: '40px' },
    detailText: { fontSize: '1.25rem', lineHeight: '1.8', color: '#1e293b' },
    ctaBox: { marginTop: '60px', padding: '40px', backgroundColor: '#F8FAFC', borderRadius: '30px', textAlign: 'center', border: '1px solid #E2E8F0' },
    ctaBtn: { padding: '18px 40px', backgroundColor: '#FF9900', color: '#131921', border: 'none', borderRadius: '18px', fontWeight: '900', cursor: 'pointer', marginTop: '20px' }
};

export default PetCareGuides;