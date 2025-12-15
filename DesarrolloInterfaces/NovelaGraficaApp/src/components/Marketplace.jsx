import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useUserProgress } from '../stores/userProgress';
import { THEMES, FONTS } from '../styles/themes';
import { useNavigate } from 'react-router-dom';
import './Marketplace.css';

const Marketplace = () => {
    const { stories, myLibrary, userPoints: cloudPoints, buyStory, loading: cloudLoading } = useInventory();
    const { points: localPoints, purchase, isOwned, setActive, activeTheme, activeFont } = useUserProgress();
    const navigate = useNavigate();

    // Hybrid points display (Cloud for stories, Local for themes in this demo - ideally sync them)
    // For now, we assume userPoints from useInventory is the source of truth for display if connected, 
    // but purchase logic for themes uses local store. TO BE UNIFIED.
    // For this MVP, we use localPoints for Themes/Fonts.

    const [activeTab, setActiveTab] = useState('stories');

    const handleThemeBuy = (id, cost) => {
        const result = purchase('themes', id, cost);
        if (!result.success) alert(result.error);
    };

    const handleFontBuy = (id, cost) => {
        const result = purchase('fonts', id, cost);
        if (!result.success) alert(result.error);
    };

    if (cloudLoading) return <div className="loading-screen">CONNECTING TO NEON MARKET...</div>;

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
                    <span className="points-value">{localPoints}</span>
                    <span className="points-label">PTS</span>
                </div>
            </header>

            {/* TABS */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('stories')}
                    className={`px-4 py-2 font-bold transition-all ${activeTab === 'stories' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-500 hover:text-white'}`}
                >
                    HISTORIAS
                </button>
                <button
                    onClick={() => setActiveTab('themes')}
                    className={`px-4 py-2 font-bold transition-all ${activeTab === 'themes' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-white'}`}
                >
                    TEMAS (CSS)
                </button>
                <button
                    onClick={() => setActiveTab('fonts')}
                    className={`px-4 py-2 font-bold transition-all ${activeTab === 'fonts' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-500 hover:text-white'}`}
                >
                    FUENTES
                </button>
            </div>

            <div className="marketplace-grid">
                {/* STORIES TAB */}
                {activeTab === 'stories' && stories.map(story => {
                    const owned = myLibrary.includes(story.id);
                    return (
                        <div key={story.id} className="story-card">
                            <div className="card-image-wrapper">
                                <img src={story.cover_url || 'https://via.placeholder.com/400x200'} alt={story.title} className="card-image" />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-panel), transparent)' }} />
                            </div>
                            <div className="card-content">
                                <h3 className="card-title">{story.title}</h3>
                                <div className="card-actions">
                                    {owned ? (
                                        <button onClick={() => navigate(`/read/${story.id}`)} className="btn-marketplace btn-open">LEER</button>
                                    ) : (
                                        <>
                                            <div className="price-tag">{story.price} PTS</div>
                                            <button onClick={() => buyStory(story)} className="btn-marketplace btn-buy">COMPRAR</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* THEMES TAB */}
                {activeTab === 'themes' && Object.entries(THEMES).map(([key, theme]) => {
                    if (key === 'default') return null; // Skip default
                    const owned = isOwned('themes', key);
                    const equipped = activeTheme === key;
                    const price = 50; // Fixed price for now

                    return (
                        <div key={key} className="story-card" style={{ border: `1px solid ${theme.colors['--primary-blue']}` }}>
                            <div className="h-32 w-full relative overflow-hidden" style={{ background: theme.colors['--bg-dark'] }}>
                                {/* Preview UI */}
                                <div className="absolute inset-4 rounded border" style={{ borderColor: theme.colors['--accent-yellow'], background: theme.colors['--bg-panel'] }}>
                                    <div className="p-2" style={{ color: theme.colors['--text-main'] }}>Preview</div>
                                </div>
                            </div>
                            <div className="card-content">
                                <h3 className="card-title" style={{ color: theme.colors['--text-main'] }}>{theme.name}</h3>
                                <div className="card-actions">
                                    {owned ? (
                                        <button
                                            onClick={() => setActive('theme', key)}
                                            disabled={equipped}
                                            className="btn-marketplace btn-open"
                                            style={{ background: equipped ? 'gray' : theme.colors['--primary-blue'] }}
                                        >
                                            {equipped ? 'USANDO' : 'EQUIPAR'}
                                        </button>
                                    ) : (
                                        <>
                                            <div className="price-tag text-white">{price} PTS</div>
                                            <button onClick={() => handleThemeBuy(key, price)} className="btn-marketplace btn-buy">COMPRAR</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* FONTS TAB */}
                {activeTab === 'fonts' && Object.entries(FONTS).map(([key, stack]) => {
                    if (key === 'Inter') return null;
                    const owned = isOwned('fonts', key);
                    const equipped = activeFont === key;
                    const price = 30;

                    return (
                        <div key={key} className="story-card">
                            <div className="h-24 flex items-center justify-center text-3xl text-white" style={{ fontFamily: stack }}>
                                Abc
                            </div>
                            <div className="card-content">
                                <h3 className="card-title">{key}</h3>
                                <div className="card-actions">
                                    {owned ? (
                                        <button
                                            onClick={() => setActive('font', key)}
                                            disabled={equipped}
                                            className="btn-marketplace btn-open"
                                        >
                                            {equipped ? 'USANDO' : 'EQUIPAR'}
                                        </button>
                                    ) : (
                                        <>
                                            <div className="price-tag">{price} PTS</div>
                                            <button onClick={() => handleFontBuy(key, price)} className="btn-marketplace btn-buy">COMPRAR</button>
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
