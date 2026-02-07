import React, { useState, useEffect } from 'react';
import { X, User, Heart, Settings, Shield, Moon, Sun, Zap, History } from 'lucide-react';
import './ProfileModal.css';
import { updateProfile, getUserProfile } from '../services/movieService';

const ProfileModal = ({ isOpen, onClose, user }) => {
    const [profile, setProfile] = useState({
        full_name: '',
        preferred_genres: [],
        preferred_moods: [],
        sensitivity_toggles: { violence: false, sadness: false }
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            getUserProfile().then(data => {
                if (data) setProfile(data);
            });
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const moods = ['Comfort', 'Dark', 'Nostalgic', 'Hype'];
    const genres = ['Action', 'Drama', 'Sci-Fi', 'Comedy', 'Documentary', 'Thriller'];

    const toggleItem = (list, item, field) => {
        const current = [...profile[field]];
        const index = current.indexOf(item);
        if (index > -1) current.splice(index, 1);
        else current.push(item);
        setProfile({ ...profile, [field]: current });
    };

    const toggleSensitivity = (key) => {
        const current = { ...profile.sensitivity_toggles };
        current[key] = !current[key];
        setProfile({ ...profile, sensitivity_toggles: current });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({
                full_name: profile.full_name,
                preferred_genres: profile.preferred_genres,
                preferred_moods: profile.preferred_moods,
                sensitivity_toggles: profile.sensitivity_toggles
            });
            alert("AI Profile Tuned!");
            onClose();
        } catch (error) {
            console.error("Profile sync error:", error);
            alert("Failed to sync profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="profile-container">
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                <div className="profile-sidebar">
                    <div className="user-avatar-large">
                        <User size={48} />
                    </div>
                    <h2>{profile.full_name || user.email.split('@')[0]}</h2>
                    <p className="user-tier">Premium Intelligence Active</p>

                    <nav className="profile-nav">
                        <button className="active"><User size={18} /> Personality</button>
                        <button><Heart size={18} /> Interests</button>
                        <button><Shield size={18} /> Safety</button>
                        <button><Settings size={18} /> Settings</button>
                    </nav>
                </div>

                <div className="profile-body">
                    <h1 className="body-title">Tune your AI Experience</h1>

                    <div className="profile-section">
                        <label>Display Name</label>
                        <input
                            type="text"
                            className="profile-input"
                            value={profile.full_name}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="profile-section">
                        <label><Moon size={16} /> Preferred Moods</label>
                        <div className="chip-grid">
                            {moods.map(m => (
                                <button
                                    key={m}
                                    className={`chip ${profile.preferred_moods?.includes(m) ? 'active' : ''}`}
                                    onClick={() => toggleItem(profile.preferred_moods, m, 'preferred_moods')}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="profile-section">
                        <label><Zap size={16} /> Favorite Genres</label>
                        <div className="chip-grid">
                            {genres.map(g => (
                                <button
                                    key={g}
                                    className={`chip ${profile.preferred_genres?.includes(g) ? 'active' : ''}`}
                                    onClick={() => toggleItem(profile.preferred_genres, g, 'preferred_genres')}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="profile-section">
                        <label><Shield size={16} /> Sensitivity Toggles (AI Filter)</label>
                        <div className="toggle-group">
                            <div className="toggle-item" onClick={() => toggleSensitivity('violence')}>
                                <span>Hide Violence</span>
                                <div className={`toggle-switch ${profile.sensitivity_toggles?.violence ? 'active' : ''}`}></div>
                            </div>
                            <div className="toggle-item" onClick={() => toggleSensitivity('sadness')}>
                                <span>Filter Sadness</span>
                                <div className={`toggle-switch ${profile.sensitivity_toggles?.sadness ? 'active' : ''}`}></div>
                            </div>
                        </div>
                    </div>

                    <button className="btn-save-profile" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Syncing Intelligence..." : "Update AI Profile"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
