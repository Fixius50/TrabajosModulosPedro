import React from 'react';
import { useInventory } from '../hooks/useInventory';
import { useNavigate } from 'react-router-dom';
import './Marketplace.css';

const Marketplace = () => {
    const { stories, myLibrary, userPoints, buyStory, loading } = useInventory();
    const navigate = useNavigate();

    if (loading) return <div className="loading-screen">CONNECTING TO NEON NET...</div>;

    return (
        <div className="marketplace-container">
            <header className="marketplace-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            marginRight: '1rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        ←
                    </button>
                    <h1 className="marketplace-title">MARKETPLACE</h1>
                </div>

                <div className="points-display">
                    <span style={{ fontSize: '1.2rem' }}>💎</span>
                    <span className="points-value">{userPoints}</span>
                    <span className="points-label">PTS</span>
                </div>
            </header>

            <div className="marketplace-grid">
                {stories.map(story => {
                    const isOwned = myLibrary.includes(story.id);
                    const isAffordable = userPoints >= story.price;

                    return (
                        <div key={story.id} className="story-card">
                            <div className="card-image-wrapper">
                                <img
                                    src={story.cover_url || 'https://via.placeholder.com/400x200'}
                                    alt={story.title}
                                    className="card-image"
                                />
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to top, var(--color-bg-darker), transparent)'
                                }} />
                            </div>

                            <div className="card-content">
                                <div className="card-header">
                                    <h3 className="card-title">{story.title}</h3>
                                    {story.is_premium && <span className="premium-badge">PREMIUM</span>}
                                </div>

                                <p className="card-description">
                                    {story.description}
                                </p>

                                <div className="card-actions">
                                    {isOwned ? (
                                        <button
                                            onClick={() => navigate(`/read/${story.id}`)}
                                            className="btn-marketplace btn-open"
                                        >
                                            ABRIR
                                        </button>
                                    ) : (
                                        <>
                                            <div className="price-tag">{story.price} PTS</div>
                                            <button
                                                onClick={() => buyStory(story)}
                                                disabled={!isAffordable}
                                                className="btn-marketplace btn-buy"
                                            >
                                                COMPRAR
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Marketplace;
