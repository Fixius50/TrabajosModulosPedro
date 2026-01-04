import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { getAssetUrl } from '../utils/assetUtils';

export default function MyGamesView() {
    const { activeTheme, visitedNodes, favorites, getThemeStyles } = useUserProgress();
    const navigate = useNavigate();
    const [libraryItems, setLibraryItems] = useState({ continueReading: [], favs: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLibraryData = async () => {
            setLoading(true);
            try {
                const { data: allSeries, error } = await supabase.from('series').select('*');
                if (error) throw error;

                // Process URLs
                const processedSeries = allSeries.map(s => ({ ...s, cover_url: getAssetUrl(s.cover_url) }));

                // Filter
                const continueReading = processedSeries.filter(s => {
                    const nodes = visitedNodes[s.id];
                    return nodes && nodes.size > 0;
                });

                const favs = processedSeries.filter(s => favorites.has(s.id));

                setLibraryItems({ continueReading, favs });
            } catch (err) {
                console.error("Library fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLibraryData();
    }, [visitedNodes, favorites]);


    const theme = getThemeStyles(activeTheme) || {
        bg: '#0a0a12',
        text: 'white',
        cardBorder: '1px solid rgba(255,255,255,0.1)',
        cardBg: 'rgba(255,255,255,0.05)'
    };

    // Helper to get card styles (re-using MainMenu logic or similar simple card)
    const cardStyle = {
        borderRadius: theme.cardRadius || '1rem',
        border: theme.cardBorder,
        background: theme.cardBg || 'rgba(0,0,0,0.5)',
        boxShadow: theme.cardShadow || 'none',
        overflow: 'hidden',
        cursor: 'pointer'
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: theme.bg || '#0a0a12',
            color: theme.text || 'white',
            padding: '2rem',
            paddingBottom: '120px',
            fontFamily: theme.font
        }}>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                <span>📚</span> Biblioteca
            </h1>
            <p className="opacity-60 mb-8">Tu colección personal de historias y favoritos.</p>

            {loading ? (
                <div className="flex justify-center p-12">Cargando biblioteca...</div>
            ) : (
                <div className="space-y-12 max-w-6xl mx-auto">

                    {/* CONTINUE READING */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span>🕒</span> Continuar Leyendo
                        </h2>
                        {libraryItems.continueReading.length === 0 ? (
                            <div className="opacity-50 italic">No tienes lecturas activas. ¡Empieza una historia!</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {libraryItems.continueReading.map(series => (
                                    <motion.div
                                        key={series.id}
                                        whileHover={{ y: -5 }}
                                        onClick={() => navigate(`/details/${series.id}`)}
                                        style={cardStyle}
                                        className="relative aspect-[3/4]"
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${series.cover_url})` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <h3 className="font-bold text-white text-lg leading-tight">{series.title}</h3>
                                            <div className="text-xs text-gray-300 mt-1">Progreso: {visitedNodes[series.id]?.size || 0} nodos</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* FAVORITES */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span>❤️</span> Favoritos
                        </h2>
                        {libraryItems.favs.length === 0 ? (
                            <div className="opacity-50 italic">No tienes favoritos aún.</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {libraryItems.favs.map(series => (
                                    <motion.div
                                        key={series.id}
                                        whileHover={{ y: -5 }}
                                        onClick={() => navigate(`/details/${series.id}`)}
                                        style={cardStyle}
                                        className="relative aspect-[3/4]"
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${series.cover_url})` }}
                                        />
                                        <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                                            ❤️
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <h3 className="font-bold text-white text-lg leading-tight">{series.title}</h3>
                                            <div className="text-xs opacity-75 mt-1">{series.genre}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
