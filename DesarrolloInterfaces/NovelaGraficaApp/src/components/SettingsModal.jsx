import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';

// Fallback fonts if not loaded dynamically
const DEFAULT_FONTS = [
    { id: 'Inter', label: 'Normal (Inter)', family: 'ui-sans-serif' },
    { id: 'OpenDyslexic', label: 'Dislexia', family: 'OpenDyslexic' }, // CSS font-face needed
    { id: 'Arial Black', label: 'Alta Visibilidad', family: '"Arial Black", sans-serif' }
];

const BORDERS = [
    { id: 'black', label: 'Negro', color: '#000000', preview: 'bg-black' },
    { id: 'white', label: 'Blanco', color: '#ffffff', preview: 'bg-white' },
    { id: 'wood', label: 'Madera', color: '#8B4513', preview: 'bg-gradient-to-br from-amber-200 via-amber-600 to-amber-900' }
];

export default function SettingsModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('VISUAL');
    const {
        activeFont,
        fontSize,
        borderStyle,
        purchases,
        setActive
    } = useUserProgress();

    // Helper wrappers
    const setFont = (id) => setActive('font', id);
    const setSize = (val) => setActive('size', val);
    const setBorder = (id) => setActive('border', id);

    // Merge default fonts with purchased ones
    const availableFonts = [
        ...DEFAULT_FONTS,
        ...(purchases.fonts || [])
            .filter(fid => !DEFAULT_FONTS.find(df => df.id === fid))
            .map(fid => ({ id: fid, label: fid, family: fid }))
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="space-y-8 animate-in fade-in duration-300">

                        {/* Typography */}
                        <section>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Tipografía</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {availableFonts.map(font => (
                                    <button
                                        key={font.id}
                                        onClick={() => setFont(font.id)}
                                        className={`h-24 px-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${activeFont === font.id
                                            ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 scale-105'
                                            : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        <span className="text-3xl" style={{ fontFamily: font.family }}>Aa</span>
                                        <span className="text-xs text-center opacity-75">{font.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Text Size Slider */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold text-slate-500 uppercase">Tamaño de Texto</label>
                                <span className="text-yellow-400 font-bold">{fontSize}%</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="150"
                                step="10"
                                value={fontSize || 100}
                                onChange={(e) => setSize(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                            />
                            <div className="flex justify-between text-xs text-slate-600 mt-2 font-mono">
                                <span>50%</span>
                                <span>100% (Default)</span>
                                <span>150%</span>
                            </div>
                        </section>

                        {/* Border Style Selector */}
                        <section>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Estilo del Marco</label>
                            <div className="flex gap-4 justify-center flex-wrap">
                                {BORDERS.map(border => (
                                    <button
                                        key={border.id}
                                        onClick={() => setBorder(border.id)}
                                        className={`w-24 h-24 rounded-xl border-4 transition-all flex flex-col items-center justify-center gap-1 ${borderStyle === border.id
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
                </div>
            </motion.div>
        </div>
    );
}
