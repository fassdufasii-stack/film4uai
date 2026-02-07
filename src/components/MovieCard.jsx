import React, { useMemo, useState, useEffect } from 'react';
import './MovieCard.css';
import { Play, Sparkles, Heart, Bookmark, Check, Volume2, Info, Star } from 'lucide-react';
import { calculateMatchScore } from '../services/aiService';
import { toggleLibraryItem } from '../services/movieService';

const MovieCard = ({ movie, onMovieClick, history = [], library = { favorites: [], watchlist: [] } }) => {
    const matchScore = useMemo(() => calculateMatchScore(movie, history), [movie, history]);
    const [isHovered, setIsHovered] = useState(false);

    // Library State
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWatchlist, setIsWatchlist] = useState(false);

    useEffect(() => {
        setIsFavorite(library.favorites?.some(i => i.movie_id === movie.id.toString()));
        setIsWatchlist(library.watchlist?.some(i => i.movie_id === movie.id.toString()));
    }, [library, movie.id]);

    const handleAction = async (e, type) => {
        e.stopPropagation();
        try {
            await toggleLibraryItem(movie.id, movie.isIndie ? 'indie' : 'ott', type);
            if (type === 'favorite') setIsFavorite(!isFavorite);
            if (type === 'watchlist') setIsWatchlist(!isWatchlist);
        } catch (err) {
            alert("Sign in to save movies!");
        }
    };

    return (
        <div
            className={`movie-card ${isHovered ? 'hovered' : ''}`}
            onClick={() => onMovieClick && onMovieClick(movie)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="poster-container">
                {/* PREVIEW IMAGE / MOTION */}
                <img
                    src={isHovered ? (movie.banner || movie.poster) : movie.poster}
                    alt={movie.title}
                    className={isHovered ? 'preview-scale' : ''}
                    loading="lazy"
                />

                {/* TRAILER OVERLAY (Simplified for aesthetic) */}
                {isHovered && (
                    <div className="trailer-preview-overlay">
                        <div className="preview-header">
                            <span className="live-tag"><Volume2 size={10} /> LIVE</span>
                        </div>
                        <div className="progress-mini">
                            <div className="progress-fill"></div>
                        </div>
                    </div>
                )}

                {/* AI MATCH BADGE */}
                <div className="match-score-badge" style={{
                    background: matchScore > 85 ? 'linear-gradient(45deg, #FFD700, #FFA500)' : 'rgba(0,0,0,0.7)',
                    color: matchScore > 85 ? 'black' : '#00e5ff',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <Sparkles size={10} fill={matchScore > 85 ? "black" : "#00e5ff"} />
                    <span style={{ fontWeight: 700 }}>{matchScore}%</span> {matchScore > 90 ? 'TOP PICK' : 'Match'}
                </div>

                <div className="card-info-overlay">
                    <div className="card-actions-row">
                        <button
                            className={`mini-action-btn ${isFavorite ? 'active' : ''}`}
                            onClick={(e) => handleAction(e, 'favorite')}
                        >
                            <Heart size={14} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "white"} />
                        </button>
                        <button
                            className={`mini-action-btn ${isWatchlist ? 'active' : ''}`}
                            onClick={(e) => handleAction(e, 'watchlist')}
                        >
                            {isWatchlist ? <Check size={14} color="#4ade80" /> : <Bookmark size={14} />}
                        </button>
                    </div>

                    <div className="card-details">
                        <span className="card-genre">{movie.tags?.[0] || 'Discovery'}</span>
                        <h4 className="card-title-mini">{movie.title}</h4>
                        <div className="card-rating-stars">
                            <Star size={10} fill="#FFD700" color="#FFD700" />
                            <Star size={10} fill="#FFD700" color="#FFD700" />
                            <Star size={10} fill="#FFD700" color="#FFD700" />
                            <Star size={10} fill="#FFD700" color="#FFD700" />
                            <Star size={10} fill="rgba(255, 215, 0, 0.3)" color="transparent" />
                        </div>
                    </div>
                </div>

                {/* PLAY ICON CENTER ON HOVER */}
                {isHovered && (
                    <div className="center-play-trigger">
                        <div className="play-pulse-ring"></div>
                        <Play size={24} fill="white" color="white" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieCard;
