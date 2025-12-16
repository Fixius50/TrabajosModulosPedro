import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserProgress } from '../stores/userProgress';
import ProfileModal from '../components/ProfileModal';
import MarketplaceModal from '../components/MarketplaceModal';
import SettingsModal from '../components/SettingsModal';

export default function MainMenu() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMarketplace, setShowMarketplace] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [syncStatus, setSyncStatus] = useState('cloud');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [activeGenre, setActiveGenre] = useState(null);
    const navigate = useNavigate();

    const { points, stats, activeTheme, activeFont } = useUserProgress();

    useEffect(() => {
        const fetchSeries = async () => {
            // New "File System" Stories (JSON Engine)
            const jsonStories = [
                { id: 'Batman', title: 'Batman: Sombras de Gotham', description: 'Detective Noir en Gotham.', cover_url: '/assets/portadas/Batman.png', genre: 'Misterio/Superhéroes', progress: 0, is_json: true },
                { id: 'DnD', title: 'D&D: La Cripta', description: 'Aventura de Rol Clásica.', cover_url: '/assets/portadas/DnD.png', genre: 'Fantasía', progress: 0, is_json: true },
                { id: 'RickAndMorty', title: 'Rick y Morty: Aventura Rápida', description: 'Sci-Fi Caótico.', cover_url: '/assets/portadas/RickAndMorty.png', genre: 'Sci-Fi', progress: 0, is_json: true },
                { id: 'BoBoBo', title: 'BoBoBo: El Absurdo', description: 'Lucha contra el Imperio Margarita.', cover_url: '/assets/BoBoBo/1.jpg', genre: 'Comedia/Absurdo', progress: 0, is_json: true },
            ];

            try {
                if (!supabase) throw new Error("No client");
                const { data, error } = await supabase.from('series').select('*');

                // Merge JSON stories with DB stories (if any)
                let combined = [...jsonStories];

                if (!error && data?.length > 0) {
                    // Deduplicate by title to prevent "Double Batman" bug from multiple seeds
                    const uniqueDB = Array.from(new Map(data.map(item => [item.title, item])).values());

                    // Filter out DB items that are already in JSON stories (Fuzzy Match)
                    const keywords = ['Batman', 'D&D', 'Rick', 'Dragones', 'BoBoBo'];
                    const filteredDB = uniqueDB.filter(item => {
                        return !keywords.some(keyword => item.title.includes(keyword));
                    });

                    combined = [...combined, ...filteredDB];
                    setSyncStatus('cloud');
                }

                setSeries(combined);

            } catch {
                setSeries([
                    ...jsonStories,
                    { id: '1', title: 'El Bosque Digital (Demo)', description: 'Una aventura cyberpunk interactiva.', cover_url: '/assets/portadas/forest_entrance.jpg', genre: 'Cyberpunk', progress: 45 },
                    { id: '3', title: 'Shadow Realm', description: 'Enfréntate a la oscuridad.', cover_url: '', genre: 'Terror', progress: 80 },
                ]);
                setSyncStatus('local');
            } finally {
                setLoading(false);
            }
        };
        fetchSeries();
    }, []);

    const genres = useMemo(() => [...new Set(series.map(s => s.genre).filter(Boolean))], [series]);

    const filteredSeries = useMemo(() => {
        return series.filter(s => {
            const matchesSearch = !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGenre = !activeGenre || s.genre === activeGenre;
            return matchesSearch && matchesGenre;
        });
    }, [series, searchQuery, activeGenre]);

    const continueReading = series.filter(s => s.progress > 0).sort((a, b) => b.progress - a.progress);

    // Dynamic Theme Styles
    const getThemeStyles = () => {
        switch (activeTheme) {
            case 'comic':
                return {
                    bg: '#fdfbf7', // Paper white/yellowish
                    // Halftone Pattern
                    pattern: `
                        radial-gradient(circle, #3b82f6 2px, transparent 2.5px), 
                        radial-gradient(circle, #ef4444 2px, transparent 2.5px)
                    `,
                    bgSize: '20px 20px, 20px 20px',
                    bgPos: '0 0, 10px 10px', // Offset for overlapping dots
                    text: 'black',
                    cardBorder: '3px solid black',
                    cardRadius: '4px',
                    cardShadow: '8px 8px 0px black',
                    font: 'Bangers, cursive',
                    accent: '#facc15' // Yellow
                };
            case 'manga':
                return {
                    bg: '#f0f0f0',
                    pattern: `repeating-linear-gradient(45deg, #ddd 0px, #ddd 1px, transparent 1px, transparent 10px)`,
                    bgSize: '20px 20px',
                    text: '#111',
                    cardBorder: '2px solid black',
                    cardRadius: '0',
                    cardShadow: 'none'
                };
            case 'sepia':
                return {
                    bg: '#f5e6d3', // Beige
                    pattern: 'none',
                    bgSize: 'auto',
                    text: '#4a3b2a',
                    cardBorder: '1px solid #d4c4a8',
                    cardRadius: '1.5rem',
                    cardShadow: '0 4px 6px -1px rgba(74, 59, 42, 0.1)'
                };
            case 'terminal':
                return {
                    bg: '#0c0c0c',
                    pattern: 'linear-gradient(rgba(0,255,0,0.03) 1px, transparent 1px)',
                    bgSize: '100% 4px',
                    text: '#22c55e',
                    cardBorder: '1px solid #22c55e',
                    cardRadius: '0',
                    cardShadow: '0 0 10px rgba(34, 197, 94, 0.2)'
                };
            case 'modern':
                return {
                    bg: '#1a0b2e', // Lighter Purple Background for visibility
                    // Cyber Grid Pattern - Stronger Visibility
                    pattern: `
                        linear-gradient(rgba(216, 70, 239, 0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(216, 70, 239, 0.2) 1px, transparent 1px),
                        radial-gradient(circle at 50% 50%, rgba(127, 19, 236, 0.4) 0%, transparent 60%)
                    `,
                    bgSize: '50px 50px, 50px 50px, 100% 100%',
                    bgPos: '0 0, 0 0, 0 0',
                    text: '#e2e8f0',
                    cardBorder: '2px solid #d946ef', // Thicker Neon Border
                    cardRadius: '1rem',
                    cardShadow: '0 0 25px rgba(217, 70, 239, 0.4), inset 0 0 10px rgba(217, 70, 239, 0.1)',
                    accent: '#d946ef',
                    font: '"Rajdhani", sans-serif',
                    headerFont: '"Orbitron", sans-serif'
                };
            case 'default':
            default: // Default / Dark
                return {
                    bg: '#0a0a12',
                    pattern: `
                        radial-gradient(circle at 10% 20%, rgba(76, 29, 149, 0.15) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 40%),
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                    `,
                    bgSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
                    text: 'white',
                    cardBorder: '1px solid rgba(255,255,255,0.05)',
                    cardRadius: '1.5rem',
                    cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                };
        }
    };

    const theme = getThemeStyles();

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: theme.bg,
            color: theme.text,
            fontFamily: theme.font || `${activeFont}, system-ui, sans-serif`,
            letterSpacing: activeTheme === 'comic' ? '1px' : 'normal',
            overflowX: 'hidden',
            backgroundImage: theme.pattern,
            backgroundSize: theme.bgSize,
            backgroundPosition: theme.bgPos || '0 0',
            transition: 'background 0.5s ease',
        }}>

            {/* Header */}
            <header style={{
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                background: activeTheme === 'comic' ? 'white' : (activeTheme === 'manga' ? 'white' : (activeTheme === 'modern' ? 'rgba(20, 17, 24, 0.8)' : 'rgba(10, 10, 18, 0.8)')),
                backdropFilter: 'blur(20px)',
                zIndex: 100,
                borderBottom: activeTheme === 'comic' ? '4px solid black' : (activeTheme === 'modern' ? '1px solid #302839' : '1px solid rgba(255,255,255,0.05)'),
                color: activeTheme === 'comic' || activeTheme === 'manga' ? 'black' : 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '2.5rem', height: '2.5rem',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                        borderRadius: '0.8rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', fontWeight: 'bold',
                        boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
                    }}>N</div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>NOVELA</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                        onClick={() => setShowMarketplace(true)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '2rem',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontSize: '1rem' }}>💎</span>
                        <span style={{ fontWeight: 700, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{points}</span>
                    </div>

                    <button onClick={() => setShowProfileMenu(true)} style={{
                        width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                        background: 'url(/assets/portadas/Batman.png) center/cover', // Placeholder avatar
                        border: '2px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer'
                    }} />
                </div>
            </header>

            <main style={{ paddingTop: '6rem', paddingBottom: '4rem', maxWidth: '1400px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

                {/* FEATURED HERO */}
                {!loading && series.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginBottom: '4rem',
                            position: 'relative',
                            height: '500px',
                            borderRadius: '2rem',
                            overflow: 'hidden',
                            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Background Image of Featured Story (Batman usually ID 2 or 3 in seed) */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: `url(${series.find(s => s.title.includes('Batman'))?.cover_url || series[0].cover_url}) center/cover`
                        }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,18,0.95) 20%, rgba(10,10,18,0.4) 60%, transparent 100%)' }} />

                        <div style={{
                            position: 'relative',
                            zIndex: 10,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            padding: '4rem',
                            maxWidth: '600px'
                        }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.4rem 1rem',
                                background: '#ef4444',
                                color: 'white',
                                borderRadius: '0.5rem',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                marginBottom: '1rem',
                                width: 'fit-content'
                            }}>🔥 DESTACADO</span>

                            <h2 style={{
                                fontSize: '3.5rem',
                                fontWeight: 900,
                                lineHeight: 1.1,
                                marginBottom: '1.5rem',
                                textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}>
                                {series.find(s => s.title.includes('Batman'))?.title || series[0].title}
                            </h2>

                            <p style={{
                                fontSize: '1.1rem',
                                color: 'rgba(255,255,255,0.8)',
                                marginBottom: '2rem',
                                lineHeight: 1.6
                            }}>
                                {series.find(s => s.title.includes('Batman'))?.description || series[0].description}
                            </p>

                            <button
                                onClick={() => navigate(`/details/${series.find(s => s.title.includes('Batman'))?.id || series[0].id}`)}
                                style={{
                                    padding: '1rem 2.5rem',
                                    background: 'white',
                                    color: 'black',
                                    fontSize: '1.1rem',
                                    fontWeight: 800,
                                    border: 'none',
                                    borderRadius: '1rem',
                                    cursor: 'pointer',
                                    width: 'fit-content',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 0 30px rgba(255,255,255,0.3)'
                                }}
                            >
                                LEER AHORA ➔
                            </button>
                        </div>
                    </motion.section>
                )}

                {/* FILTERS & SEARCH */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        <button
                            onClick={() => setActiveGenre(null)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '1rem',
                                background: !activeGenre ? 'white' : 'rgba(255,255,255,0.05)',
                                color: !activeGenre ? 'black' : 'white',
                                border: '1px solid rgba(255,255,255,0.1)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            Todos
                        </button>
                        {genres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '1rem',
                                    background: activeGenre === genre ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Buscar historias..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '1rem',
                                padding: '0.6rem 1rem 0.6rem 2.5rem',
                                color: 'white',
                                outline: 'none',
                                width: '250px'
                            }}
                        />
                        <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    </div>
                </div>

                {/* LIBRARY GRID */}
                {!loading && (
                    <motion.div
                        layout
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '2rem'
                        }}
                    >
                        {
                            filteredSeries.map((item) => (
                                <motion.article
                                    key={item.id}
                                    layout
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    onClick={() => navigate(`/details/${item.id}`)}
                                    style={{
                                        background: activeTheme === 'comic' ? 'white' : (activeTheme === 'manga' ? 'white' : 'rgba(255,255,255,0.02)'),
                                        borderRadius: theme.cardRadius,
                                        overflow: 'hidden',
                                        border: theme.cardBorder,
                                        cursor: 'pointer',
                                        boxShadow: theme.cardShadow,
                                        position: 'relative'
                                    }}
                                >
                                    {/* COMIC STYLE SPECIAL: Title inside cover */}
                                    {activeTheme === 'comic' ? (
                                        <>
                                            <div style={{
                                                aspectRatio: '3/4',
                                                background: item.cover_url ? `url(${item.cover_url}) center/cover` : 'black',
                                                position: 'relative',
                                                filter: 'grayscale(0%) contrast(120%)'
                                            }}>
                                                {/* Comic Header Banner */}
                                                <div style={{
                                                    position: 'absolute', top: 0, left: 0, right: 0,
                                                    background: 'black', color: 'white',
                                                    padding: '0.5rem',
                                                    transform: 'skewY(-2deg) translateY(-10px)',
                                                    borderBottom: '4px solid white',
                                                    zIndex: 2,
                                                    paddingTop: '15px'
                                                }}>
                                                    <h3 style={{ margin: 0, fontSize: '1rem', fontStyle: 'italic', fontWeight: 900, textTransform: 'uppercase', textAlign: 'center' }}>{item.title}</h3>
                                                </div>

                                                <div style={{ position: 'absolute', bottom: '10px', right: '0', background: 'yellow', color: 'black', fontWeight: 'bold', padding: '2px 10px', border: '2px solid black', transform: 'rotate(-5deg)' }}>
                                                    {item.genre}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        /* STANDARD / MANGA STYLE */
                                        <>
                                            <div style={{
                                                aspectRatio: '3/4',
                                                background: item.cover_url ? `url(${item.cover_url}) center/cover` : 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                                                position: 'relative',
                                                filter: activeTheme === 'manga' ? 'grayscale(100%) contrast(150%) brightness(1.1)' : 'none'
                                            }}>
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 40%)' }} />

                                                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                                    {/* TIME BADGE */}
                                                    <span style={{ background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                        ⏱️ {item.duration || '2h 30m'}
                                                    </span>
                                                    {item.progress > 0 && <span style={{ background: '#22c55e', color: 'black', fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', fontWeight: 800 }}>{item.progress}%</span>}
                                                </div>
                                            </div>

                                            <div style={{ padding: '1.25rem', color: theme.text }}>
                                                <h3 style={{
                                                    fontWeight: 700,
                                                    fontSize: '1.1rem',
                                                    marginBottom: '0.5rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>{item.title}</h3>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        color: activeTheme === 'manga' ? 'black' : (activeTheme === 'modern' ? '#ab9db9' : '#a78bfa'),
                                                        background: activeTheme === 'manga' ? '#ddd' : (activeTheme === 'modern' ? '#141118' : 'rgba(139, 92, 246, 0.1)'),
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '0.5rem',
                                                        border: activeTheme === 'manga' ? '1px solid black' : (activeTheme === 'modern' ? '1px solid #302839' : 'none')
                                                    }}>
                                                        {item.genre || 'Historia'}
                                                    </span>
                                                    <span style={{ fontSize: '1.2rem', color: theme.text, opacity: 0.5 }}>➔</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.article>
                            ))}

                    </motion.div>
                )}
            </main>

            {/* MODALS */}
            <ProfileModal
                isOpen={showProfileMenu}
                onClose={() => setShowProfileMenu(false)}
                onOpenSettings={() => {
                    setShowProfileMenu(false);
                    setShowSettings(true);
                }}
            />
            <MarketplaceModal isOpen={showMarketplace} onClose={() => setShowMarketplace(false)} />
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div >
    );
}

const iconButtonStyle = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem' };
const menuItemStyle = { width: '100%', padding: '0.7rem 1rem', background: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' };
const chipStyle = { padding: '0.4rem 0.8rem', borderRadius: '1rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, transition: 'all 0.2s' };
