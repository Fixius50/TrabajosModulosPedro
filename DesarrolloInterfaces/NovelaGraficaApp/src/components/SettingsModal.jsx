import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';

const FONTS = [
    { id: 'sans', label: 'Inter', family: 'ui-sans-serif' },
    { id: 'serif', label: 'Serif', family: 'ui-serif' },
    { id: 'dyslexic', label: 'Dyslexic', family: 'OpenDyslexic' } // Logic to be added
];

const THEMES = [
    { id: 'default', label: 'Original', color: '#8b5cf6' },
    { id: 'sepia', label: 'Sepia', color: '#d97706' },
    { id: 'terminal', label: 'Terminal', color: '#22c55e' }
];

const BORDERS = [
    { id: 'black', label: 'Negro', color: '#000000', preview: 'bg-black' },
    { id: 'white', label: 'Blanco', color: '#ffffff', preview: 'bg-white' },
    { id: 'wood', label: 'Madera', color: '#8B4513', preview: 'bg-gradient-to-br from-amber-200 via-amber-600 to-amber-900' }
];

export default function SettingsModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('VISUAL');
    const { activeFont, activeTheme, borderStyle, setActive } = useUserProgress();

    // Helper wrappers for setActive
    const setFont = (id) => setActive('font', id);
    const setTheme = (id) => setActive('theme', id);
    const setBorder = (id) => setActive('border', id);

    // Mock States for Gallery
    const galleryItems = [
        { id: 1, src: '/assets/portadas/Batman.png', locked: false },
        { id: 2, src: '/assets/portadas/DnD.png', locked: false },
        { id: 3, src: '/assets/portadas/RickAndMorty.png', locked: false },
        { id: 4, src: '/assets/portadas/forest_entrance.jpg', locked: true },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        Multivisor System
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-950/50 p-2 gap-2">
                    {['VISUAL', 'AUDIO', 'GALLERY'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-bold tracking-wider rounded-lg transition-all ${activeTab === tab
                                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {activeTab === 'VISUAL' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Typography - Real Preview */}
                            <section>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Tipografía</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {FONTS.map(font => (
                                        <button
                                            key={font.id}
                                            onClick={() => setFont(font.id)}
                                            className={`h-20 rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${activeFont === font.id
                                                ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 scale-105'
                                                : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                                                }`}
                                            style={{ fontFamily: font.family }}
                                        >
                                            Aa
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Tamaño de Texto</label>
                                <input type="range" min="0" max="100" className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400" />
                            </section>

                            {/* Theme Tuner */}
                            <section>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Modo Visual</label>
                                <div className="flex gap-4 justify-center">
                                    {THEMES.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => setTheme(theme.id)}
                                            className={`w-16 h-16 rounded-full border-4 transition-all flex items-center justify-center ${activeTheme === theme.id
                                                ? 'border-yellow-400 scale-110 shadow-[0_0_20px_currentColor]'
                                                : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: theme.color, color: theme.color }}
                                        >
                                            {activeTheme === theme.id && <span className="text-black font-bold">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Border Style Selector */}
                            <section>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Estilo del Marco</label>
                                <div className="flex gap-4 justify-center">
                                    {BORDERS.map(border => (
                                        <button
                                            key={border.id}
                                            onClick={() => setBorder(border.id)}
                                            className={`w-20 h-20 rounded-xl border-4 transition-all flex flex-col items-center justify-center gap-1 ${borderStyle === border.id
                                                ? 'border-yellow-400 scale-110 shadow-lg'
                                                : 'border-slate-700 opacity-60 hover:opacity-100 hover:scale-105'
                                                }`}
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-lg ${border.preview}`}
                                                style={{ border: `4px solid ${border.color}` }}
                                            ></div>
                                            <span className="text-xs text-white font-medium">{border.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'GALLERY' && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                            {galleryItems.map(item => (
                                <div key={item.id} className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative group">
                                    {item.locked ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                                            <span className="text-4xl">🔒</span>
                                        </div>
                                    ) : (
                                        <img src={item.src} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    )}
                                    <div className="absolute inset-0 border-2 border-white/5 pointer-events-none group-hover:border-yellow-400/50 transition-colors"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'AUDIO' && (
                        <div className="text-center py-10 text-slate-500">
                            <p>Audio Modules Offline</p>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    );
}
