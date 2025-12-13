import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoryEngine } from '../hooks/useStoryEngine';
import { useUserProgress } from '../stores/userProgress';
import RouteMap from '../components/RouteMap';

// Typewriter - only re-runs when text changes, not when onComplete changes
function Typewriter({ text, speed = 20, onComplete }) {
    const [displayed, setDisplayed] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const indexRef = useRef(0);
    const onCompleteRef = useRef(onComplete);

    // Keep the callback ref updated without triggering re-render
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        indexRef.current = 0;
        setDisplayed('');
        setIsComplete(false);
        const interval = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayed(text.slice(0, indexRef.current + 1));
                indexRef.current++;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                onCompleteRef.current?.();
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]); // Removed onComplete from dependencies

    const handleSkip = () => {
        if (!isComplete) { setDisplayed(text); setIsComplete(true); onCompleteRef.current?.(); }
    };

    return (
        <span onClick={handleSkip} style={{ cursor: isComplete ? 'default' : 'pointer' }}>
            {displayed}
            {!isComplete && <span style={{ animation: 'blink 1s infinite' }}>▌</span>}
        </span>
    );
}

// Theme colors
const THEMES = {
    default: { bg: '#0f172a', accent: '#8b5cf6' },
    midnight: { bg: '#1a1a2e', accent: '#6366f1' },
    forest: { bg: '#1a3a2a', accent: '#22c55e' },
    sunset: { bg: '#2d1b3d', accent: '#f97316' },
    ocean: { bg: '#0a2a3a', accent: '#06b6d4' },
    cyberpunk: { bg: '#0f0c29', accent: '#ff00ff' }
};

