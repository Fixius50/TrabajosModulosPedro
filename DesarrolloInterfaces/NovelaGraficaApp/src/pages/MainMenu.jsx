import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function MainMenu() {
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                if (!supabase) throw new Error("No client");

                const { data, error } = await supabase
                    .from('series')
                    .select('id, title, description, cover_url');

                if (error) throw error;
                if (data && data.length > 0) {
                    setSeries(data);
                } else {
                    throw new Error("Empty DB");
                }
            } catch (err) {
                console.warn('MainMenu Fallback:', err.message);
                const mockSeries = [
                    { id: '1', title: 'El Bosque Digital', description: 'Una aventura Cyberpunk.', cover_url: '/assets/images/forest_entrance.jpg', genre: 'Cyberpunk' },
                    { id: '2', title: 'Neon Nights', description: 'La ciudad nunca duerme.', cover_url: '/assets/images/stealth_path.jpg', genre: 'Sci-Fi' },
                    { id: '3', title: 'Glitch World', description: 'La realidad se fragmenta.', cover_url: '/assets/images/glitch_attack.jpg', genre: 'Horror' }
                ];
                setSeries(mockSeries);
            } finally {
                setLoading(false);
            }
        };
        fetchSeries();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white font-sans">

            {/* --- HEADER --- */}
            <header className="p-6 flex justify-between items-center border-b border-white/10">
                <h1 className="text-3xl font-black tracking-tight">
                    <span className="text-yellow-400">NOVELA</span>APP
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm">Bienvenido, Lector</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black">
                        R
                    </div>
                </div>
            </header>

            {/* --- TITLE --- */}
            <section className="text-center py-16 px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-black mb-4"
                >
                    Elige tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">Aventura</span>
                </motion.h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Sumérgete en mundos interactivos donde tus decisiones moldean la historia.
                </p>
            </section>

            {/* LOADING */}
            {loading && (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* --- SERIES SELECTOR (Carousel-Style Cards) --- */}
            {!loading && (
                <section className="px-6 pb-20">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {series.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.15 }}
                                whileHover={{ scale: 1.03, y: -5 }}
                                onClick={() => navigate(`/read/${item.id}`)}
                                className="group cursor-pointer relative rounded-2xl overflow-hidden shadow-2xl bg-slate-800/50 backdrop-blur-sm border border-white/10 hover:border-yellow-500/50 transition-all"
                            >
                                {/* Cover Image */}
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img
                                        src={item.cover_url || 'https://placehold.co/600x400/1e293b/FFF?text=Cover'}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.src = 'https://placehold.co/600x400/1e293b/FFF?text=No+Cover' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="p-6 relative z-10">
                                    <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2 inline-block">
                                        {item.genre || 'Aventura'}
                                    </span>
                                    <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                                        {item.description || 'Una historia épica te espera...'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">5 capítulos</span>
                                        <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold group-hover:bg-yellow-500 group-hover:text-black transition-all">
                                            LEER →
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="text-center py-8 border-t border-white/10 text-slate-500 text-sm">
                NovelaApp © 2024 - Desarrollado con ❤️
            </footer>
        </div>
    );
}
