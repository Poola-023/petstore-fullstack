import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import SubFooter from './SubFooter';
import { useNavigate } from 'react-router-dom';

const SuccessStories = ({ user, setUser, cart }) => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_BASE = `http://${window.location.hostname}:8090/api/stories`;

    const fetchStories = async () => {
        try {
            const res = await fetch(`${API_BASE}/all`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Sort by newest first
                setStories(data.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)));
            }
        } catch (err) {
            console.error("Failed to fetch stories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleCheer = async (storyId) => {
        if (!user) return alert("Please login to cheer for this story! ❤️");

        try {
            const userId = user.userId || user.id;
            const res = await fetch(`${API_BASE}/${storyId}/cheer?userId=${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) fetchStories();
        } catch (err) {
            console.error("Cheer failed");
        }
    };

    return (
        <div style={styles.page}>
            <Navbar user={user} setUser={setUser} cart={cart} />

            {/* 🌟 HERO SECTION */}
            <header style={styles.hero}>
                <div style={styles.heroContent}>
                    <span style={styles.pill}>COMMUNITY CHRONICLES</span>
                    <h1 style={styles.title}>Soulful <span style={{color: '#FF9900'}}>Connections</span></h1>
                    <p style={styles.subtitle}>Celebrating the beautiful journeys between our companions and their forever families.</p>
                    <button style={styles.shareBtn} onClick={() => navigate('/my-pets')}>
                        Share Your Story +
                    </button>
                </div>
            </header>

            <div style={styles.container}>
                {loading ? (
                    <div style={styles.loader}>Gathering community moments...</div>
                ) : (
                    <div style={styles.bentoGrid}>
                        {stories.map((story, index) => (
                            <div
                                key={story.id}
                                style={{
                                    ...styles.bentoCard,
                                    // Visual Bento Logic
                                    gridColumn: (index % 4 === 0) ? 'span 2' : 'span 1',
                                    gridRow: (index % 4 === 0) ? 'span 2' : 'span 1'
                                }}
                            >
                                {/* ✨ FIXED: Rendering Base64 correctly */}
                                <img
                                    src={`data:image/jpeg;base64,${story.imageUrl}`}
                                    alt={story.petName}
                                    style={styles.storyImg}
                                />

                                <div style={styles.cardOverlay}>
                                    <div style={styles.cardTop}>
                                        <span style={styles.tag}>🐾 {story.petName}</span>
                                        <div style={styles.cheerGroup} onClick={(e) => {
                                            e.stopPropagation(); // Prevents card click
                                            handleCheer(story.id);
                                        }}>
                                            <span style={styles.heart}>❤️</span>
                                            {/* ✨ FIXED: Using 'likes' field */}
                                            <span style={styles.count}>{story.likes || 0}</span>
                                        </div>
                                    </div>

                                    <div style={styles.cardBottom}>
                                        {/* ✨ FIXED: Show summary of content */}
                                        <p style={styles.summary}>
                                            {story.storyContent?.length > 100
                                                ? `${story.storyContent.substring(0, 100)}...`
                                                : story.storyContent}
                                        </p>
                                        <div style={styles.authorRow}>
                                            <div style={styles.avatar}>
                                                {story.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={styles.authorName}>by {story.username}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <SubFooter />
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    hero: { backgroundColor: '#131921', padding: '120px 20px 80px 20px', textAlign: 'center', color: '#fff', backgroundImage: 'radial-gradient(circle at top right, #1e293b, #131921)' },
    heroContent: { maxWidth: '800px', margin: '0 auto' },
    pill: { background: 'rgba(255,153,0,0.1)', color: '#FF9900', padding: '8px 20px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' },
    title: { fontSize: '4rem', fontWeight: '900', margin: '20px 0', letterSpacing: '-2px' },
    subtitle: { color: '#94A3B8', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '40px' },
    shareBtn: { padding: '15px 35px', borderRadius: '15px', backgroundColor: '#FF9900', color: '#131921', border: 'none', fontWeight: '900', cursor: 'pointer' },

    container: { maxWidth: '1400px', margin: '-40px auto 100px auto', padding: '0 40px' },
    bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gridAutoRows: '300px', gap: '25px' },
    bentoCard: { position: 'relative', borderRadius: '35px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', cursor: 'pointer', transition: '0.3s ease' },
    storyImg: { width: '100%', height: '100%', objectFit: 'cover' },

    cardOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(19,25,33,0.9) 100%)', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    tag: { backgroundColor: 'rgba(255,153,0,0.8)', color: '#131921', padding: '6px 15px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '900' },
    cheerGroup: { backgroundColor: '#fff', padding: '8px 15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '8px' },
    heart: { fontSize: '1rem' },
    count: { fontWeight: '900', color: '#131921', fontSize: '0.85rem' },

    cardBottom: { color: '#fff' },
    summary: { fontSize: '1rem', fontWeight: '600', color: '#CBD5E1', marginBottom: '15px', lineHeight: '1.4' },
    authorRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FF9900', color: '#131921', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem' },
    authorName: { fontSize: '0.85rem', fontWeight: '700', color: '#fff' },
    loader: { textAlign: 'center', padding: '100px', fontWeight: '900', color: '#94A3B8' }
};

export default SuccessStories;