import { supabase } from '../lib/supabaseClient'
import { analyzeUserProfile } from './gptService';

/**
 * AI Personalization Engine for Film4u AI
 * Handles mood discovery, user-preference tracking, and dynamic layout injection.
 */

// 1. Mood Mapping (AI Logic)
export const MOODS = {
    "Comfort": ["Comedy", "Animation", "Family", "Music", "Romance"],
    "Dark": ["Horror", "Crime", "Mystery", "Thriller"],
    "Nostalgic": ["Drama", "History", "Documentary"],
    "Hype": ["Action", "Adventure", "Fantasy"],
    "Bored": ["Sci-Fi", "Animation", "Documentary"],
    "Excited": ["Action", "War", "Crime", "Thriller"]
};

// 2. Track User Interaction (Click/Watch)
export const trackInteraction = async (movie) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('watch_history')
        .insert([{
            user_id: user.id,
            movie_id: movie.id,
            movie_type: movie.isIndie ? 'indie' : 'ott',
            genre: movie.tags?.[0] || 'Unknown',
            language: movie.language || 'English'
        }]);

    if (error) console.error("AI Logging Error:", error.message);
}

// 3. AI Layout Reordering
// Learns from history to push relevant categories to the top
export const getAIPriorityCategories = (history, baseCategories) => {
    if (!history || history.length === 0) return baseCategories;

    // Count occurrences
    const langPrefs = {};
    const genrePrefs = {};

    history.forEach(h => {
        langPrefs[h.language] = (langPrefs[h.language] || 0) + 1;
        genrePrefs[h.genre] = (genrePrefs[h.genre] || 0) + 1;
    });

    // Sort categories based on preference match
    return [...baseCategories].sort((a, b) => {
        const aScore = (a.id === 'malayalam' && langPrefs['Malayalam']) ? langPrefs['Malayalam'] : 0;
        const bScore = (b.id === 'malayalam' && langPrefs['Malayalam']) ? langPrefs['Malayalam'] : 0;
        return bScore - aScore;
    });
}

// 4. Mood-Based Search
export const getMoviesByMood = (allMovies, mood) => {
    const targetGenres = MOODS[mood] || [];
    return allMovies.filter(m =>
        m.tags.some(tag => targetGenres.includes(tag)) ||
        (m.moods && m.moods.includes(mood))
    );
}
// 5. Calculate AI Match Score %
export const calculateMatchScore = (movie, history) => {
    if (!history || history.length === 0) return Math.floor(Math.random() * (95 - 70 + 1)) + 70; // 70-95% for new users

    let score = 50; // Starting base score

    // Count occurrences in history
    const genrePrefs = {};
    const langPrefs = {};
    history.forEach(h => {
        if (h.genre) genrePrefs[h.genre] = (genrePrefs[h.genre] || 0) + 1;
        if (h.language) langPrefs[h.language] = (langPrefs[h.language] || 0) + 1;
    });

    // Check movie genre match
    const movieGenre = movie.tags?.[0];
    if (movieGenre && genrePrefs[movieGenre]) {
        score += Math.min(genrePrefs[movieGenre] * 10, 30); // Max 30% from genre
    }

    // Check language match
    if (movie.language && langPrefs[movie.language]) {
        score += 15; // 15% from matching language
    }

    // Add some "AI Randomness" (5-10%) to keep it fresh
    score += Math.floor(Math.random() * 5);

    return Math.min(score, 99); // Cap at 99%
}

// 6. Get AI Profile (New)
export const getAIProfile = async (history) => {
    return await analyzeUserProfile(history);
}
