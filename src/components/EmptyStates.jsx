import React from 'react';
import { SearchX, Film, Ghost, Heart } from 'lucide-react';

export const EmptySearch = ({ term }) => (
    <div className="empty-state">
        <div className="empty-icon-wrapper">
            <SearchX size={48} strokeWidth={1} />
            <div className="ai-ripple"></div>
        </div>
        <h3>No matches found in our channels</h3>
        <p>Even our AI couldn't find anything for <b>"{term}"</b>. Try searching for a vibe like "Neon" or "Cyberpunk".</p>
    </div>
);

export const EmptyWatchlist = () => (
    <div className="empty-state">
        <div className="empty-icon-wrapper">
            <Ghost size={48} strokeWidth={1} />
            <div className="ai-ripple"></div>
        </div>
        <h3>Your Watchlist is a Ghost Town</h3>
        <p>Save movies you want to watch later and they will appear here in your personal library.</p>
    </div>
);

export const EmptyFavorites = () => (
    <div className="empty-state">
        <div className="empty-icon-wrapper">
            <Heart size={48} strokeWidth={1} />
            <div className="ai-ripple"></div>
        </div>
        <h3>Show some love</h3>
        <p>Like movies to help the AI understand your unique cinematic taste better.</p>
    </div>
);
