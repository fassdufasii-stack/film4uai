import React, { useMemo } from 'react';
import MovieCard from './MovieCard';
import { Sparkles, Tv } from 'lucide-react';
import './DailyChannel.css';

const DailyChannel = ({ user, history, movies, onMovieClick, library = { favorites: [], watchlist: [] } }) => {
    const curation = useMemo(() => {
        if (!movies || movies.length === 0) return [];

        // AI Logic for Daily Curation
        // 1. Get favorite genre from history
        const genreCounts = {};
        history.forEach(h => {
            if (h.genre) genreCounts[h.genre] = (genreCounts[h.genre] || 0) + 1;
        });
        const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

        // 2. Filter movies: prioritized genre + some random variety
        let recommended = [];
        if (topGenre) {
            recommended = movies.filter(m => m.tags?.includes(topGenre)).slice(0, 3);
        }

        // Fill the rest with trending or indie to make it 5
        const others = movies
            .filter(m => !recommended.find(r => r.id === m.id))
            .sort(() => 0.5 - Math.random())
            .slice(0, 6 - recommended.length);

        return [...recommended, ...others];
    }, [movies, history]);

    const aiMessage = useMemo(() => {
        if (!user) return "Welcome to Film4u AI. Sign in to unlock your personalized broadcast channel.";

        const genreCounts = {};
        history.forEach(h => {
            if (h.genre) genreCounts[h.genre] = (genreCounts[h.genre] || 0) + 1;
        });
        const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

        if (topGenre) {
            return `Faizal, based on your love for ${topGenre}, I've programmed this 24-hour channel specifically for your taste.`;
        }
        return "The AI is analyzing your taste. Watch a few movies to personalize your daily broadcast.";
    }, [user, history]);

    return (
        <div className="daily-channel container">
            <div className="channel-header">
                <div className="channel-identity">
                    <div className="live-indicator">
                        <span className="dot"></span>
                        LIVE BROADCAST
                    </div>
                    <h2 className="channel-title">
                        <Tv size={28} className="icon-ai" />
                        Your AI <span className="gradient-text">Daily 4U</span>
                    </h2>
                </div>
                <p className="ai-narrative">
                    <Sparkles size={16} className="icon-sparkle" />
                    {aiMessage}
                </p>
            </div>

            <div className="channel-grid">
                {curation.map((movie, index) => (
                    <div key={movie.id} className={`channel-item item-${index}`}>
                        <MovieCard movie={movie} onMovieClick={onMovieClick} history={history} library={library} />
                        {index === 0 && <span className="prime-pick">EDITOR'S CHOICE</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyChannel;
