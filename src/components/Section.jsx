import React, { useRef } from 'react';
import MovieCard from './MovieCard';
import './Section.css';
import { ChevronLeft, ChevronRight, ChevronRight as TitleChevron } from 'lucide-react';

const Section = ({ title, movies, onMovieClick, history = [], library = { favorites: [], watchlist: [] }, variant = 'default' }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth * 0.8 : current.offsetWidth * 0.8;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className={`section container ${variant === 'premium' ? 'section-premium' : ''}`}>
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
                <TitleChevron className="title-chevron" size={20} />
            </div>

            <div className="slider-container">
                <button className="slider-btn left mobile-hide" onClick={() => scroll('left')} aria-label="Scroll Left">
                    <ChevronLeft size={24} />
                </button>

                <div className="cards-wrapper hide-scrollbar" ref={scrollRef}>
                    {movies.map(movie => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onMovieClick={onMovieClick}
                            history={history}
                            library={library}
                        />
                    ))}
                </div>

                <button className="slider-btn right mobile-hide" onClick={() => scroll('right')} aria-label="Scroll Right">
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default Section;
