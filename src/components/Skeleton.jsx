import React from 'react';
import './Skeleton.css';

export const SkeletonHero = () => (
    <div className="skeleton-hero">
        <div className="skeleton-hero-content container">
            <div className="skeleton-badge"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
            <div className="skeleton-btns">
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
            </div>
        </div>
        <div className="ai-scan-bar"></div>
    </div>
);

export const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-poster">
            <div className="ai-scan-line"></div>
        </div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
    </div>
);

export const SkeletonSection = () => (
    <div className="skeleton-section container">
        <div className="skeleton-title-sm"></div>
        <div className="skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
    </div>
);
