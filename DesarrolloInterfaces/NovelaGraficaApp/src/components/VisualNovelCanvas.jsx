import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import TypewriterEffect from './TypewriterEffect';

/**
 * VisualNovelCanvas - The Core Engine Visual Layer
 */
const VisualNovelCanvas = ({ currentNode, onChoiceSelect }) => {
    const [loading, setLoading] = useState(true);
    const [choicesVisible, setChoicesVisible] = useState(false);
    const [showUI, setShowUI] = useState(true);

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

    // Determine bubble position (default to bottom center if not specified)
    // In a real app, position_x / position_y would come from DB
    const bubbleStyle = {
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
    };

    return (
        <div
            className="relative w-full h-full overflow-hidden bg-slate-950 cursor-pointer"
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

                        {/* SPEECH BUBBLE */}
                        <motion.div
                            key={`dialogue-${currentNode?.id}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute pointer-events-auto bg-white text-black p-6 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-4 border-black max-w-2xl w-[90%]"
                            style={bubbleStyle}
                        >
                            {/* Speaker Name Tag */}
                            {currentNode?.speaker_name && currentNode.speaker_name !== 'Narrator' && (
                                <div className="absolute -top-4 left-6 bg-yellow-400 text-black font-extrabold px-3 py-1 border-2 border-black transform -rotate-2 shadow-sm uppercase tracking-wide text-sm">
                                    {currentNode.speaker_name}
                                </div>
                            )}

                            {/* Text Content */}
                            <div className="text-lg md:text-xl font-bold leading-relaxed font-sans text-gray-900 min-h-[3rem]">
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

                            {/* Bubble Tail (Decorative) */}
                            <div className="absolute -bottom-3 left-1/2 w-6 h-6 bg-white border-r-4 border-b-4 border-black transform rotate-45 translate-x-1/2"></div>
                        </motion.div>

                        {/* CHOICES (Overlay on top of everything when ready) */}
                        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center justify-end z-30 pointer-events-auto">
                            <AnimatePresence>
                                {choicesVisible && currentNode?.choices && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-wrap justify-center gap-3 p-4"
                                    >
                                        {currentNode.choices.map((choice, idx) => (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ scale: 1.05, rotate: -1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => { e.stopPropagation(); onChoiceSelect(choice.target || choice.nextNodeId); }}
                                                className="px-6 py-3 bg-white border-2 border-black text-black font-extrabold text-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all rounded-lg uppercase"
                                            >
                                                {choice.label}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

VisualNovelCanvas.propTypes = {
    currentNode: PropTypes.object,
    onChoiceSelect: PropTypes.func.isRequired
};

export default VisualNovelCanvas;
