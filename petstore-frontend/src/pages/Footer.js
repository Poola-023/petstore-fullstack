import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                {/* Brand Section */}
                <div style={styles.brandSection}>
                    <h2 style={styles.logo}>Pet<span style={styles.highlight}>&</span>Connect</h2>
                    <p style={styles.tagline}>CONNECT • CARE • COMPANION</p>
                </div>

                {/* Quick Links */}
                <div style={styles.linksSection}>
                    <Link to="/" style={styles.link}>Home</Link>
                    <Link to="/boutiques" style={styles.link}>Boutiques</Link>
                    <Link to="/contact" style={styles.link}>Support</Link>
                    <Link to="/privacy" style={styles.link}>Privacy</Link>
                </div>
            </div>

            {/* Copyright Bar */}
            <div style={styles.bottomBar}>
                <p style={styles.copyright}>
                    &copy; {new Date().getFullYear()} Pet & Connect. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#131921', // Dark matching your Navbar/Buttons
        color: '#fff',
        paddingTop: '40px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        marginTop: 'auto' // Helps push footer to bottom if container is flex
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 8%',
        flexWrap: 'wrap',
        gap: '20px'
    },
    brandSection: {
        display: 'flex',
        flexDirection: 'column'
    },
    logo: {
        fontSize: '1.8rem',
        fontWeight: '900',
        margin: 0,
        letterSpacing: '-0.5px'
    },
    highlight: {
        color: '#FF9900' // Brand Orange
    },
    tagline: {
        fontSize: '0.7rem',
        color: '#FF9900',
        fontWeight: '800',
        letterSpacing: '3px',
        marginTop: '5px'
    },
    linksSection: {
        display: 'flex',
        gap: '25px',
        flexWrap: 'wrap'
    },
    link: {
        color: '#B2BEC3',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'color 0.2s',
        cursor: 'pointer'
    },
    bottomBar: {
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        marginTop: '30px',
        padding: '20px 8%',
        textAlign: 'center'
    },
    copyright: {
        margin: 0,
        fontSize: '0.8rem',
        color: '#636E72',
        fontWeight: '600'
    }
};

export default Footer;