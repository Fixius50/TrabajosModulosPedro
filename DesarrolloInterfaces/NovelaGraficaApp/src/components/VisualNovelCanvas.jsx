import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import TypewriterEffect from './TypewriterEffect';
import { useUserProgress } from '../stores/userProgress';

// Border styles configuration
const BORDER_STYLES = {
    black: {
        border: '8px solid #000000',
        shadow: '0 0 20px rgba(0,0,0,0.8)'
    },
    white: {
        border: '8px solid #ffffff',
        shadow: '0 0 20px rgba(255,255,255,0.3)'
    },
    wood: {
        border: '8px solid #8B4513',
        shadow: '0 0 20px rgba(139,69,19,0.6)',
        background: 'linear-gradient(135deg, #DEB887 0%, #8B4513 50%, #654321 100%)'
    }
};

/**
 * VisualNovelCanvas - The Core Engine Visual Layer
 */
const VisualNovelCanvas = ({ currentNode, onChoiceSelect, onOpenMap, onOpenSettings, onBack, onComplete }) => {
    const [loading, setLoading] = useState(true);
    const [choicesVisible, setChoicesVisible] = useState(false);
    const [showUI, setShowUI] = useState(true); // UI visible by default
    const [menuOpen, setMenuOpen] = useState(false); // Menu closed by default
    const { borderStyle, fontSize, activeTheme, getThemeStyles } = useUserProgress();


    // Ref for the typewriter to control it externally
    const typewriterRef = useRef(null);

    // Dynamic Theme Config
    const themeConfig = getThemeStyles(activeTheme);

    // Default styles if no config found (e.g. 'default' theme)
    const activeStyle = {
        background: themeConfig?.bg || 'rgba(0, 0, 0, 0.7)',
        border: themeConfig?.cardBorder || '1px solid rgba(255,255,255,0.1)',
        fontFamily: themeConfig?.font || 'inherit',
        accent: themeConfig?.accent || '#ffffff',
        // Shadow logic: if neon, use glow; else if comic, use heavy shadow; else standard
        boxShadow: activeTheme === 'neon' ? `0 0 20px ${themeConfig?.accent || '#d946ef'}` :
            activeTheme === 'comic' ? '8px 8px 0px rgba(0,0,0,1)' :
                '0 10px 30px rgba(0,0,0,0.5)',
        color: (activeTheme === 'manga' || activeTheme === 'comic' || activeTheme === 'paper' || activeTheme === 'inverse') ? '#000000' : '#ffffff'
    };


    // Reset state when node changes
    useEffect(() => {
        if (currentNode) {
            setLoading(false);
            setChoicesVisible(false); // Hide choices initially
        }
    }, [currentNode]);

    // Click handler for the whole canvas
    const handleCanvasClick = (e) => {
        // If UI is hidden, show it
        if (!showUI) {
            setShowUI(true);
            return;
        }

        // If menu is open, close it
        if (menuOpen) {
            setMenuOpen(false);
            return;
        }

        // If choices are already visible, do nothing (let user click choice)
        if (choicesVisible) return;

        // Try to skip typewriter
        if (typewriterRef.current && typewriterRef.current.isTyping) {
            typewriterRef.current.skip();
        } else if (currentNode?.next) {
            // Advance to next linear node
            onChoiceSelect(currentNode.next);
        }
    };

    const handleTypewriterComplete = useRef(() => setChoicesVisible(true)).current; // Stable reference
    // Alternatively use useCallback but since it just sets state to true, this is fine or even useCallback([], ...)

    if (loading) {
        return (
            <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 opacity-50"></div>
            </div>
        );
    }

    // Get current border style
    const currentBorder = BORDER_STYLES[borderStyle] || BORDER_STYLES.black;

    return (
        <div className="relative w-full h-full bg-slate-950 flex items-center justify-center p-4">
            {/* COMIC PANEL CONTAINER */}
            <div
                className="relative w-full h-full overflow-hidden cursor-pointer rounded-lg"
                style={{
                    border: currentBorder.border,
                    boxShadow: currentBorder.shadow,
                    ...(borderStyle === 'wood' && { borderImage: 'linear-gradient(135deg, #DEB887, #8B4513, #654321) 1' })
                }}
                onClick={handleCanvasClick}
            >
                {/* LAYER 0: Background Image */}
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode='wait'>
                        <motion.img
                            key={currentNode?.image || currentNode?.image_url}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            src={currentNode?.image || currentNode?.image_url || '/assets/placeholders/bg_placeholder.jpg'}
                            alt="Scene Background"
                            className="w-full h-full object-contain bg-black"
                        />
                    </AnimatePresence>
                </div>

                {/* LAYER 1: Vignette */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/60" />

                {/* UI LAYER TOGGLE & MENU */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                        className="bg-black/80 text-yellow-400 border-2 border-yellow-500 rounded-full px-6 py-2 font-bold uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center gap-2 z-50"
                    >
                        <span>MENU</span>
                        <svg className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {/* HORIZONTAL TOOLBAR CONTENT */}
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -20, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: 'auto' }}
                                exit={{ opacity: 0, x: -20, width: 0 }}
                                className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-full overflow-hidden shadow-2xl h-[44px] flex items-center"
                            >
                                <div className="flex flex-row items-center px-2">
                                    <button onClick={(e) => { e.stopPropagation(); onOpenMap(); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-1 hover:bg-white/10 rounded-lg text-white font-medium transition-colors whitespace-nowrap">
                                        <span className="text-xl">🗺️</span>
                                    </button>
                                    <div className="w-px h-6 bg-slate-700 mx-1"></div>
                                    <button onClick={(e) => { e.stopPropagation(); onOpenSettings(); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-1 hover:bg-white/10 rounded-lg text-white font-medium transition-colors whitespace-nowrap">
                                        <span className="text-xl">⚙️</span>
                                    </button>
                                    <div className="w-px h-6 bg-slate-700 mx-1"></div>
                                    <button onClick={(e) => { e.stopPropagation(); setShowUI(!showUI); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-1 hover:bg-white/10 rounded-lg text-white font-medium transition-colors whitespace-nowrap">
                                        <span className="text-xl">{showUI ? '👁️' : '🙈'}</span>
                                    </button>
                                    <div className="w-px h-6 bg-slate-700 mx-1"></div>
                                    <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="flex items-center gap-2 px-3 py-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg font-medium transition-colors whitespace-nowrap">
                                        <span className="text-xl">🚪</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* LAYER 2: Accessible UI & Text (Comic Bubbles) */}
                <AnimatePresence>
                    {showUI && (
                        <div className="absolute inset-0 z-20 pointer-events-none">

                            {/* CHOICES - CENTERED IN SCREEN */}
                            <div className={`absolute inset-0 flex items-center justify-center z-30 pointer-events-auto ${currentNode?.choices?.[0]?.style === 'bottom-center' ? 'items-end pb-20' : ''}`}>
                                <AnimatePresence>
                                    {choicesVisible && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center gap-4 p-4"
                                        >
                                            {/* Case A: Branching Choices */}
                                            {currentNode?.choices && currentNode.choices.length > 0 ? (
                                                currentNode.choices.map((choice, idx) => (
                                                    <motion.button
                                                        key={idx}
                                                        whileHover={{ scale: 1.05, rotate: -1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (choice.action === 'EXIT') {
                                                                if (onComplete) onComplete();
                                                                else onBack();
                                                            } else {
                                                                onChoiceSelect(choice.target || choice.nextNodeId);
                                                            }
                                                        }}
                                                        className={`px-8 py-4 bg-white border-4 border-black text-black font-extrabold text-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all rounded-xl uppercase min-w-[300px] ${choice.action === 'EXIT' ? 'bg-red-500 text-white border-white hover:bg-red-600' : ''}`}
                                                    >
                                                        {choice.label}
                                                    </motion.button>
                                                ))
                                            ) : currentNode?.next ? (
                                                /* Case B: Linear "Next" Button */
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={(e) => { e.stopPropagation(); onChoiceSelect(currentNode.next); }}
                                                    className="px-10 py-4 bg-yellow-400 border-4 border-black text-black font-extrabold text-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all rounded-xl uppercase flex items-center gap-3"
                                                >
                                                    CONTINUAR ➔
                                                </motion.button>
                                            ) : null}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* TEXT AREA - BOTTOM CENTERED WITH MARGIN */}
                            <motion.div
                                key={`dialogue-${currentNode?.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-8 left-4 right-4 md:left-20 md:right-20 pointer-events-auto flex flex-col items-center z-40"
                            >
                                {/* THEMED TEXT BOX CONTAINER */}
                                <div
                                    className="relative w-full max-w-4xl p-6 md:p-8 rounded-xl backdrop-blur-md transition-all duration-500"
                                    style={{
                                        // Dynamic Styles based on Theme
                                        background: borderStyle === 'wood' ? currentBorder.background : activeStyle.background,
                                        border: currentBorder.border !== 'none' ? currentBorder.border : activeStyle.border,
                                        boxShadow: currentBorder.shadow !== 'none' ? currentBorder.shadow : activeStyle.boxShadow,
                                        color: activeStyle.color,
                                        fontFamily: activeStyle.fontFamily
                                    }}
                                >
                                    {/* Speaker Name Badge */}
                                    {currentNode?.speaker_name && currentNode.speaker_name !== 'Narrator' && (
                                        <div
                                            className="absolute -top-5 left-8 px-4 py-1 font-extrabold text-sm uppercase tracking-widest rounded shadow-lg transform -rotate-1"
                                            style={{
                                                background: activeStyle.accent,
                                                color: (activeTheme === 'comic' || activeTheme === 'manga' || activeTheme === 'inverse') ? '#000' : '#fff',
                                                border: activeTheme === 'comic' ? '2px solid #000' : 'none'
                                            }}
                                        >
                                            {currentNode.speaker_name}
                                        </div>
                                    )}

                                    {/* Animated Text */}
                                    <div
                                        className="font-bold leading-relaxed text-lg md:text-xl"
                                        style={{ fontSize: `${fontSize}%` }}
                                    >
                                        {currentNode?.text || currentNode?.dialogue_content ? (
                                            <TypewriterEffect
                                                ref={typewriterRef}
                                                text={currentNode?.text || currentNode?.dialogue_content}
                                                speed={20}
                                                onComplete={handleTypewriterComplete}
                                            />
                                        ) : (
                                            "..."
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    )}
                </AnimatePresence>
            </div> {/* End Comic Panel Container */}
        </div>
    );
};

VisualNovelCanvas.propTypes = {
    currentNode: PropTypes.object,
    onChoiceSelect: PropTypes.func.isRequired,
    onOpenMap: PropTypes.func,
    onOpenSettings: PropTypes.func,
    onBack: PropTypes.func
};

export default VisualNovelCanvas;
