import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserProgress } from '../stores/userProgress';
import MarketplaceModal from '../components/MarketplaceModal';
import SettingsModal from '../components/SettingsModal';
import { getAssetUrl } from '../utils/assetUtils';

export default function MainMenu() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [showProfileMenu, setShowProfileMenu] = useState(false); // Removed
    const [showMarketplace, setShowMarketplace] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [syncStatus, setSyncStatus] = useState('cloud');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [activeGenre, setActiveGenre] = useState(null);
    const navigate = useNavigate();



    useEffect(() => {
        const fetchSeries = async () => {
            try {
                if (!supabase) throw new Error("No client");

                // Timeout Promise (Increased to 5s for slower connections/cold starts)
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));

                // Fetch Promise
                const fetchPromise = supabase.from('series').select('*');

                const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

                if (!error && data?.length > 0) {
                    // Deduplicate by title to prevent "Double Batman" bug from multiple seeds
                    const uniqueDB = Array.from(new Map(data.map(item => [item.title, item])).values());

                    // Transform DB URLs too just in case
                    const processedDB = uniqueDB.map(s => ({ ...s, cover_url: getAssetUrl(s.cover_url) }));

                    setSeries(processedDB);
                    setSyncStatus('cloud');
                } else {
                    setSeries([]);
                }

            } catch (err) {
                console.error("MainMenu fetch failed:", err);
                // Fallback to local JSON items so the user isn't left with a blank screen
                setSyncStatus('error');
                setSeries([]);
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

    // 4. Remote Config Logic
    const { points, stats, activeTheme, activeFont, getThemeStyles: getRemoteStyles, profile } = useUserProgress();

    // Función centralizada de estilos según el tema
    const getThemeStyles = () => {
        // A. REMOTE (Database)
        const remote = getRemoteStyles(activeTheme);
        if (remote) return remote;

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
                    text: '#000000', // STRICT BLACK
                    cardBorder: '3px solid black',
                    cardRadius: '4px',
                    cardShadow: '8px 8px 0px black',
                    font: 'Bangers, cursive',
                    accent: '#facc15' // Yellow
                };
            case 'comic-dark': // INVERSE COMIC
                return {
                    bg: '#121212', // Dark Grey
                    pattern: `
                        radial-gradient(circle, #1e3a8a 2px, transparent 2.5px), 
                        radial-gradient(circle, #7f1d1d 2px, transparent 2.5px)
                    `,
                    bgSize: '20px 20px, 20px 20px',
                    bgPos: '0 0, 10px 10px',
                    text: '#ffffff',
                    cardBorder: '3px solid #facc15', // Yellow border for contrast
                    cardRadius: '4px',
                    cardShadow: '8px 8px 0px #facc15',
                    font: 'Bangers, cursive',
                    accent: '#facc15'
                };
            case 'manga':
                return {
                    bg: '#ffffff',
                    pattern: `repeating-linear-gradient(45deg, #eee 0px, #eee 1px, transparent 1px, transparent 10px)`,
                    bgSize: '20px 20px',
                    text: '#000000', // STRICT BLACK
                    cardBorder: '2px solid black',
                    cardRadius: '0',
                    cardShadow: 'none'
                };
            case 'manga-dark': // INVERSE MANGA
                return {
                    bg: '#000000',
                    pattern: `repeating-linear-gradient(45deg, #333 0px, #333 1px, transparent 1px, transparent 10px)`,
                    bgSize: '20px 20px',
                    text: '#ffffff',
                    cardBorder: '2px solid white',
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

    // Auth Check for UI
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsGuest(!session);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsGuest(!session);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleMarketplaceClick = () => {
        if (isGuest) {
            if (confirm("Debes iniciar sesión para acceder al Mercado Negro. ¿Ir al Login?")) {
                navigate('/login');
            }
        } else {
            setShowMarketplace(true);
        }
    };

    const theme = getThemeStyles() || {}; // Safety check

    if (!series || !Array.isArray(series)) {
        console.error("Series data corrupted:", series);
        return <div>Error loading series.</div>;
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: theme.bg || '#000',
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
                background: activeTheme === 'comic' ? 'white' : (activeTheme === 'manga' ? 'white' : (['modern', 'terminal', 'manga-dark', 'comic-dark'].includes(activeTheme) ? 'rgba(0, 0, 0, 0.8)' : 'rgba(10, 10, 18, 0.8)')),
                backdropFilter: 'blur(20px)',
                zIndex: 100,
                borderBottom: activeTheme === 'comic' ? '4px solid black' : (activeTheme === 'comic-dark' ? '4px solid #facc15' : (activeTheme === 'manga' ? '1px solid #ccc' : (activeTheme === 'manga-dark' ? '1px solid #333' : '1px solid rgba(255,255,255,0.05)'))),
                color: (activeTheme === 'comic' || activeTheme === 'manga') ? 'black' : 'white'
            }}>
                {/* GBC Intro Title Tribute */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* "GAME BOY" Part -> BIBLIOTECA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        style={{
                            fontFamily: '"Arial Black", "Arial Bold", Gadget, sans-serif',
                            fontStyle: 'italic',
                            fontWeight: 900,
                            fontSize: '1.8rem',
                            color: activeTheme === 'comic-dark' ? '#facc15' : (activeTheme === 'manga-dark' ? 'white' : '#1f2937'), // Dark Gray usually, adaptable
                            letterSpacing: '-1px',
                            lineHeight: 0.8,
                            textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                        }}
                    >
                        BIBLIOTECA
                    </motion.div>

                    {/* "Nintendo/COLOR" Part -> DEL FRIKISMO */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1, type: "spring" }}
                        style={{
                            display: 'flex',
                            gap: '2px',
                            fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif', // Playful font for "COLOR" vibe
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            marginTop: '0.2rem'
                        }}
                    >
                        {/* Rainbow Colors GBC Style: Purple, Red, Green, Yellow, Blue */}
                        {['D', 'E', 'L', ' ', 'F', 'R', 'I', 'K', 'I', 'S', 'M', 'O'].map((char, i) => {
                            const colors = ['#8b5cf6', '#ef4444', '#22c55e', '#eab308', '#3b82f6']; // Purple, Red, Green, Yellow, Blue
                            const color = char === ' ' ? 'transparent' : colors[i % colors.length];
                            return (
                                <span key={i} style={{ color }}>{char}</span>
                            );
                        })}
                    </motion.div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                        onClick={handleMarketplaceClick}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '2rem',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            cursor: 'pointer',
                            opacity: isGuest ? 0.5 : 1
                        }}
                        title={isGuest ? "Inicia sesión para canjear" : "Mercado"}
                    >
                        <span style={{ fontSize: '1rem' }}>{isGuest ? '🔒' : '💎'}</span>
                        <span style={{ fontWeight: 700, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {isGuest ? 'GUEST' : points}
                        </span>
                    </div>

                    {isGuest ? (
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '0.5rem 1.2rem',
                                background: '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)'
                            }}
                        >
                            LOGIN
                        </button>
                    ) : (
                        <button onClick={() => setShowSettings(true)} style={{
                            width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                            background: `url(${profile?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Guest'}) center/cover`,
                            border: '2px solid rgba(255,255,255,0.2)',
                            backgroundColor: 'black', // Fallback color
                            cursor: 'pointer'
                        }} />
                    )}
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
                                                backgroundImage: item.cover_url ? `url('${item.cover_url}')` : 'none',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundColor: 'black',
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
                                    ) : activeTheme === 'manga' ? (
                                        /* MANGA STYLE SPECIAL */
                                        <>
                                            <div style={{
                                                aspectRatio: '3/4',
                                                backgroundImage: item.cover_url ? `url('${item.cover_url}')` : 'none',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundColor: 'white',
                                                position: 'relative',
                                                filter: 'grayscale(100%) contrast(120%) brightness(1.1)',
                                                border: '2px solid black'
                                            }}>
                                                {/* Japanese Numbering/Decoration */}
                                                <div style={{
                                                    position: 'absolute', top: '10px', right: '10px',
                                                    writingMode: 'vertical-rl',
                                                    fontSize: '2.5rem',
                                                    fontWeight: 900,
                                                    color: 'black',
                                                    textShadow: '2px 2px 0px white',
                                                    lineHeight: 1,
                                                    fontFamily: '"Noto Serif JP", serif',
                                                    zIndex: 2
                                                }}>
                                                    {['壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖', '拾'][filteredSeries.indexOf(item) % 10]}
                                                </div>

                                                {/* Bottom Info Overlay */}
                                                <div style={{
                                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                                    padding: '1rem',
                                                    background: 'linear-gradient(to top, white 10%, transparent)',
                                                    display: 'flex', flexDirection: 'col', alignItems: 'flex-start'
                                                }}>
                                                    <div style={{
                                                        background: 'black', color: 'white',
                                                        padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 'bold',
                                                        marginBottom: '0.2rem', transform: 'skewX(-10deg)'
                                                    }}>
                                                        {item.genre?.toUpperCase()}
                                                    </div>
                                                    <h3 style={{
                                                        fontSize: '1.2rem', fontWeight: 900,
                                                        color: 'black', margin: 0,
                                                        lineHeight: 1, textTransform: 'uppercase',
                                                        background: 'white', padding: '0 5px'
                                                    }}>
                                                        {item.title}
                                                    </h3>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        /* STANDARD STYLE (Modern, Dark, etc) */
                                        <>
                                            <div style={{
                                                aspectRatio: '3/4',
                                                backgroundImage: item.cover_url ? `url('${item.cover_url}')` : 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                position: 'relative',
                                                filter: activeTheme === 'manga' ? 'grayscale(100%) contrast(150%) brightness(1.1)' : 'none'
                                            }}>
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 40%)' }} />

                                                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                                    {/* TIME BADGE */}
                                                    <span style={{ background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                        ⏱️ {item.reading_time || (Math.floor(item.title.length * 3.5) + 'm')}
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
            {/* ProfileModal removed */}
            <MarketplaceModal isOpen={showMarketplace} onClose={() => setShowMarketplace(false)} />
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div >
    );
}

const iconButtonStyle = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem' };
const menuItemStyle = { width: '100%', padding: '0.7rem 1rem', background: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' };
const chipStyle = { padding: '0.4rem 0.8rem', borderRadius: '1rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, transition: 'all 0.2s' };
