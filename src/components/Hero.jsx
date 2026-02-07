import React from 'react';
import './Hero.css';
import { Play, Info, Star, Shield, Zap } from 'lucide-react';

const Hero = ({ movie, onMovieClick }) => {
    if (!movie) return null;

    return (
        <div className="hero" style={{ backgroundImage: `url(${movie.banner || movie.poster})` }}>
            <div className="hero-overlay"></div>

            {/* NEW: Dynamic Scanner Layer for "AI feel" */}
            <div className="hero-scanner"></div>

            <div className="hero-content container">
                <div className="hero-meta-top animate-fade-in">
                    {movie.id >= 19 ? (
                        <span className="hero-showcase-badge">
                            <Zap size={14} className="icon-pulse" />
                            AI PREMIUM SHOWCASE
                        </span>
                    ) : (
                        <span className="hero-original-badge">
                            <Shield size={14} />
                            FILM4U ORIGINAL
                        </span>
                    )}
                    <span className="hero-genre-pill">{movie.tags?.[0] || 'Discovery'}</span>
                    <div className="hero-rating">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={14} fill={i <= 5 ? "#00f2ea" : "transparent"} color={i <= 5 ? "#00f2ea" : "#444"} />
                        ))}
                    </div>
                </div>

                <h1 className="hero-title animate-slide-up">{movie.title}</h1>

                <p className="hero-description animate-fade-in">
                    {movie.description}
                </p>

                <div className="hero-actions animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <button className="btn btn-primary btn-glow" onClick={() => onMovieClick && onMovieClick(movie)}>
                        <Play fill="currentColor" size={20} />
                        Watch Now
                    </button>
                    <button className="btn btn-glass" onClick={() => onMovieClick && onMovieClick(movie)}>
                        <Info size={20} />
                        More Info
                    </button>
                </div>
            </div>

            {/* NEW: Decorative Bottom Data Grid */}
            <div className="hero-data-grid desktop-only">
                <div className="data-item">
                    <span className="label">BITRATE</span>
                    <span className="value">4K HDR</span>
                </div>
                <div className="data-item">
                    <span className="label">AI SCORE</span>
                    <span className="value">9.8/10</span>
                </div>
                <div className="data-item">
                    <span className="label">LATENCY</span>
                    <span className="value">24MS</span>
                </div>
            </div>
        </div>
    );
};

export default Hero;
