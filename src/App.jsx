import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import { Sparkles } from 'lucide-react';

import Hero from './components/Hero';
import Section from './components/Section';
import Footer from './components/Footer';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import VideoPlayer from './components/VideoPlayer';
import DailyChannel from './components/DailyChannel';
import CreatorSpace from './components/CreatorSpace';
import MovieCard from './components/MovieCard';
import MoodVibePicker from './components/MoodVibePicker';
import SplineBackground from './components/SplineBackground';
import Concierge from './components/Concierge';
import ProfileModal from './components/ProfileModal';
import MovieDetails from './components/MovieDetails';
import PrivacyModal from './components/PrivacyModal';
import { EmptySearch } from './components/EmptyStates';
import { SkeletonHero, SkeletonSection } from './components/Skeleton';
import { CATEGORIES } from './data/mockData';
import { getAllContent, getWatchHistory, getUserLibrary, getUserProfile } from './services/movieService';
import { getAIPriorityCategories, trackInteraction, getMoviesByMood } from './services/aiService';

function App() {
  const [movies, setMovies] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);

  // Modals / Overlays
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [aiRecommendedIds, setAiRecommendedIds] = useState([]);
  const [library, setLibrary] = useState({ favorites: [], watchlist: [] });
  const [profile, setProfile] = useState(null);

  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        const [allMovies, userHistory, userLibrary, userProfile] = await Promise.all([
          getAllContent(),
          getWatchHistory(),
          getUserLibrary(),
          getUserProfile()
        ]);
        setMovies(allMovies);
        setHistory(userHistory);
        setLibrary(userLibrary);
        setProfile(userProfile);
      } catch (err) {
        console.error("Critical Init Error:", err);
        setError("Our cinematic servers are experiencing high turbulence. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAuthOpen(false);
        getWatchHistory().then(setHistory);
      } else {
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Search Debouncing (Rate-limit Protection)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const heroMovie = useMemo(() => {
    if (movies.length === 0) return null;
    // Prefer showing the newest added movies in Hero
    const showcaseMovies = movies.filter(m => m.id >= 19);
    if (showcaseMovies.length > 0) {
      return showcaseMovies[Math.floor(Math.random() * showcaseMovies.length)];
    }
    return movies[Math.floor(Math.random() * movies.length)];
  }, [movies]);

  const personalizedCategories = useMemo(() => {
    return getAIPriorityCategories(history, CATEGORIES);
  }, [history]);

  const processedMovies = useMemo(() => {
    let result = movies;
    const searchLow = debouncedSearch.toLowerCase().trim();

    // Broad keyword detection to show "all" content
    const isBroadSearch = ["movies", "all movies", "all", "films", "full list"].includes(searchLow);

    if (debouncedSearch && !isBroadSearch) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(searchLow) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(searchLow))) ||
        (m.language && m.language.toLowerCase().includes(searchLow))
      );
    }

    if (selectedMood) {
      result = getMoviesByMood(result, selectedMood);
    }
    return result;
  }, [debouncedSearch, selectedMood, movies]);

  const handleMovieClick = async (movie) => {
    trackInteraction(movie);
    setSelectedMovieDetails(movie);
  };

  const handleWatchNow = async (movie) => {
    // Pattern Tracking
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

    const entry = {
      movie_id: movie.id,
      movie_type: movie.isIndie ? 'indie' : 'ott',
      genre: movie.tags?.[0],
      language: movie.language,
      mood_at_watch: selectedMood,
      time_of_day: timeOfDay
    };

    if (user) {
      await supabase.from('watch_history').insert([{ ...entry, user_id: user.id }]);
    }

    setHistory(prev => [entry, ...prev]);
    setSelectedMovieDetails(null);

    if (movie.isIndie) {
      setActiveVideo(movie);
    } else {
      const confirmRedirect = window.confirm(`This title is available on ${movie.platform}. Redirect to official site?`);
      if (confirmRedirect) {
        window.open(`https://www.google.com/search?q=watch+${movie.title}+on+${movie.platform}`, '_blank');
      }
    }
  };

  const handleLibraryAction = async (movie, type) => {
    try {
      const { toggleLibraryItem } = await import('./services/movieService');
      await toggleLibraryItem(movie.id, movie.isIndie ? 'indie' : 'ott', type);

      // Update local state
      const [userLibrary] = await Promise.all([getUserLibrary()]);
      setLibrary(userLibrary);
    } catch (err) {
      setIsAuthOpen(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getMoviesForCategory = (catId) => {
    if (catId === 'showcase') return movies.filter(m => m.id >= 19).reverse();
    if (catId === 'trending') return movies.slice(0, 8);
    if (catId === 'indie') return movies.filter(m => m.isIndie);
    if (catId === 'malayalam') return movies.filter(m => m.language === 'Malayalam' || m.tags?.includes('Malayalam'));
    if (catId === 'hindi') return movies.filter(m => m.language === 'Hindi' || m.tags?.includes('Hindi'));
    if (catId === 'series') return movies.filter(m => m.type === 'Series');
    return [...movies].sort(() => 0.5 - Math.random()).slice(0, 6);
  };

  if (error) {
    return (
      <div className="app flex-center" style={{ height: '100vh', flexDirection: 'column' }}>
        <h2 className="gradient-text">Connection Interference</h2>
        <p style={{ color: '#444' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-save-profile" style={{ width: 'auto', marginTop: '2rem' }}>Recalibrate Systems</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app loading-state">
        <Navbar
          onSearch={() => { }}
          onUploadClick={() => { }}
          onAuthClick={() => { }}
          user={null}
        />
        <SkeletonHero />
        <div style={{ marginTop: '-100px', position: 'relative', zIndex: 10 }}>
          <SkeletonSection />
          <SkeletonSection />
        </div>
        <Concierge
          movies={[]}
          onSelectMovie={() => { }}
          onRecommendations={() => { }}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <SplineBackground />

      <Navbar
        onSearch={setSearchTerm}
        onUploadClick={() => setIsUploadOpen(true)}
        onAuthClick={() => setIsAuthOpen(true)}
        user={user}
        onSignOut={handleSignOut}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      {!searchTerm && !selectedMood && <Hero movie={heroMovie} onMovieClick={handleMovieClick} />}

      <div className="content-container" style={{
        marginTop: (searchTerm || selectedMood) ? '120px' : '-100px',
        position: 'relative',
        zIndex: 10
      }}>

        {user && !searchTerm && !selectedMood && (
          <div className="container welcome-badge">
            <p>Signed in as <span className="gradient-text" style={{ fontWeight: 700 }}>{user.email}</span>. AI Discovery active.</p>
          </div>
        )}

        {/* DAILY RESONANCE (Time-based AI Highlight) */}
        {!searchTerm && !selectedMood && (
          <div className="daily-resonance-wrapper container">
            <div className="resonance-tag">
              <Sparkles size={14} />
              {new Date().getHours() < 12 ? 'MORNING FOCUS' : new Date().getHours() < 17 ? 'AFTERNOON PULSE' : 'NIGHT COMFORT'}
            </div>
            <h2 className="resonance-title">Today's AI Highlight</h2>
            <Section
              title=""
              movies={movies.slice(10, 16)}
              onMovieClick={handleMovieClick}
              history={history}
              library={library}
            />
          </div>
        )}

        {/* AI RECOMMENDED SECTION (Injected by Concierge) */}
        {aiRecommendedIds.length > 0 && !searchTerm && !selectedMood && (
          <Section
            title="AI Intelligent Picks"
            movies={movies.filter(m => aiRecommendedIds.includes(m.id))}
            onMovieClick={handleMovieClick}
            history={history}
            library={library}
          />
        )}

        {!searchTerm && (
          <MoodVibePicker activeMood={selectedMood} onMoodSelect={setSelectedMood} />
        )}

        {!searchTerm && !selectedMood && (
          <DailyChannel
            user={user}
            history={history}
            movies={movies}
            onMovieClick={handleMovieClick}
          />
        )}

        {(searchTerm || selectedMood) ? (
          <div className="container search-results">
            <h2 style={{ marginBottom: '2rem' }}>
              {selectedMood ? `AI Mood: ${selectedMood}` : `Results for "${searchTerm}"`}
            </h2>
            <div className="movie-grid">
              {processedMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onMovieClick={handleMovieClick}
                  history={history}
                  library={library}
                />
              ))}
              {processedMovies.length === 0 && <EmptySearch term={debouncedSearch || selectedMood} />}
            </div>
          </div>
        ) : (
          personalizedCategories.map(cat => (
            <Section
              key={cat.id}
              title={cat.title}
              movies={getMoviesForCategory(cat.id)}
              onMovieClick={handleMovieClick}
              history={history}
              library={library}
              variant={cat.id === 'showcase' ? 'premium' : 'default'}
            />
          ))
        )}
      </div>

      <Footer onAboutClick={() => setIsCreatorOpen(true)} onPrivacyClick={() => setIsPrivacyOpen(true)} />

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CreatorSpace isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* GPT-4 Assistant */}
      <Concierge
        movies={movies}
        onSelectMovie={handleMovieClick}
        onRecommendations={(ids) => setAiRecommendedIds(ids)}
      />

      {selectedMovieDetails && (
        <MovieDetails
          movie={selectedMovieDetails}
          onClose={() => setSelectedMovieDetails(null)}
          onWatch={handleWatchNow}
          similarMovies={movies.filter(m => m.id !== selectedMovieDetails.id)}
          isFavorite={library.favorites?.some(i => i.movie_id === selectedMovieDetails.id.toString())}
          isWatchlist={library.watchlist?.some(i => i.movie_id === selectedMovieDetails.id.toString())}
          onAction={(type) => handleLibraryAction(selectedMovieDetails, type)}
        />
      )}

      {activeVideo && (
        <VideoPlayer movie={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

    </div>
  );
}

export default App;
