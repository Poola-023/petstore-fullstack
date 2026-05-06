import React from 'react';
import { Link } from 'react-router-dom';

const SubFooter = () => {
    return (
        <footer style={styles.footer}>


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
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        marginTop: 'auto' // Helps push footer to bottom if container is flex
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

export default SubFooter;