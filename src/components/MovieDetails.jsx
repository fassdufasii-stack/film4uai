import React, { useMemo, useState } from 'react';
import { Play, X, Heart, Bookmark, Star, Calendar, Clock, Globe, Shield, Sparkles } from 'lucide-react';
import { getMovieCompanionInsight } from '../services/gptService';
import './MovieDetails.css';

const MovieDetails = ({ movie, onClose, onWatch, isFavorite, isWatchlist, onAction, similarMovies = [] }) => {
    const [aiInsight, setAiInsight] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);

    const handleAiInsight = async (type) => {
        setLoadingAi(true);
        setAiInsight(null);
        try {
            const result = await getMovieCompanionInsight(movie, type);
            setAiInsight(result);
        } catch (e) {
            setAiInsight("AI Analysis failed. Try again.");
        } finally {
            setLoadingAi(false);
        }
    };

    if (!movie) return null;

    return (
        <div className="details-overlay">
            <div className="details-container">
                <button className="close-details-btn" onClick={onClose}><X size={32} /></button>

                {/* HERO HEADER */}
                <div className="details-hero" style={{ backgroundImage: `url(${movie.banner || movie.poster})` }}>
                    <div className="details-hero-overlay"></div>
                    <div className="details-hero-content">
                        <div className="details-badges">
                            <span className="details-year-badge"><Calendar size={14} /> {movie.releaseDate?.split('-')[0] || '2024'}</span>
                            <span className="details-quality-badge">4K ULTRA HD</span>
                            <span className="details-age-badge">PG-13</span>
                        </div>
                        <h1 className="details-title">{movie.title}</h1>
                        <div className="details-quick-meta">
                            <div className="details-stars">
                                <Star size={16} fill="#FFD700" color="#FFD700" />
                                <Star size={16} fill="#FFD700" color="#FFD700" />
                                <Star size={16} fill="#FFD700" color="#FFD700" />
                                <Star size={16} fill="#FFD700" color="#FFD700" />
                                <Star size={16} fill="rgba(255, 215, 0, 0.3)" color="transparent" />
                                <span className="rating-text">8.4 (AI Score)</span>
                            </div>
                            <span className="dot">•</span>
                            <span>{movie.tags?.[0] || 'Feature'}</span>
                            <span className="dot">•</span>
                            <span>2h 15m</span>
                        </div>

                        <div className="details-actions">
                            <button className="details-btn-play" onClick={() => onWatch(movie)}>
                                <Play fill="black" size={24} />
                                Play Now
                            </button>
                            <button className={`details-btn-circle ${isFavorite ? 'active' : ''}`} onClick={() => onAction('favorite')}>
                                <Heart fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "white"} />
                            </button>
                            <button className={`details-btn-circle ${isWatchlist ? 'active' : ''}`} onClick={() => onAction('watchlist')}>
                                <Bookmark fill={isWatchlist ? "#white" : "none"} color="white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT SPLIT */}
                <div className="details-grid-content container">
                    <div className="details-left">
                        <section className="details-section">
                            <h3 className="details-section-title">Storyline</h3>
                            <p className="details-description">
                                {movie.description}. This cinematic masterpiece explores the intersection
                                of AI discovery and human emotion, delivering a visceral narrative
                                that pushes the boundaries of the {movie.tags?.[0]} genre.
                            </p>
                        </section>

                        <section className="details-section">
                            <h3 className="details-section-title"><Sparkles size={16} className="icon-gold" /> AI Companion Insight</h3>
                            <div className="ai-actions-grid">
                                <button className="btn-ai-insight" onClick={() => handleAiInsight('ending')}>
                                    Ending Explained
                                </button>
                                <button className="btn-ai-insight" onClick={() => handleAiInsight('emotional')}>
                                    Emotional Analysis
                                </button>
                                <button className="btn-ai-insight" onClick={() => handleAiInsight('vibe')}>
                                    Vibe Match
                                </button>
                            </div>
                            {aiInsight && (
                                <div className="ai-insight-box">
                                    <p>{aiInsight}</p>
                                </div>
                            )}
                            {loadingAi && <p className="loading-text">Analyzing cinematic data...</p>}
                        </section>

                        <section className="details-section">
                            <h3 className="details-section-title">Cast & Crew</h3>
                            <div className="details-cast-list">
                                <div className="cast-item">
                                    <div className="cast-avatar">AI</div>
                                    <div className="cast-info">
                                        <p className="cast-name">Gemini AI</p>
                                        <p className="cast-role">Digital Director</p>
                                    </div>
                                </div>
                                <div className="cast-item">
                                    <div className="cast-avatar" style={{ background: '#3b82f6' }}>CF</div>
                                    <div className="cast-info">
                                        <p className="cast-name">Cloudflare Edge</p>
                                        <p className="cast-role">Lead Distributor</p>
                                    </div>
                                </div>
                                <div className="cast-item">
                                    <div className="cast-avatar" style={{ background: '#ec4899' }}>SB</div>
                                    <div className="cast-info">
                                        <p className="cast-name">Supabase</p>
                                        <p className="cast-role">Architectural Lead</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="details-right">
                        <section className="details-section">
                            <h3 className="details-section-title">Intelligence Specs</h3>
                            <div className="specs-list">
                                <div className="spec-item">
                                    <Globe size={18} />
                                    <div>
                                        <p className="spec-label">Language</p>
                                        <p className="spec-val">{movie.language || 'English'}</p>
                                    </div>
                                </div>
                                <div className="spec-item">
                                    <Clock size={18} />
                                    <div>
                                        <p className="spec-label">Latency</p>
                                        <p className="spec-val">12ms (Edge)</p>
                                    </div>
                                </div>
                                <div className="spec-item">
                                    <Shield size={18} />
                                    <div>
                                        <p className="spec-label">DRM Status</p>
                                        <p className="spec-val">Zero Trust Validated</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="details-section">
                            <h3 className="details-section-title">Vibe Gallery</h3>
                            <div className="details-gallery">
                                <div className="gallery-thumb" style={{ backgroundImage: `url(${movie.poster})` }}></div>
                                <div className="gallery-thumb" style={{ backgroundImage: `url(${movie.banner})` }}></div>
                                <div className="gallery-thumb" style={{ backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>+4 More</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* BOTTOM RECOMMENDATIONS */}
                <div className="details-recommendations container">
                    <h3 className="details-section-title">Similar AI Nodes</h3>
                    <div className="mini-recommendations-grid">
                        {similarMovies.slice(0, 4).map(m => (
                            <div key={m.id} className="mini-rec-card">
                                <img src={m.poster} alt={m.title} />
                                <div className="mini-rec-overlay">
                                    <Play size={12} fill="white" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
