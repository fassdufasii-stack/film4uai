import React from 'react';
import { X, Shield, Lock, Eye, Trash2 } from 'lucide-react';
import './PrivacyModal.css';

const PrivacyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content privacy-modal">
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <div className="privacy-header">
                    <Shield className="icon-ai" size={40} />
                    <h2 className="gradient-text">Privacy & AI Ethics</h2>
                    <p>How we protect your cinematic identity.</p>
                </div>

                <div className="privacy-scroll-area">
                    <section className="privacy-section">
                        <div className="section-title">
                            <Lock size={18} />
                            <h3>Data Encryption</h3>
                        </div>
                        <p>All your watch history and library data are encrypted at rest via Supabase AES-256 standards. Only the AI engine has read-access to build your taste profile.</p>
                    </section>

                    <section className="privacy-section">
                        <div className="section-title">
                            <Eye size={18} />
                            <h3>AI Transparency</h3>
                        </div>
                        <p>Our Gemini Pro integration is "Zero-Training" for your private inputs. Your personal chat logs with the Concierge are not used to train global models.</p>
                    </section>

                    <section className="privacy-section">
                        <div className="section-title">
                            <Trash2 size={18} />
                            <h3>Right to Erasure</h3>
                        </div>
                        <p>You can purge your entire AI Taste Profile at any time from your Profile Settings. This will reset the discovery engine to factory settings.</p>
                    </section>

                    <section className="privacy-section">
                        <p className="privacy-meta">Last Updated: February 2026. Architected by Muhammed Faizal.</p>
                    </section>
                </div>

                <button className="btn-save-profile" onClick={onClose} style={{ marginTop: '1rem' }}>I Understand</button>
            </div>
        </div>
    );
};

export default PrivacyModal;
