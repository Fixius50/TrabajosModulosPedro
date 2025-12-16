import { motion } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';

// Fallback fonts
const DEFAULT_FONTS = [
    { id: 'Inter', label: 'Normal (Inter)', family: 'ui-sans-serif' },
    { id: 'OpenDyslexic', label: 'Dislexia', family: 'OpenDyslexic' },
    { id: 'Arial Black', label: 'Alta Visibilidad', family: '"Arial Black", sans-serif' }
];

const BORDERS = [
    { id: 'black', label: 'Negro', color: '#000000', preview: 'bg-black' },
    { id: 'white', label: 'Blanco', color: '#ffffff', preview: 'bg-white' },
    { id: 'wood', label: 'Madera', color: '#8B4513', preview: 'bg-gradient-to-br from-amber-200 via-amber-600 to-amber-900' }
];

export default function SettingsModal({ isOpen, onClose }) {
    const { activeFont, fontSize, borderStyle, activeTheme, purchases, setActive } = useUserProgress();

    // Wrappers
    const setFont = (id) => setActive('font', id);
    const setSize = (val) => setActive('size', val);
    const setBorder = (id) => setActive('border', id);
    const setTheme = (id) => setActive('theme', id);

    const availableFonts = [
        ...DEFAULT_FONTS,
        ...(purchases.fonts || [])
            .filter(fid => !DEFAULT_FONTS.find(df => df.id === fid))
            .map(fid => ({ id: fid, label: fid, family: fid }))
    ];

    const availableThemes = Array.from(new Set(['default', ...(purchases.themes || [])]));

    // Dynamic Theme Styles
    const getModalStyles = () => {
        switch (activeTheme) {
            case 'comic':
                return {
                    overlay: 'bg-white/90 backdrop-blur-sm',
                    container: 'bg-[#fdfbf7] border-4 border-black shadow-[12px_12px_0px_black] rounded-none',
                    text: 'text-black font-bangers tracking-wider',
                    header: 'bg-[#facc15] border-b-4 border-black text-black transform -skew-x-6',
                    button: 'border-4 border-black bg-white hover:bg-cyan-400 hover:text-black font-bold shadow-[4px_4px_0px_black] active:translate-y-1 active:shadow-none transition-all',
                    activeButton: 'bg-black text-white border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)]'
                };
            case 'manga':
                return {
                    overlay: 'bg-white/90 backdrop-blur-sm pixelated',
                    container: 'bg-white border-2 border-black shadow-none rounded-none',
                    text: 'text-black',
                    header: 'bg-black text-white border-b-2 border-black',
                    button: 'border border-black hover:bg-gray-200',
                    activeButton: 'bg-black text-white'
                };
            case 'sepia':
                return {
                    overlay: 'bg-[#f5e6d3]/80 backdrop-blur-sm',
                    container: 'bg-[#f5e6d3] border border-[#d4c4a8] shadow-xl',
                    text: 'text-[#4a3b2a]',
                    header: 'bg-[#e3d0b3] border-b border-[#d4c4a8]',
                    button: 'border border-[#d4c4a8] hover:bg-[#d4c4a8]',
                    activeButton: 'bg-[#4a3b2a] text-[#f5e6d3] ring-1 ring-[#4a3b2a]'
                };
            case 'terminal':
                return {
                    overlay: 'bg-black/90 backdrop-blur-md',
                    container: 'bg-black border border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
                    text: 'text-green-500 font-mono',
                    header: 'bg-black border-b border-green-500',
                    button: 'border border-green-500 hover:bg-green-500/20',
                    activeButton: 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                };
            case 'modern':
                return {
                    overlay: 'bg-[#090510]/90 backdrop-blur-lg',
                    container: 'bg-[#090510]/95 border border-[#302839] shadow-[0_0_30px_rgba(127,19,236,0.2)] rounded-2xl',
                    text: 'text-white font-rajdhani',
                    header: 'bg-transparent border-b border-[#302839] text-[#d946ef] font-orbitron tracking-widest',
                    button: 'border border-[#302839] bg-[#1a1625] text-[#ab9db9] hover:bg-[#7f13ec]/20 hover:text-[#d946ef] hover:border-[#d946ef]',
                    activeButton: 'bg-[#7f13ec] text-white border-[#d946ef] shadow-[0_0_15px_rgba(217,70,239,0.5)]'
                };
            default: // Default Dark
                return {
                    overlay: 'bg-black/60 backdrop-blur-sm',
                    container: 'bg-slate-900 border border-slate-700 shadow-2xl',
                    text: 'text-white',
                    header: 'bg-slate-950 border-b border-slate-800',
                    button: 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-600',
                    activeButton: 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                };
        }
    };

    const styles = getModalStyles();

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-colors duration-500 ${styles.overlay}`}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ fontFamily: activeFont }} // Force font update
                className={`w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ${styles.container}`}
            >
                {/* Header */}
                <div className={`p-6 flex justify-between items-center ${styles.header}`}>
                    <h2 className="text-xl font-bold tracking-widest uppercase flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full animate-pulse ${activeTheme === 'terminal' ? 'bg-green-500' : 'bg-yellow-400'}`}></span>
                        Multivisor System
                    </h2>
                    <motion.button
                        whileHover={{ rotate: 90 }}
                        onClick={onClose}
                        className="opacity-60 hover:opacity-100 transition-colors text-2xl font-bold"
                    >✕</motion.button>
                </div>

                {/* Content */}
                <div className={`flex-1 overflow-y-auto p-6 space-y-8 ${styles.text}`}>
                    <div className="space-y-8 animate-in fade-in duration-300">

                        {/* Typography */}
                        <section>
                            <label className="block text-xs font-bold opacity-60 uppercase mb-4">Tipografía</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {availableFonts.map(font => (
                                    <motion.button
                                        key={font.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setFont(font.id)}
                                        className={`h-24 px-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 ${activeFont === font.id
                                            ? styles.activeButton
                                            : styles.button
                                            }`}
                                    >
                                        <span className="text-3xl" style={{ fontFamily: font.family }}>Aa</span>
                                        <span className="text-xs text-center opacity-75">{font.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </section>

                        {/* Text Size Slider */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold opacity-60 uppercase">Tamaño de Texto</label>
                                <motion.span
                                    key={fontSize} // Key ensures re-animation on change
                                    initial={{ scale: 1.5, color: '#fbbf24' }}
                                    animate={{ scale: 1, color: 'currentColor' }}
                                    className="font-bold"
                                >
                                    {fontSize}%
                                </motion.span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="150"
                                step="10"
                                value={fontSize || 100}
                                onChange={(e) => setSize(parseInt(e.target.value))}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-current opacity-20 accent-current"
                            />
                            <div className="flex justify-between text-xs opacity-60 mt-2 font-mono">
                                <span>50%</span>
                                <span>100% (Default)</span>
                                <span>150%</span>
                            </div>
                        </section>

                        {/* Theme Selector (New) */}
                        <section>
                            <label className="block text-xs font-bold opacity-60 uppercase mb-4">Variable Multiverso (Tema)</label>
                            <div className="flex gap-3 flex-wrap">
                                {availableThemes.map(themeId => (
                                    <motion.button
                                        key={themeId}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setTheme(themeId)}
                                        className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold capitalize ${activeTheme === themeId
                                            ? styles.activeButton
                                            : styles.button
                                            }`}
                                    >
                                        {themeId}
                                    </motion.button>
                                ))}
                            </div>
                        </section>

                        {/* Border Style Selector */}
                        <section>
                            <label className="block text-xs font-bold opacity-60 uppercase mb-4">Estilo Casilla Texto</label>
                            <div className="flex gap-4 justify-center flex-wrap">
                                {BORDERS.map(border => (
                                    <motion.button
                                        key={border.id}
                                        whileHover={{ scale: 1.1, rotate: 2 }}
                                        whileTap={{ scale: 0.9, rotate: -2 }}
                                        onClick={() => setBorder(border.id)}
                                        className={`w-24 h-24 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${borderStyle === border.id
                                            ? `${styles.activeButton} scale-105`
                                            : `${styles.button} opacity-60 hover:opacity-100 hover:scale-105`
                                            }`}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-lg ${border.preview}`}
                                            style={{ border: `4px solid ${border.color}` }}
                                        ></div>
                                        <span className="text-xs font-medium">{border.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