export default function StoryReader() {
    const { seriesId } = useParams();
    const navigate = useNavigate();
    const { currentNode, loading, error, goToNode } = useStoryEngine('start');
    const { points, activeTheme, activeFont, visitNode, recordChoice, reachEnding } = useUserProgress();

    const [choicesVisible, setChoicesVisible] = useState(false);
    const [showBacklog, setShowBacklog] = useState(false);
    const [showRouteMap, setShowRouteMap] = useState(false);
    const [dialogueHistory, setDialogueHistory] = useState([]);
    const [hoveredChoice, setHoveredChoice] = useState(null);
    const [showUI, setShowUI] = useState(true);
    const [pointsNotification, setPointsNotification] = useState(null);
    const [currentNodeIdForMap, setCurrentNodeIdForMap] = useState('start');

    const theme = THEMES[activeTheme] || THEMES.default;
    const storyId = seriesId || '1';

    // Visit node on mount and when node changes
    useEffect(() => {
        if (currentNode?.id) {
            // Visit the current node (will give points only if first time)
            const nodePoints = visitNode(storyId, currentNode.id);
            setCurrentNodeIdForMap(currentNode.id);

            // Show notification only if points earned (first visit)
            if (nodePoints > 0) {
                setPointsNotification(`+${nodePoints} pts`);
                setTimeout(() => setPointsNotification(null), 1500);
            }
        }
    }, [currentNode?.id]);

    useEffect(() => {
        if (currentNode?.dialogue_content || currentNode?.text) {
            const newEntry = { id: currentNode.id, speaker: currentNode.speaker_name || 'Narrador', text: currentNode.dialogue_content || currentNode.text };
            setDialogueHistory(prev => [...prev.slice(-9), newEntry]);
        }
        setChoicesVisible(false);
    }, [currentNode]);

    // Handle choice selection with tracking
    const handleChoice = (choice, idx) => {
        const targetNodeId = choice.nextNodeId || choice.target;

        // Record the choice (for history) and visit target node
        recordChoice(storyId, currentNode.id, choice.label, targetNodeId);

        // Check if this leads to an ending
        if (choice.isEnding) {
            const endingPoints = reachEnding(storyId, targetNodeId, 3); // 3 total endings
            if (endingPoints > 0) {
                setPointsNotification(`+${endingPoints} pts - ¡Final desbloqueado!`);
                setTimeout(() => setPointsNotification(null), 2000);
            }
        }

        setChoicesVisible(false);
        setHoveredChoice(null);
        goToNode(targetNodeId);
    };

    const handleTouchZone = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        if (pct >= 0.2 && pct <= 0.8) setShowUI(prev => !prev);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '2rem', height: '2rem', border: `3px solid ${theme.accent}40`, borderTopColor: theme.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Cargando...</p>
                </div>
            </div>
        );
    }

    if (error) return <div style={{ color: '#ef4444', padding: '2rem' }}>Error: {error}</div>;
    if (!currentNode) return null;

    const imageUrl = currentNode.image_url || currentNode.image || '/assets/images/forest_entrance.jpg';
    const dialogueText = currentNode.dialogue_content || currentNode.text || '';
    const speakerName = currentNode.speaker_name || '';
    const choices = currentNode.displayOptions || currentNode.choices || [];

    return (
        <div
            onClick={handleTouchZone}
            style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                fontFamily: `${activeFont}, system-ui, sans-serif`
            }}
        >
            {/* Background Image */}
            <motion.div
                key={currentNode.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: theme.bg
                }}
            />

            {/* Gradient overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.85) 100%)',
                pointerEvents: 'none'
            }} />

            {/* Points Notification */}
            <AnimatePresence>
                {pointsNotification && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        style={{
                            position: 'absolute',
                            top: '4rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                            color: '#000',
                            padding: '0.5rem 1rem',
                            borderRadius: '1rem',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            zIndex: 200,
                            boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.3)'
                        }}
                    >
                        {pointsNotification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <AnimatePresence>
                {showUI && (
                    <motion.header
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            padding: '0.75rem 1rem',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
                            zIndex: 100
                        }}
                    >
                        <button onClick={() => navigate('/')} style={headerBtnStyle}>← Salir</button>

                        {/* Points display */}
                        <div style={{
                            background: 'rgba(251,191,36,0.2)',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#fbbf24'
                        }}>
                            💰 {points}
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => setShowRouteMap(true)} style={headerBtnStyle} title="Mapa de Rutas">🗺️</button>
                            <button onClick={() => setShowBacklog(true)} style={headerBtnStyle}>🕐</button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Route Map Modal */}
            <RouteMap
                isOpen={showRouteMap}
                onClose={() => setShowRouteMap(false)}
                storyId={storyId}
                currentNodeId={currentNodeIdForMap}
                onNavigateToNode={(nodeId) => {
                    setShowRouteMap(false);
                    goToNode(nodeId);
                }}
            />

            {/* Backlog Panel */}
            <AnimatePresence>
                {showBacklog && (
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute', top: 0, right: 0, bottom: 0, width: '85%', maxWidth: '20rem',
                            background: `${theme.bg}f5`, backdropFilter: 'blur(12px)',
                            borderLeft: '1px solid rgba(255,255,255,0.1)', zIndex: 200, display: 'flex', flexDirection: 'column'
                        }}
                    >
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>🕐 Historial</h3>
                            <button onClick={() => setShowBacklog(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                            {dialogueHistory.length === 0 ? (
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textAlign: 'center' }}>Vacío</p>
                            ) : (
                                dialogueHistory.map((entry, idx) => (
                                    <div key={idx} style={{ marginBottom: '0.75rem', padding: '0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                                        {entry.speaker !== 'Narrador' && <p style={{ color: theme.accent, fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{entry.speaker}</p>}
                                        <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>{entry.text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom UI */}
            <AnimatePresence>
                {showUI && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '0 1rem 1.5rem',
                            zIndex: 50
                        }}
                    >
                        {/* Dialogue Box */}
                        <div style={{
                            width: '100%',
                            maxWidth: '36rem',
                            background: `${theme.bg}e6`,
                            backdropFilter: 'blur(12px)',
                            borderRadius: '1rem',
                            padding: '1rem 1.25rem',
                            border: `1px solid ${theme.accent}30`,
                            boxShadow: '0 -0.5rem 2rem rgba(0,0,0,0.4)',
                            marginBottom: '0.75rem'
                        }}>
                            {speakerName && speakerName !== 'Narrador' && (
                                <p style={{ color: theme.accent, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                                    {speakerName}
                                </p>
                            )}
                            <p style={{ color: 'white', fontSize: '0.95rem', lineHeight: 1.7 }}>
                                <Typewriter text={dialogueText} speed={18} onComplete={() => setChoicesVisible(true)} />
                            </p>
                        </div>

                        {/* Choices */}
                        <AnimatePresence>
                            {choicesVisible && choices.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '36rem' }}
                                >
                                    {choices.map((choice, idx) => {
                                        const isHovered = hoveredChoice === idx;
                                        const isOther = hoveredChoice !== null && hoveredChoice !== idx;

                                        return (
                                            <motion.button
                                                key={`choice-${idx}`}
                                                animate={{ scale: isHovered ? 1.08 : 1, opacity: isOther ? 0.4 : 1, filter: isOther ? 'blur(2px)' : 'blur(0px)' }}
                                                transition={{ duration: 0.2 }}
                                                onMouseEnter={() => setHoveredChoice(idx)}
                                                onMouseLeave={() => setHoveredChoice(null)}
                                                onClick={() => handleChoice(choice, idx)}
                                                style={{
                                                    padding: '0.7rem 1.25rem',
                                                    background: `linear-gradient(135deg, ${theme.accent}e6, ${theme.accent}cc)`,
                                                    border: '2px solid rgba(255,255,255,0.15)',
                                                    borderRadius: '0.75rem',
                                                    color: 'white',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    boxShadow: `0 0.3rem 1rem ${theme.accent}66`,
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {choice.label}
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!choicesVisible && choices.length > 0 && (
                            <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '1rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                                <span style={{ display: 'inline-block', width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: theme.accent, marginRight: '0.4rem', animation: 'pulse 1.5s infinite' }} />
                                Leyendo...
                            </div>
                        )}

                        {choicesVisible && choices.length === 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => { setChoicesVisible(false); goToNode('start'); }} style={{ ...endBtnStyle, background: `${theme.accent}40` }}>Reiniciar</button>
                                <button onClick={() => navigate('/')} style={{ ...endBtnStyle, background: 'rgba(255,255,255,0.1)' }}>Biblioteca</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {!showUI && (
                <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', padding: '0.4rem 0.8rem', borderRadius: '1rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
                    Toca para mostrar
                </div>
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
        </div>
    );
}

const headerBtnStyle = { background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, padding: '0.4rem 0.75rem', borderRadius: '0.5rem' };
const endBtnStyle = { padding: '0.6rem 1.25rem', border: 'none', borderRadius: '0.6rem', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 };
