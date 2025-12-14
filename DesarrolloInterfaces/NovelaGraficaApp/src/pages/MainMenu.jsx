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
            try {
                if (!supabase) throw new Error("No client");
                const { data, error } = await supabase.from('series').select('*');
                if (error) throw error;
                if (data?.length > 0) { setSeries(data); setSyncStatus('cloud'); }
                else throw new Error("Empty");
            } catch {
                setSeries([
                    { id: '1', title: 'El Bosque Digital', description: 'Una aventura cyberpunk interactiva.', cover_url: '/assets/images/forest_entrance.jpg', genre: 'Cyberpunk', progress: 45 },
                    { id: '2', title: 'Neon Chronicles', description: 'La ciudad nunca duerme.', cover_url: '', genre: 'Sci-Fi', progress: 0 },
                    { id: '3', title: 'Shadow Realm', description: 'Enfréntate a la oscuridad.', cover_url: '', genre: 'Terror', progress: 80 },
                    { id: '4', title: 'Love in Tokyo', description: 'Un romance inesperado.', cover_url: '', genre: 'Romance', progress: 20 },
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
            background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
            color: 'white',
            fontFamily: `${activeFont}, system-ui, sans-serif`
        }}>

            {/* Header */}
            <header style={{
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                position: 'sticky',
                top: 0,
                background: 'rgba(15,23,42,0.95)',
                backdropFilter: 'blur(12px)',
                zIndex: 100
            }}>
                <h1 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    background: 'linear-gradient(90deg, #fbbf24, #f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    NovelaApp
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Points Button - Opens Marketplace */}
                    <button
                        onClick={() => navigate('/marketplace')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(249,115,22,0.2))',
                            border: '1px solid rgba(251,191,36,0.3)',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontSize: '0.9rem' }}>💰</span>
                        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>{points}</span>
                    </button>

                    {/* Sync Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{
                            width: '0.4rem', height: '0.4rem', borderRadius: '50%',
                            background: syncStatus === 'cloud' ? '#22c55e' : '#ef4444',
                            boxShadow: syncStatus === 'cloud' ? '0 0 6px #22c55e' : '0 0 6px #ef4444'
                        }} />
                    </div>

                    <button onClick={() => setShowSearch(!showSearch)} style={iconButtonStyle}>🔍</button>

                    {/* Avatar */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setShowProfileMenu(!showProfileMenu)} style={{
                            width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            border: 'none', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: '0.8rem'
                        }}>U</button>
                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    style={{
                                        position: 'absolute', top: '3rem', right: 0,
                                        background: 'rgba(30,27,75,0.98)', backdropFilter: 'blur(12px)',
                                        borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)',
                                        minWidth: '12rem', boxShadow: '0 1rem 2rem rgba(0,0,0,0.5)', overflow: 'hidden'
                                    }}>

                                    {/* Stats */}
                                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Tus estadísticas</p>
                                        <p style={{ fontSize: '0.8rem', color: 'white' }}>📊 {stats.totalChoicesMade} decisiones</p>
                                        <p style={{ fontSize: '0.8rem', color: 'white' }}>🏆 {stats.storiesCompleted} completadas</p>
                                    </div>

                                    <button onClick={() => { navigate('/marketplace'); setShowProfileMenu(false); }} style={menuItemStyle}>🛒 Tienda</button>
                                    <button style={menuItemStyle}>⚙️ Ajustes</button>
                                    <button style={{ ...menuItemStyle, color: '#ef4444' }}>🚪 Salir</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Search Bar */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ background: 'rgba(30,27,75,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <div style={{ padding: '0.75rem 1.5rem' }}>
                            <input
                                type="text"
                                placeholder="Buscar por título..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                style={{
                                    width: '100%', padding: '0.75rem 1rem',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem', color: 'white', fontSize: '0.9rem', outline: 'none'
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto' }}>

                {/* Continue Reading */}
                {!loading && continueReading.length > 0 && (
                    <section style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#fbbf24' }}>
                            ⏸️ Continuar Leyendo
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {continueReading.map(item => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ scale: 1.03 }}
                                    onClick={() => navigate(`/read/${item.id}`)}
                                    style={{
                                        minWidth: '14rem', cursor: 'pointer',
                                        background: 'rgba(30,27,75,0.6)', borderRadius: '0.75rem',
                                        overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)'
                                    }}
                                >
                                    <div style={{
                                        height: '6rem',
                                        background: item.cover_url ? `url(${item.cover_url}) center/cover` : 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                                        position: 'relative'
                                    }}>
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,27,75,1), transparent)' }} />
                                    </div>
                                    <div style={{ padding: '0.75rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</h4>
                                        <div style={{ height: '0.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${item.progress}%`, background: 'linear-gradient(90deg, #fbbf24, #f97316)', borderRadius: '1rem' }} />
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem', display: 'block' }}>{item.progress}% completado</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Genre Chips */}
                {!loading && genres.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <button onClick={() => setActiveGenre(null)} style={{ ...chipStyle, background: !activeGenre ? '#8b5cf6' : 'rgba(255,255,255,0.05)', color: !activeGenre ? 'white' : 'rgba(255,255,255,0.7)' }}>Todos</button>
                        {genres.map(genre => (
                            <button key={genre} onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
                                style={{ ...chipStyle, background: activeGenre === genre ? '#8b5cf6' : 'rgba(255,255,255,0.05)', color: activeGenre === genre ? 'white' : 'rgba(255,255,255,0.7)' }}>
                                {genre}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid */}
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' }}>📚 Biblioteca</h3>

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                        <div style={{ width: '2rem', height: '2rem', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    </div>
                )}

                {!loading && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(9rem, 1fr))', gap: '1rem' }}>
                        {series.map((item) => {
                            const isFiltered = !filteredSeries.includes(item);
                            return (
                                <motion.article
                                    key={item.id}
                                    layout
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => !isFiltered && navigate(`/read/${item.id}`)}
                                    style={{
                                        cursor: isFiltered ? 'default' : 'pointer',
                                        opacity: isFiltered ? 0.2 : 1,
                                        transition: 'opacity 0.3s',
                                        background: 'rgba(30,27,75,0.5)',
                                        borderRadius: '0.75rem',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.08)'
                                    }}
                                >
                                    <div style={{
                                        aspectRatio: '2/3',
                                        background: item.cover_url ? `url(${item.cover_url}) center/cover` : 'linear-gradient(135deg, #4c1d95, #7c3aed)',
                                        position: 'relative'
                                    }}>
                                        {item.progress > 0 && (
                                            <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '0.15rem 0.4rem', borderRadius: '0.4rem', fontSize: '0.6rem', fontWeight: 600 }}>{item.progress}%</div>
                                        )}
                                        {!item.cover_url && (
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.3 }}>📖</div>
                                        )}
                                    </div>
                                    <div style={{ padding: '0.6rem' }}>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.2rem', lineHeight: 1.3 }}>{item.title}</h4>
                                        <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem', background: 'rgba(139,92,246,0.2)', borderRadius: '0.25rem', color: '#a78bfa' }}>{item.genre || 'Historia'}</span>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
                )}
            </main>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

const iconButtonStyle = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem' };
const menuItemStyle = { width: '100%', padding: '0.7rem 1rem', background: 'transparent', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem' };
const chipStyle = { padding: '0.4rem 0.8rem', borderRadius: '1rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, transition: 'all 0.2s' };
