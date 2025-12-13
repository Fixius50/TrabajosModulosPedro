import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';
import { useStoryEngine } from '../hooks/useStoryEngine';
import { Typewriter } from '../components/Typewriter';

export default function StoryReader() {
    const { seriesId } = useParams();
    const navigate = useNavigate();
    const { currentNode, loading, error, goToNode } = useStoryEngine('start');

    const [userPrefs, setUserPrefs] = useState({
        highContrast: false,
        fontFamily: 'Inter, sans-serif',
        textColor: '#ffffff'
    });

    const [choicesVisible, setChoicesVisible] = useState(false);

    useEffect(() => {
        setChoicesVisible(false);
    }, [currentNode]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h1 className="text-2xl font-bold text-white/80 animate-pulse">
                        Cargando Historia...
                    </h1>
                </div>
            </div>
        );
    }

    if (error) return <div className="text-red-500 p-10 bg-black min-h-screen">Error: {error}</div>;
    if (!currentNode) return null;

    // Extract image URL from different possible structures
    const imageUrl = currentNode.image_url || currentNode.data?.background_image || currentNode.image || '/assets/images/forest_entrance.jpg';
    const dialogueText = currentNode.dialogue_content || currentNode.text || '';
    const speakerName = currentNode.speaker_name || 'Narrador';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">

            {/* --- HEADER --- */}
            <header className="fixed top-0 w-full z-50 px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center">
                <button
                    onClick={() => navigate('/')}
                    className="text-white/70 hover:text-yellow-400 transition-colors flex items-center gap-2"
                >
                    <span className="text-xl">←</span>
                    <span className="font-bold">Volver al Menú</span>
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => setUserPrefs(p => ({ ...p, fontFamily: p.fontFamily.includes('Inter') ? 'OpenDyslexic, sans-serif' : 'Inter, sans-serif' }))}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs border border-white/10"
                    >
                        {userPrefs.fontFamily.includes('Dyslexic') ? '🔤' : '♿'}
                    </button>
                    <button
                        onClick={() => setUserPrefs(p => ({ ...p, highContrast: !p.highContrast, textColor: !p.highContrast ? '#ffff00' : '#ffffff' }))}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs border border-white/10"
                    >
                        {userPrefs.highContrast ? '👁️' : '🌗'}
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT: IMAGE + TEXT SIDE BY SIDE --- */}
            <main className="pt-20 pb-8 px-4 md:px-8 max-w-7xl mx-auto">

                <motion.div
                    key={currentNode.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
                >
                    {/* LEFT: Image Panel */}
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
                        <img
                            src={imageUrl}
                            alt="Scene"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://placehold.co/800x600/1e293b/FFF?text=Scene' }}
                        />
                        {/* Vignette for readability if text overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                    </div>

                    {/* RIGHT: Dialogue Panel */}
                    <div className="flex flex-col justify-between h-full">
                        <div
                            className="bg-slate-800/70 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl"
                            style={{ fontFamily: userPrefs.fontFamily, color: userPrefs.textColor }}
                        >
                            {speakerName !== 'Narrator' && speakerName !== 'Narrador' && (
                                <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-widest mb-4">
                                    {speakerName}
                                </h3>
                            )}
                            <p className="text-xl md:text-2xl leading-relaxed min-h-[120px]">
                                <Typewriter
                                    text={dialogueText}
                                    speed={25}
                                    onComplete={() => setChoicesVisible(true)}
                                />
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* --- DECISIONS BELOW --- */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 max-w-3xl mx-auto"
                >
                    <h4 className="text-sm text-slate-500 uppercase tracking-widest mb-4 text-center">
                        Decisiones
                    </h4>

                    <div className="flex flex-col gap-3">
                        <AnimatePresence mode="wait">
                            {choicesVisible && (currentNode.displayOptions || currentNode.choices || []).map((choice, idx) => (
                                <motion.button
                                    key={`${currentNode.id}-${idx}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => {
                                        setChoicesVisible(false);
                                        goToNode(choice.nextNodeId || choice.target);
                                    }}
                                    className="group w-full px-6 py-4 rounded-xl bg-slate-800/50 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500 text-left transition-all backdrop-blur-sm"
                                >
                                    <div className="flex items-center">
                                        <span className="text-purple-400 mr-4 text-2xl group-hover:translate-x-1 transition-transform">➤</span>
                                        <span className="font-medium text-lg text-white/90 group-hover:text-white">
                                            {choice.label}
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>

                        {!choicesVisible && (
                            <div className="text-center text-slate-600 italic py-6 animate-pulse">
                                Esperando texto...
                            </div>
                        )}

                        {choicesVisible && (currentNode.displayOptions || currentNode.choices || []).length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-slate-500 mb-6">Fin de este capítulo.</p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => { setChoicesVisible(false); goToNode('start'); }}
                                        className="px-6 py-3 bg-purple-600/30 hover:bg-purple-600/50 text-white rounded-xl border border-purple-500/50 transition-all"
                                    >
                                        🔄 Reiniciar
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl border border-white/10 transition-all"
                                    >
                                        ← Menú Principal
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.section>
            </main>
        </div>
    );
}
