import React, { useState } from 'react';
import './MoodVibePicker.css';
import { Sparkles, Cloud, Zap, Flame, Moon, Coffee } from 'lucide-react';

const VIBES = [
    { name: 'Comfort', emoji: '🌙', color: '#818cf8', icon: <Moon size={20} />, description: 'Warm & Cozy' },
    { name: 'Dark', emoji: '🌑', color: '#1e1b4b', icon: <Sparkles size={20} />, description: 'Deep & Intense' },
    { name: 'Nostalgic', emoji: '📺', color: '#f472b6', icon: <Coffee size={20} />, description: 'Past Memories' },
    { name: 'Hype', emoji: '🔥', color: '#fb923c', icon: <Flame size={20} />, description: 'High Energy' },
    { name: 'Bored', emoji: '🌥️', color: '#94a3b8', icon: <Cloud size={20} />, description: 'Something New' },
    { name: 'Excited', emoji: '⚡', color: '#2dd4bf', icon: <Zap size={20} />, description: 'Thrill Seek' }
];

const MoodVibePicker = ({ activeMood, onMoodSelect }) => {
    return (
        <div className="vibe-picker-container container">
            <div className="vibe-header">
                <h2 className="vibe-title">How's your <span className="gradient-text">Energy</span> today?</h2>
                <p className="vibe-subtitle">The AI tunes its discovery engine based on your current frequency.</p>
            </div>

            <div className="vibe-grid">
                {VIBES.map((vibe) => (
                    <div
                        key={vibe.name}
                        className={`vibe-card ${activeMood === vibe.name ? 'active' : ''}`}
                        style={{ '--vibe-color': vibe.color }}
                        onClick={() => onMoodSelect(activeMood === vibe.name ? null : vibe.name)}
                    >
                        <div className="vibe-blobs">
                            <div className="blob"></div>
                            <div className="blob"></div>
                        </div>
                        <div className="vibe-content">
                            <div className="vibe-icon-wrapper">
                                {vibe.icon}
                            </div>
                            <span className="vibe-emoji">{vibe.emoji}</span>
                            <h3 className="vibe-name">{vibe.name}</h3>
                            <p className="vibe-desc">{vibe.description}</p>
                        </div>
                        {activeMood === vibe.name && <div className="vibe-ping"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MoodVibePicker;
