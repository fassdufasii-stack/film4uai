import { supabase } from '../lib/supabaseClient'
import { MOVIES as MOCK_MOVIES } from '../data/mockData'
import { fetchTrendingOTT, fetchDiscoverContent } from './tmdbService'

/**
 * Normalization Helper
 */
const normalizeMovie = (m) => ({
    ...m,
    releaseDate: m.release_date || m.releaseDate,
    streamUrl: m.stream_url || m.streamUrl,
    creatorId: m.creator_id || m.creatorId,
    officialUrl: m.official_url || m.officialUrl,
});

/**
 * Unified Movie Service for Film4u AI
 */
export const getAllContent = async () => {
    let combinedData = [];

    // 1. Fetch live TMDB Data (Trending + Sci-Fi + Action)
    try {
        const liveTrending = await fetchTrendingOTT();
        const sciFi = await fetchDiscoverContent('878'); // Sci-Fi
        const action = await fetchDiscoverContent('28'); // Action

        // Remove duplicates by ID
        const allTmdb = [...liveTrending, ...sciFi, ...action];
        const uniqueTmdb = Array.from(new Map(allTmdb.map(m => [m.id, m])).values());

        combinedData = [...uniqueTmdb];
    } catch (e) {
        console.warn("TMDB Fetch Failed, using Fallback:", e);
    }

    // 2. Fetch Indie Movies (Supabase)
    try {
        const { data: indieData, error } = await supabase.from('movies_indie').select('*');
        if (!error && indieData) {
            combinedData = [...combinedData, ...indieData.map(m => normalizeMovie({ ...m, isIndie: true }))];
        }
    } catch (e) {
        console.warn("Indie Fetch Failed:", e);
    }

    // 3. Fetch Custom OTT (Supabase)
    try {
        const { data: customOttData, error } = await supabase.from('movies_ott').select('*');
        if (!error && customOttData) {
            combinedData = [...combinedData, ...customOttData.map(m => normalizeMovie({ ...m, isIndie: false }))];
        }
    } catch (e) {
        console.warn("Custom OTT Fetch Failed:", e);
    }

    if (combinedData.length === 0) return MOCK_MOVIES;
    return combinedData;
}

/**
 * USER LIBRARY (Favorites / Watchlist)
 */
export const toggleLibraryItem = async (movieId, movieType, listType) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Auth required");

    // Check if exists
    const { data: existing } = await supabase
        .from('user_library')
        .select('*')
        .match({ user_id: user.id, movie_id: movieId, movie_type: movieType, list_type: listType })
        .single();

    if (existing) {
        return await supabase.from('user_library').delete().eq('id', existing.id);
    } else {
        return await supabase.from('user_library').insert([{
            user_id: user.id,
            movie_id: movieId,
            movie_type: movieType,
            list_type: listType
        }]);
    }
}

export const getUserLibrary = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { favorites: [], watchlist: [] };

    const { data } = await supabase
        .from('user_library')
        .select('*')
        .eq('user_id', user.id);

    return {
        favorites: data?.filter(i => i.list_type === 'favorite') || [],
        watchlist: data?.filter(i => i.list_type === 'watchlist') || []
    };
}

/**
 * PROFILE & HISTORY
 */
export const getUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error && error.code === 'PGRST116') {
        // Profile not found, create one
        const newProfile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            preferred_genres: [],
            preferred_moods: [],
            sensitivity_toggles: { violence: false, sadness: false }
        };
        const { data: created } = await supabase.from('profiles').insert([newProfile]).select().single();
        return created;
    }
    return data;
}

export const updateProfile = async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    return await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
        .select();
}

export const updateAvatar = async (file) => {
    const publicUrl = await uploadFile('avatars', file);
    return await updateProfile({ avatar_url: publicUrl });
}

export const getWatchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false });
    return data || [];
}

/**
 * STANDARD UPLOAD UTILITY
 * For posters, avatars, and smaller assets
 */
export const uploadFile = async (bucket, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
}

/**
 * HIGH-CAPACITY UPLOAD UTILITY
 * Supports Resumable Uploads for Large GB Movie Files
 */
export const uploadLargeFile = async (bucket, file, onProgress) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // For Large Files (>50MB), we use Supabase Resumable (TUS)
    // Note: Standard 'upload' has a 50MB default limit on Supabase Free Tier
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            // Enable resumable logic for large files
            duplex: 'half'
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
}

export const uploadIndieMovie = async (movieData, videoFile, posterFile) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required to upload.");

    let videoUrl = null;
    let posterUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80";

    try {
        // Use Large File logic for videos - Priority Fix
        if (videoFile) {
            console.log("Starting large video upload...");
            videoUrl = await uploadLargeFile('videos', videoFile);
        }

        if (posterFile) {
            posterUrl = await uploadFile('posters', posterFile);
        }

        const dbData = {
            title: movieData.title,
            description: movieData.description,
            poster: posterUrl,
            banner: posterUrl,
            tags: movieData.tags,
            language: movieData.language,
            release_date: movieData.releaseDate,
            stream_url: videoUrl,
            is_indie: true,
            creator_id: user.id
        };

        const { data, error } = await supabase
            .from('movies_indie')
            .insert([dbData])
            .select();

        if (error) throw error;
        return data;

    } catch (err) {
        console.error("Upload Logic Failed:", err);
        throw err;
    }
}
