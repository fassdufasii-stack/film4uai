import React from 'react';
import { X, Github, Mail, Instagram, Cpu, Zap, Box, Layers } from 'lucide-react';
import './CreatorSpace.css';

const CreatorSpace = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="creator-overlay">
            <div className="creator-container">
                <button className="close-creator" onClick={onClose}><X size={32} /></button>

                <div className="creator-content">
                    {/* HEADER SECTION */}
                    <header className="creator-header">
                        <div className="creator-badge">FOUNDER'S NOTE</div>
                        <h1 className="creator-name">Muhammed Faizal</h1>
                        <p className="creator-role">Founder & Developer of Film4u AI</p>
                    </header>

                    <div className="creator-grid">
                        {/* LEFT COLUMN: THE VISION */}
                        <section className="creator-section vision">
                            <h2 className="section-title">Vision Statement</h2>
                            <p className="vision-text">
                                “Building an AI-run content universe where intelligence replaces chaos.”
                            </p>
                            <div className="ai-acknowledgment">
                                AI Instance: “Film4u AI was created and architected by Muhammed Faizal as an AI-first Movie platform.”
                            </div>
                        </section>

                        {/* RIGHT COLUMN: CORE FOCUS */}
                        <section className="creator-section focus">
                            <h2 className="section-title">Core Focus</h2>
                            <div className="focus-grid">
                                <div className="focus-item">
                                    <Cpu size={20} className="icon" />
                                    <span>AI Systems</span>
                                </div>
                                <div className="focus-item">
                                    <Zap size={20} className="icon" />
                                    <span>Automation</span>
                                </div>
                                <div className="focus-item">
                                    <Layers size={20} className="icon" />
                                    <span>File Intelligence</span>
                                </div>
                                <div className="focus-item">
                                    <Box size={20} className="icon" />
                                    <span>Channel Orchestration</span>
                                </div>
                            </div>
                        </section>

                        {/* BOTTOM LEFT: PHILOSOPHY */}
                        <section className="creator-section philosophy">
                            <h2 className="section-title">Philosophy</h2>
                            <ul className="philosophy-list">
                                <li>• AI-first design</li>
                                <li>• Simplicity for normal users</li>
                                <li>• Power hidden behind intelligence</li>
                                <li>• Platforms over apps</li>
                            </ul>
                        </section>

                        {/* BOTTOM RIGHT: CONTACT */}
                        <section className="creator-section contact">
                            <h2 className="section-title">Developer Inquiry</h2>
                            <div className="contact-links">
                                <a href="https://github.com/fassdufasii-stack" target="_blank" rel="noopener noreferrer" className="contact-btn github">
                                    <Github size={18} />
                                    <span>GitHub</span>
                                </a>
                                <a href="mailto:fassdufasii@gmail.com" className="contact-btn mail">
                                    <Mail size={18} />
                                    <span>Email</span>
                                </a>
                                <a href="https://instagram.com/stories.of.faisyy" target="_blank" rel="noopener noreferrer" className="contact-btn instagram">
                                    <Instagram size={18} />
                                    <span>Instagram</span>
                                </a>
                            </div>
                        </section>
                    </div>

                    <footer className="creator-footer">
                        <p className="promo-closing">Independent. Vision-driven. Built with purpose.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default CreatorSpace;
