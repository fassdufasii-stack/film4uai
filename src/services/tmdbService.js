/**
 * TMDB Intelligence Service for Film4u AI
 * Fetches real trending OTT content and "AI Tags" it for our platform.
 * Now integrated with real-world Availability (Watch Providers).
 */

import freekeys from 'freekeys';

const FALLBACK_TMDB_KEY = "e547e17d4e91f3e62a571655cd1ccaff";
let ACTIVE_TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || FALLBACK_TMDB_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Initialize keys from freekeys package
const initKeys = async () => {
    try {
        const params = await freekeys();
        if (params && params.tmdb_key) {
            ACTIVE_TMDB_KEY = params.tmdb_key;
        }
    } catch (e) {
        console.warn("Freekeys recovery failed, using standard key.");
    }
};

initKeys();

// AI Logic: Map TMDB Genres to our Mood Discovery system
const MOOD_MAP = {
    28: 'Hype',      // Action
    12: 'Hype',      // Adventure
    16: 'Comfort',   // Animation
    35: 'Comfort',   // Comedy
    80: 'Dark',      // Crime
    99: 'Nostalgic', // Documentary
    18: 'Nostalgic', // Drama
    10751: 'Comfort',// Family
    14: 'Hype',      // Fantasy
    36: 'Nostalgic', // History
    27: 'Dark',      // Horror
    10402: 'Comfort',// Music
    9648: 'Dark',    // Mystery
    10749: 'Comfort',// Romance
    878: 'Bored',    // Sci-Fi
    53: 'Dark',      // Thriller
    10752: 'Excited',// War
    37: 'Excited',   // Western
};

const getGenreName = (id) => {
    const names = {
        28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
        99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
        27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
        10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
    };
    return names[id] || "Drama";
};

/**
 * Fetch specific watch providers for a movie in a specific region (Default: IN)
 */
export const getWatchProviders = async (id, type = 'movie', region = 'IN') => {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/watch/providers?api_key=${ACTIVE_TMDB_KEY}`);
        const data = await response.json();
        const providers = data.results[region];

        if (providers && providers.flatrate) {
            return providers.flatrate[0].provider_name; // Returns first available (e.g. Netflix)
        }
        return 'Search Google';
    } catch (e) {
        return 'Official Platform';
    }
};

export const fetchTrendingOTT = async () => {
    try {
        const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${ACTIVE_TMDB_KEY}`);
        const data = await response.json();

        const results = await Promise.all(data.results.map(async (item) => {
            const genres = item.genre_ids || [];
            const primaryMood = MOOD_MAP[genres[0]] || 'Bored';

            // Fetch REAL availability for this item
            const realPlatform = await getWatchProviders(item.id, item.media_type === 'tv' ? 'tv' : 'movie');

            return {
                id: item.id,
                title: item.title || item.name,
                poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                banner: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
                description: `AI Summary: ${item.overview}`,
                platform: realPlatform,
                releaseDate: item.release_date || item.first_air_date || '2024-01-01',
                tags: genres.map(gId => getGenreName(gId)),
                language: item.original_language === 'ml' ? 'Malayalam' : (item.original_language === 'en' ? 'English' : item.original_language),
                moods: [primaryMood],
                isIndie: false,
                type: item.media_type === 'tv' ? 'Series' : 'Movie'
            };
        }));

        return results;
    } catch (error) {
        console.error("TMDB Ingestion Error:", error);
        return [];
    }
};

/**
 * Scan/Search TMDB for specific content
 */
export const searchTMDB = async (query) => {
    try {
        if (!query) return [];
        const response = await fetch(`${BASE_URL}/search/multi?api_key=${ACTIVE_TMDB_KEY}&query=${encodeURIComponent(query)}&include_adult=false`);
        const data = await response.json();

        return (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv').map(item => ({
            id: item.id,
            title: item.title || item.name,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
            description: item.overview || 'No description available.',
            releaseDate: item.release_date || item.first_air_date || 'Unknown',
            type: item.media_type === 'tv' ? 'Series' : 'Movie',
            language: item.original_language === 'ml' ? 'Malayalam' : (item.original_language === 'en' ? 'English' : item.original_language),
            tags: (item.genre_ids || []).map(gId => getGenreName(gId)),
            isIndie: false
        })).slice(0, 10); // Limit to top 10
    } catch (error) {
        console.error("TMDB Search Error:", error);
        return [];
    }
};
/**
 * Discover content by genre or category
 */
export const fetchDiscoverContent = async (genreId = '') => {
    try {
        const url = `${BASE_URL}/discover/movie?api_key=${ACTIVE_TMDB_KEY}&with_genres=${genreId}&sort_by=popularity.desc&include_adult=false`;
        const response = await fetch(url);
        const data = await response.json();

        return (data.results || []).map(item => ({
            id: item.id,
            title: item.title,
            poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            banner: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
            description: `AI Summary: ${item.overview}`,
            platform: 'OTT Streaming',
            releaseDate: item.release_date || '2024-01-01',
            tags: (item.genre_ids || []).map(gId => getGenreName(gId)),
            language: item.original_language === 'ml' ? 'Malayalam' : (item.original_language === 'en' ? 'English' : item.original_language),
            moods: [MOOD_MAP[item.genre_ids?.[0]] || 'Bored'],
            isIndie: false,
            type: 'Movie'
        }));
    } catch (error) {
        console.error("TMDB Discover Error:", error);
        return [];
    }
};
