import React, { useState, useEffect } from 'react';
import { Search, Upload, User, LogOut, Sparkles } from 'lucide-react';
import VoiceSearch from './VoiceSearch';
import './Navbar.css';

const Navbar = ({ onSearch, onUploadClick, onAuthClick, user, onSignOut, onProfileClick }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        onSearch(val);
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                <div className="logo" onClick={() => handleSearchChange('')}>
                    <span className="film">Film4u</span>
                    <span className="ai gradient-text"> AI</span>
                </div>

                <div className="search-bar ai-enhanced">
                    <Sparkles className="ai-icon" size={16} />
                    <input
                        type="text"
                        placeholder="Ask AI or search movies, actors..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    <VoiceSearch onVoiceCommand={handleSearchChange} />
                </div>

                <div className="nav-actions">
                    <button className="btn-icon" onClick={onUploadClick} title="Upload Indie Content">
                        <Upload size={20} />
                        <span className="mobile-hide">Upload</span>
                    </button>

                    {user ? (
                        <div className="user-nav-group">
                            <div className="user-profile active" title={user.email} onClick={onProfileClick} style={{ cursor: 'pointer' }}>
                                <User size={20} />
                            </div>
                            <button className="btn-icon sign-out" onClick={onSignOut} title="Sign Out">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <button className="btn-auth" onClick={onAuthClick}>Sign In</button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
