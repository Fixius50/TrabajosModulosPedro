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
const VisualNovelCanvas = ({ currentNode, onChoiceSelect }) => {
    const [loading, setLoading] = useState(true);
    const [choicesVisible, setChoicesVisible] = useState(false);
    const [showUI, setShowUI] = useState(true);
    const { borderStyle } = useUserProgress();

    // Ref for the typewriter to control it externally
    const typewriterRef = useRef(null);

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
                            className="w-full h-full object-cover"
                        />
                    </AnimatePresence>
                </div>

                {/* LAYER 1: Vignette */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/60" />

                {/* UI LAYER TOGGLE */}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowUI(!showUI); }}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-all font-bold text-xl"
                    title={showUI ? "Hide UI (Full Art)" : "Show UI"}
                >
                    {showUI ? '👁️' : '🙈'}
                </button>

                {/* LAYER 2: Accessible UI & Text (Comic Bubbles) */}
                <AnimatePresence>
                    {showUI && (
                        <div className="absolute inset-0 z-20 pointer-events-none">

                            {/* CHOICES - CENTERED IN SCREEN */}
                            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-auto">
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
                                                        onClick={(e) => { e.stopPropagation(); onChoiceSelect(choice.target || choice.nextNodeId); }}
                                                        className="px-8 py-4 bg-white border-4 border-black text-black font-extrabold text-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all rounded-xl uppercase min-w-[300px]"
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
                                className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center pointer-events-auto px-4"
                            >
                                {/* Speaker Name */}
                                {currentNode?.speaker_name && currentNode.speaker_name !== 'Narrator' && (
                                    <div className="text-yellow-400 font-extrabold text-lg uppercase tracking-widest mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                        {currentNode.speaker_name}
                                    </div>
                                )}

                                {/* Animated Text */}
                                <div className="text-xl md:text-2xl font-bold leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                                    {currentNode?.text || currentNode?.dialogue_content ? (
                                        <TypewriterEffect
                                            ref={typewriterRef}
                                            text={currentNode?.text || currentNode?.dialogue_content}
                                            speed={20}
                                            onComplete={() => setChoicesVisible(true)}
                                        />
                                    ) : (
                                        "..."
                                    )}
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
    onChoiceSelect: PropTypes.func.isRequired
};

export default VisualNovelCanvas;
