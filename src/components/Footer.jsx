import React from 'react';

const Footer = ({ onAboutClick, onPrivacyClick }) => {
    return (
        <footer style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderTop: '1px solid #111',
            background: 'rgba(0,0,0,0.5)',
            color: '#444',
            marginTop: '3rem',
            position: 'relative',
            zIndex: 10
        }}>
            <div className="container">
                <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#666' }}>Film4u </span>
                    <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.2rem' }}>AI</span>
                </div>

                <p style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>Where AI runs the channels.</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <span style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Browse</span>
                    <span style={{ cursor: 'pointer' }} onClick={onAboutClick}>About Founder</span>
                    <span style={{ cursor: 'pointer' }} onClick={onPrivacyClick}>Privacy</span>
                    <span style={{ cursor: 'pointer' }} onClick={onPrivacyClick}>Terms</span>
                </div>

                <p style={{ marginTop: '3rem', fontSize: '0.7rem' }}>
                    &copy; {new Date().getFullYear()} Film4u AI Platform.
                    Architected by <span style={{ color: '#888' }}>Muhammed Faizal</span>.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
