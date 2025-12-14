import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import TypewriterEffect from './TypewriterEffect';

/**
 * VisualNovelCanvas - The Core Engine Visual Layer
 */
const VisualNovelCanvas = ({ currentNode, onChoiceSelect }) => {
    const [loading, setLoading] = useState(true);
    const [choicesVisible, setChoicesVisible] = useState(false);

    // Reset state when node changes
    useEffect(() => {
        if (currentNode) {
            setLoading(false);
            setChoicesVisible(false); // Hide choices initially
        }
    }, [currentNode]);

    if (loading) {
        return (
            <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 opacity-50"></div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-950">
            {/* LAYER 0: Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    key={currentNode?.id} // Force re-render for transition
                    src={currentNode?.image || currentNode?.image_url || '/assets/placeholders/bg_placeholder.jpg'}
                    alt="Scene Background"
                    className="w-full h-full object-cover opacity-80"
                />
                {/* Placeholder for PixiJS canvas integration in Phase n+1 */}
            </div>

            {/* LAYER 1: Vignette Overlay */}
            <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.9) 100%)'
                }}
            />

            {/* LAYER 2: Accessible UI & Text */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-12 pb-24">

                {/* Dialogue Box */}
                <motion.div
                    key={`dialogue-${currentNode?.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-2xl min-h-[8rem] flex flex-col justify-center"
                >
                    {currentNode?.speaker_name && currentNode.speaker_name !== 'Narrator' && (
                        <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
                            {currentNode.speaker_name}
                        </div>
                    )}

                    <div className="text-lg md:text-xl text-gray-100 font-medium leading-relaxed font-sans">
                        {/* Typewriter Effect */}
                        {currentNode?.text || currentNode?.dialogue_content ? (
                            <TypewriterEffect
                                text={currentNode?.text || currentNode?.dialogue_content}
                                speed={20}
                                onComplete={() => setChoicesVisible(true)}
                            />
                        ) : (
                            "..."
                        )}
                    </div>
                </motion.div>

                {/* Choices Area - Decision Engine (Input Blocking) */}
                <div className="mt-6 flex flex-col items-center justify-center min-h-[4rem]">
                    <AnimatePresence>
                        {choicesVisible && currentNode?.choices && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex flex-wrap justify-center gap-4"
                            >
                                {currentNode.choices.map((choice, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onChoiceSelect(choice.target || choice.nextNodeId)}
                                        className="px-6 py-3 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/50 hover:border-yellow-400 text-yellow-100 rounded-lg backdrop-blur-sm transition-colors duration-200 font-semibold tracking-wide"
                                    >
                                        {choice.label}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

VisualNovelCanvas.propTypes = {
    currentNode: PropTypes.object,
    onChoiceSelect: PropTypes.func.isRequired
};

export default VisualNovelCanvas;
