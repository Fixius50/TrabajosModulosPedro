import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';
import { supabase } from '../services/supabaseClient';

export default function StoryDetails() {
    const { seriesId } = useParams();
    const navigate = useNavigate();
    const { activeTheme } = useUserProgress();
    const [activeTab, setActiveTab] = useState('detalles'); // 'detalles' or 'reseñas'
    const [story, setStory] = useState(null);

    // Mock Data for visual fidelity
    const reviews = [
        { id: 1, user: 'NeonRider', avatar: '😎', time: 'Hace 2 días', rating: 5, text: '¡Increíble atmósfera! La música y los visuales te atrapan desde el primer segundo.' },
        { id: 2, user: 'Sarah Conner', avatar: '🤖', time: 'Hace 1 semana', rating: 4, text: 'Muy buena historia, aunque algunos finales se sienten apresurados.' }
    ];

    useEffect(() => {
        // Fetch Story Metadata (Mock simulation based on ID, mirroring MainMenu logic)
        // Ideally we'd use a shared Repository or Context.
        const fetchStory = async () => {
            // Quick Hack: Re-using logic from MainMenu is bad practice, but reliable for this sprint.
            // Better: hardcode the demo stories map here or fetch from Supabase if real.
            // For now, let's assume we find it in the "series" table or use a fallback.

            // Fallback Data
            const dummies = [
                { id: '1', title: 'Ecos del Neón', description: 'En una metrópolis donde los recuerdos se compran y venden...', cover_url: '/assets/portadas/forest_entrance.jpg', genre: 'Cyberpunk', duration: '10h' },
                { id: 'Batman', title: 'Batman: Sombras', description: 'Detective Noir en Gotham. Un misterio que acecha en las sombras de la ciudad.', cover_url: '/assets/portadas/Batman.png', genre: 'Misterio', duration: '4h' },
                { id: 'DnD', title: 'D&D: La Cripta', description: 'Adéntrate en la cripta del Rey Exánime. Una aventura de rol clásica.', cover_url: '/assets/portadas/DnD.png', genre: 'Fantasía', duration: '6h' },
                { id: 'RickAndMorty', title: 'Rick y Morty', description: 'Aventura rápida de 20 minutos. Entrar y salir, Morty.', cover_url: '/assets/portadas/RickAndMorty.png', genre: 'Sci-Fi', duration: '20m' },
                { id: 'BoBoBo', title: 'BoBoBo: El Absurdo', description: '¡Por el poder del cabello nasal! Lucha contra el Imperio Margarita.', cover_url: '/assets/BoBoBo/1.jpg', genre: 'Comedia', duration: 'Infinite' },
            ];

            const found = dummies.find(d => d.id === seriesId) || dummies[0];
            setStory(found);
        };
        fetchStory();
    }, [seriesId]);

    const handleRead = () => {
        navigate(`/read/${seriesId}`);
    };

    if (!story) return <div className="text-white p-10">Cargando...</div>;

    // Styles based on theme
    const isModern = activeTheme === 'modern';
    const bgStyle = isModern ? { background: '#1a0b2e', color: '#e2e8f0' } : { background: '#0a0a12', color: 'white' };
    const accentColor = isModern ? '#d946ef' : '#8b5cf6';

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
                            <button className="p-3 rounded-lg border border-white/20 hover:bg-white/10">
                                ❤️
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
                            {reviews.map(review => (
                                <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl">{review.avatar}</div>
                                            <div>
                                                <h4 className="font-bold text-sm">{review.user}</h4>
                                                <div className="text-xs opacity-50">{review.time}</div>
                                            </div>
                                        </div>
                                        <div className="text-yellow-400 text-sm">original star icon here</div>
                                    </div>
                                    <p className="text-sm opacity-80">{review.text}</p>
                                </div>
                            ))}

                            {/* Write Review Input Stub */}
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <h3 className="font-bold mb-4">Escribir Reseña</h3>
                                <textarea className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm" rows={4} placeholder="¿Qué te pareció la historia?"></textarea>
                                <button className="mt-4 w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200">Publicar Reseña</button>
                            </div>
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
