import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';
import { supabase } from '../services/supabaseClient';
import { getAssetUrl } from '../utils/assetUtils';
import ReviewsSection from '../components/ReviewsSection';

export default function StoryDetails() {
    const { seriesId } = useParams();
    const navigate = useNavigate();
    const { activeTheme, isFavorite, toggleFavorite, userId } = useUserProgress();
    const [activeTab, setActiveTab] = useState('detalles'); // 'detalles' or 'reseñas'
    const [story, setStory] = useState(null);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        setIsFav(isFavorite(seriesId));
    }, [seriesId, isFavorite]);

    useEffect(() => {
        const fetchStory = async () => {
            try {
                // 1. Try Fetch from Supabase
                const { data, error } = await supabase
                    .from('series')
                    .select('*')
                    .eq('id', seriesId)
                    .single();

                if (data && !error) {
                    setStory({
                        ...data,
                        cover_url: getAssetUrl(data.cover_url),
                        genre: 'General', // DB doesnt have genre yet, default
                        duration: data.reading_time || 'Unknown'
                    });
                } else {
                    throw new Error("Story not found");
                }
            } catch (err) {
                console.warn('[StoryDetails] fetchStory error (likely invalid UUID or network), checking legacy/dummies:', err);

                // Fallback for Legacy IDs (e.g. "Batman")
                const dummies = [
                    { id: 'Batman', title: 'Batman: Sombras', description: 'Detective Noir.', cover_url: '/assets/portadas/Batman.png', genre: 'Misterio', duration: '4h' },
                    // ... keep minimal fallback for robustness during transition
                ];
                const found = dummies.find(d => d.id === seriesId);
                if (found) {
                    setStory({ ...found, cover_url: getAssetUrl(found.cover_url) });
                } else {
                    console.error("Story completely not found");
                }
            }
        };
        fetchStory();
    }, [seriesId]);

    const handleRead = () => {
        navigate(`/read/${seriesId}`);
    };

    const onToggleFav = async () => {
        console.log("Toggling favorite for:", seriesId);
        const newState = await toggleFavorite(seriesId);
        console.log("New favorites state:", newState);
        setIsFav(newState);
    };

    // Styles based on theme
    const isModern = activeTheme === 'modern';
    const isManga = activeTheme === 'manga';
    const isMangaDark = activeTheme === 'manga-dark';
    const isComic = activeTheme === 'comic';
    const isComicDark = activeTheme === 'comic-dark';

    // Manga class effect
    useEffect(() => {
        if (isManga || isMangaDark) {
            document.body.classList.add('theme-manga');
        } else {
            document.body.classList.remove('theme-manga');
        }
    }, [isManga, isMangaDark]);

    if (!story) return <div className="p-10 text-xl font-bold font-mono">Cargando...</div>;

    // Dynamic Background logic
    let bgStyle = { background: '#0a0a12', color: 'white' }; // Default Dark

    if (isModern) bgStyle = { background: '#1a0b2e', color: '#e2e8f0' };

    if (isManga) bgStyle = {
        background: '#ffffff',
        color: '#000000', // STRICT BLACK
        backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 1px)',
        backgroundSize: '20px 20px'
    };

    if (isMangaDark) bgStyle = {
        background: '#000000',
        color: '#ffffff',
        backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)',
        backgroundSize: '20px 20px'
    };

    if (isComic) bgStyle = {
        background: '#fdfbf7',
        color: '#000000',
        fontFamily: 'Bangers, cursive',
        letterSpacing: '1px'
    };

    if (isComicDark) bgStyle = {
        background: '#121212',
        color: '#ffffff',
        fontFamily: 'Bangers, cursive',
        letterSpacing: '1px'
    };

    const accentColor = (isModern || isComicDark) ? '#d946ef' : (isManga ? '#000000' : (isMangaDark ? '#ffffff' : (isComic ? '#facc15' : '#8b5cf6')));

    return (
        <div style={{ ...bgStyle, minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header / Back */}
            <div className="absolute top-6 left-6 z-20">
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white font-bold hover:bg-white/20 transition">
                    ← Volver
                </button>
            </div>

            {/* Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${story.cover_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0b2e] via-[#1a0b2e]/60 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end gap-8 max-w-6xl mx-auto">
                    {/* Cover Art Card */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="hidden md:block w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 border-white/10"
                    >
                        <img src={story.cover_url} alt="Cover" className="w-full h-full object-cover" />
                    </motion.div>

                    <div className="flex-1 space-y-4 mb-4">
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-purple-900/50 border border-purple-500/30 rounded text-xs font-bold text-purple-300 uppercase">{story.genre}</span>
                        </div>
                        <h1 className="text-5xl font-black leading-tight tracking-tight">{story.title}</h1>

                        <div className="flex items-center gap-6 text-sm font-bold opacity-80">
                            <span className="flex items-center gap-1">⭐ 4.8 Rating</span>
                            <span className="flex items-center gap-1">🕒 {story.duration || '2h 30m'}</span>
                            <span className="flex items-center gap-1">👤 System32</span>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleRead}
                                className="px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:scale-105 transition flex items-center gap-2"
                                style={{ background: accentColor, color: 'white' }}
                            >
                                ▶ Leer Ahora
                            </button>
                            <button
                                onClick={onToggleFav}
                                className={`p-3 rounded-lg border transition-all ${isFav ? 'bg-red-500/20 border-red-500 text-red-500 scale-110' : 'border-white/20 hover:bg-white/10 text-white'}`}
                            >
                                {isFav ? '❤️' : '🤍'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="max-w-4xl mx-auto px-8 mt-8">
                <div className="flex bg-white/5 p-1 rounded-xl w-fit mb-8">
                    {['detalles', 'reseñas'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg font-bold capitalize transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'detalles' ? (
                        <motion.div
                            key="detalles"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <p className="text-lg leading-relaxed opacity-90">{story.description}</p>

                            <div className="grid grid-cols-3 gap-6">
                                <InfoCard label="LANZAMIENTO" value="2023" />
                                <InfoCard label="IDIOMA" value="Español" />
                                <InfoCard label="FINALES" value="5 Posibles" />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reseñas"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <ReviewsSection seriesId={seriesId} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs opacity-50 font-bold uppercase mb-1">{label}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );
}
