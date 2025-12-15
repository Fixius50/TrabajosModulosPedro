import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserProgress } from '../stores/userProgress';

export default function MainMenu() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMarketplace, setShowMarketplace] = useState(false);
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
                { id: 'json:Batman', title: 'Batman: Sombras de Gotham', description: 'Detective Noir en Gotham.', cover_url: '/assets/images/cover_batman.png', genre: 'Misterio/Superhéroes', progress: 0, is_json: true },
                { id: 'json:DnD', title: 'D&D: La Cripta', description: 'Aventura de Rol Clásica.', cover_url: '/assets/images/cover_dnd.png', genre: 'Fantasía', progress: 0, is_json: true },
                { id: 'json:Rick&Morty', title: 'Rick y Morty: Aventura Rápida', description: 'Sci-Fi Caótico.', cover_url: '/assets/images/cover_rick.png', genre: 'Sci-Fi', progress: 0, is_json: true },
            ];

            try {
                if (!supabase) throw new Error("No client");
                const { data, error } = await supabase.from('series').select('*');

                // Merge JSON stories with DB stories (if any)
                let combined = [...jsonStories];

                if (!error && data?.length > 0) {
                    // Deduplicate by title to prevent "Double Batman" bug from multiple seeds
                    const uniqueDB = Array.from(new Map(data.map(item => [item.title, item])).values());
                    combined = [...combined, ...uniqueDB];
                    setSyncStatus('cloud');
                }

                setSeries(combined);

            } catch {
                setSeries([
                    ...jsonStories,
                    { id: '1', title: 'El Bosque Digital (Demo)', description: 'Una aventura cyberpunk interactiva.', cover_url: '/assets/images/forest_entrance.jpg', genre: 'Cyberpunk', progress: 45 },
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

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a12',
            color: 'white',
            fontFamily: `${activeFont}, system-ui, sans-serif`,
            overflowX: 'hidden',
            backgroundImage: `
                radial-gradient(circle at 10% 20%, rgba(76, 29, 149, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 40%),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px'
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
                background: 'rgba(10, 10, 18, 0.8)',
                backdropFilter: 'blur(20px)',
                zIndex: 100,
                borderBottom: '1px solid rgba(255,255,255,0.05)'
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
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '2rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        <span style={{ fontSize: '1rem' }}>💎</span>
                        <span style={{ fontWeight: 700, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{points}</span>
                    </div>

                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} style={{
                        width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                        background: 'url(/assets/images/cover_batman.png) center/cover', // Just a placeholder avatar
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
                                onClick={() => navigate(`/read/${series.find(s => s.title.includes('Batman'))?.id || series[0].id}`)}
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
                        {filteredSeries.map((item) => (
                            <motion.article
                                key={item.id}
                                layout
                                whileHover={{ y: -10, scale: 1.02 }}
                                onClick={() => navigate(`/read/${item.id}`)}
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '1.5rem',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}
                            >
                                {/* Cover Image with Glass Overlay on Hover */}
                                <div style={{
                                    aspectRatio: '3/4',
                                    background: item.cover_url ? `url(${item.cover_url}) center/cover` : 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                                    position: 'relative'
                                }}>
                                    {/* Gradient Overlay at bottom */}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 40%)' }} />

                                    {/* Badges */}
                                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                                        {item.is_premium && <span style={{ background: '#fbbf24', color: 'black', fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', fontWeight: 800 }}>PREMIUM</span>}
                                        {item.progress > 0 && <span style={{ background: '#22c55e', color: 'black', fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', fontWeight: 800 }}>{item.progress}%</span>}
                                    </div>
                                </div>

                                {/* Content Info */}
                                <div style={{ padding: '1.25rem' }}>
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
                                            color: '#a78bfa',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '0.5rem'
                                        }}>
                                            {item.genre || 'Historia'}
                                        </span>
                                        <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.4)' }}>➔</span>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
}

const iconButtonStyle = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem' };
const menuItemStyle = { width: '100%', padding: '0.7rem 1rem', background: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' };
const chipStyle = { padding: '0.4rem 0.8rem', borderRadius: '1rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, transition: 'all 0.2s' };
