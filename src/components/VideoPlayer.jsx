import React, { useState } from 'react';
import { X, Maximize, Volume2, Play, Pause, Sparkles, MessageSquare, Brain, Zap, Loader2 } from 'lucide-react';
import './VideoPlayer.css';
import { getMovieCompanionInsight } from '../services/gptService';

const VideoPlayer = ({ movie, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [showCompanion, setShowCompanion] = useState(false);
    const [companionLoading, setCompanionLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState('');

    const askCompanion = async (type) => {
        setCompanionLoading(true);
        setShowCompanion(true);
        setAiInsight("AI Assistant is analyzing the cinematic structure...");
        try {
            const insight = await getMovieCompanionInsight(movie, type);
            setAiInsight(insight);
        } catch (e) {
            setAiInsight("My analytical nodes are offline. Try again shortly!");
        } finally {
            setCompanionLoading(false);
        }
    };

    return (
        <div className="player-overlay">
            <div className="player-container">
                {/* HEADER */}
                <div className="player-header">
                    <div className="player-title-info">
                        <h3>{movie.title}</h3>
                        <span className="player-quality-tag">4K AI UPSCALED</span>
                    </div>
                    <button className="player-close" onClick={onClose}><X size={24} /></button>
                </div>

                {/* MOCK VIDEO STAGE */}
                <div className="video-stage">
                    <div className="video-placeholder">
                        <img src={movie.banner || movie.poster} alt="Scene" />
                        {!isPlaying && <div className="video-overlay"><Play size={64} fill="white" /></div>}
                    </div>

                    {/* AI COMPANION SIDEBAR */}
                    {showCompanion && (
                        <div className="ai-companion-drawer">
                            <div className="drawer-header">
                                <Sparkles size={18} className="icon-ai" />
                                <h4>AI Cinema Companion</h4>
                                <button onClick={() => setShowCompanion(false)}><X size={16} /></button>
                            </div>
                            <div className="drawer-content">
                                {companionLoading ? (
                                    <div className="ai-loading">
                                        <Loader2 className="animate-spin" />
                                        <span>Scanning the metadata...</span>
                                    </div>
                                ) : (
                                    <p className="ai-text">{aiInsight}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTROLS */}
                <div className="player-controls">
                    <div className="controls-left">
                        <button onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                        </button>
                        <Volume2 size={24} />
                        <span className="time-display">12:44 / 2:15:00</span>
                    </div>

                    <div className="controls-center">
                        <button className="companion-btn" onClick={() => askCompanion('emotional')}>
                            <Brain size={18} /> Emotional Analysis
                        </button>
                        <button className="companion-btn" onClick={() => askCompanion('ending')}>
                            <MessageSquare size={18} /> Explain Ending
                        </button>
                        <button className="companion-btn" onClick={() => askCompanion('vibe')}>
                            <Zap size={18} /> Same Vibe
                        </button>
                    </div>

                    <div className="controls-right">
                        <Maximize size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
