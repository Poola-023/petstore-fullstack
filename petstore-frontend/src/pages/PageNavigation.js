import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';

const PageNavigation = () => {
    const { petId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [nav, setNav] = useState({ prevId: null, nextId: null, total: 0, position: 0 });

    // ✨ FETCH SIBLING DATA (Only if we are on a pet details page)
    useEffect(() => {
        if (petId) {
            fetch(`http://${window.location.hostname}:8090/api/pets/${petId}/nav`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setNav(data))
            .catch(err => console.error("Nav fetch failed"));
        }
    }, [petId]);

    // ✨ BREADCRUMB LOGIC
    const pathnames = location.pathname.split('/').filter((x) => x);

    const routeLabels = {
        'all-pets': 'Boutique',
        'my-pets': 'My Companions',
        'success-stories': 'Stories',
        'track-order': 'Track Order',
        'care-guides': 'Knowledge Hub',
        'pet': 'Companion Details'
    };

    return (
        <div style={styles.navWrapper}>
            <div style={styles.container}>

                {/* 📍 BREADCRUMBS (Flipkart Style) */}
                <nav style={styles.breadcrumbList}>
                    <Link to="/" style={styles.link}>Home</Link>
                    {pathnames.map((value, index) => {
                        const last = index === pathnames.length - 1;
                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                        const label = routeLabels[value] || (value.startsWith('PET') ? 'View Pet' : value);

                        return (
                            <span key={to} style={styles.crumbItem}>
                                <span style={styles.separator}>/</span>
                                {last ? (
                                    <span style={styles.current}>{label}</span>
                                ) : (
                                    <Link to={to} style={styles.link}>{label}</Link>
                                )}
                            </span>
                        );
                    })}
                </nav>

                {/* ⬅️ SIBLING NAVIGATION (Only for Pet Details) ➡️ */}
                {petId && (
                    <div style={styles.siblingNav}>
                        <button
                            style={{...styles.navBtn, opacity: nav.prevId ? 1 : 0.4}}
                            disabled={!nav.prevId}
                            onClick={() => navigate(`/pet/${nav.prevId}`)}
                        >
                            ❮ Prev
                        </button>

                        <span style={styles.posIndicator}>
                            Companion <strong>{nav.position}</strong> of {nav.total}
                        </span>

                        <button
                            style={{...styles.navBtn, opacity: nav.nextId ? 1 : 0.4}}
                            disabled={!nav.nextId}
                            onClick={() => navigate(`/pet/${nav.nextId}`)}
                        >
                            Next ❯
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    navWrapper: {
        backgroundColor: '#F1F3F6', // Matching Flipkart's light gray bar
        padding: '10px 0',
        borderBottom: '1px solid #E0E0E0',
        fontSize: '0.75rem',
        fontFamily: 'inherit'
    },
    container: {
        maxWidth: '1250px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    breadcrumbList: { display: 'flex', alignItems: 'center', color: '#878787' },
    crumbItem: { display: 'flex', alignItems: 'center' },
    separator: { margin: '0 8px', color: '#878787' },
    link: { color: '#878787', textDecoration: 'none', cursor: 'pointer' },
    current: { color: '#212121', fontWeight: '600' },

    siblingNav: { display: 'flex', alignItems: 'center', gap: '20px' },
    navBtn: {
        background: '#fff',
        border: '1px solid #E0E0E0',
        padding: '4px 12px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    posIndicator: { color: '#878787', fontSize: '0.7rem' }
};

export default PageNavigation;