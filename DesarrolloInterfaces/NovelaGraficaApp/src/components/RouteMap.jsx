import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';

// Story tree structure for "El Bosque Digital"
// IDs MUST match exactly with story_demo.json node IDs
const STORY_TREE = {
    '1': {
        title: 'El Bosque Digital',
        nodes: [
            // start -> decision_1 (intro panel with "Continuar")
            { id: 'start', label: 'INICIO', x: 50, y: 10, type: 'start', children: ['decision_1'] },
            // decision_1: choice between stealth or shout
            { id: 'decision_1', label: 'Decisión', x: 50, y: 30, children: ['node_stealth', 'node_shout'] },
            // node_stealth path
            { id: 'node_stealth', label: 'Sigilo', x: 30, y: 55, children: ['end_demo'] },
            // node_shout path  
            { id: 'node_shout', label: 'Gritar', x: 70, y: 55, children: ['end_demo'] },
            // end_demo: the ending (demo version)
            { id: 'end_demo', label: 'Continuará...', x: 50, y: 80, type: 'ending', endingType: 'neutral' }
        ],
        totalEndings: 1
    }
};

// Node component
function TreeNode({ node, status, isCurrentNode, onClick }) {
    const getCircleStyle = () => {
        const size = node.type === 'ending' ? '2.5rem' : '2rem';
        const base = {
            width: size,
            height: size,
            borderRadius: node.type === 'ending' ? '0.5rem' : '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: node.type === 'ending' ? '1rem' : '0.7rem',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            transform: node.type === 'ending' ? 'rotate(45deg)' : 'none'
        };

        switch (status) {
            case 'current':
                return {
                    ...base,
                    background: 'rgba(250,204,21,0.2)',
                    border: '3px solid #facc15',
                    boxShadow: '0 0 20px rgba(250,204,21,0.6), 0 0 40px rgba(250,204,21,0.3)',
                    color: '#facc15'
                };
            case 'visited':
                return {
                    ...base,
                    background: 'rgba(139,92,246,0.3)',
                    border: '2px solid #a78bfa',
                    color: 'white'
                };
            case 'available':
                return {
                    ...base,
                    background: 'transparent',
                    border: '2px dashed rgba(255,255,255,0.4)',
                    color: 'rgba(255,255,255,0.5)'
                };
            case 'locked':
            default:
                return {
                    ...base,
                    background: 'rgba(100,116,139,0.2)',
                    border: '2px solid rgba(100,116,139,0.4)',
                    color: 'rgba(100,116,139,0.6)'
                };
        }
    };

    const getEndingColor = () => {
        if (node.endingType === 'good') return '#22c55e';
        if (node.endingType === 'bad') return '#ef4444';
        if (node.endingType === 'secret') return '#fbbf24';
        return '#a78bfa';
    };

    return (
        // Outer wrapper for positioning - NO animation here
        <div
            style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10
            }}
        >
            {/* Inner wrapper for animation */}
            <motion.div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: status !== 'locked' ? 'pointer' : 'default'
                }}
                whileHover={status !== 'locked' ? { scale: 1.15 } : {}}
                transition={{ duration: 0.2 }}
                onClick={() => status !== 'locked' && onClick?.(node)}
            >
                {/* Current node indicator */}
                {isCurrentNode && (
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            position: 'absolute',
                            top: '-1.5rem',
                            background: '#facc15',
                            color: '#000',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.55rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        AQUÍ
                    </motion.div>
                )}

                {/* Node circle */}
                <motion.div
                    style={getCircleStyle()}
                    animate={isCurrentNode ? {
                        boxShadow: ['0 0 20px rgba(250,204,21,0.6)', '0 0 30px rgba(250,204,21,0.8)', '0 0 20px rgba(250,204,21,0.6)']
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <span style={{ transform: node.type === 'ending' ? 'rotate(-45deg)' : 'none' }}>
                        {status === 'locked' ? '🔒' : (
                            node.type === 'ending' ? (
                                status === 'visited' ? '🏆' : '💎'
                            ) : (
                                status === 'visited' ? '✓' : '•'
                            )
                        )}
                    </span>
                </motion.div>

                {/* Label */}
                <span style={{
                    marginTop: '0.4rem',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    color: status === 'locked' ? 'rgba(100,116,139,0.5)' : (
                        status === 'current' ? '#facc15' : (
                            status === 'visited' ? 'white' : 'rgba(255,255,255,0.6)'
                        )
                    ),
                    textShadow: status !== 'locked' ? '0 0 10px rgba(0,0,0,0.8)' : 'none',
                    whiteSpace: 'nowrap'
                }}>
                    {status === 'locked' && node.locked ? '???' : node.label}
                </span>

                {/* Ending badge */}
                {node.type === 'ending' && status === 'visited' && (
                    <span style={{
                        marginTop: '0.2rem',
                        fontSize: '0.5rem',
                        padding: '0.1rem 0.3rem',
                        background: getEndingColor(),
                        color: '#000',
                        borderRadius: '0.2rem',
                        fontWeight: 600
                    }}>
                        FINAL
                    </span>
                )}
            </motion.div>
        </div>
    );
}

// Connection line component
function Connection({ from, to, status }) {
    const getLineStyle = () => {
        const base = {
            stroke: status === 'visited' ? '#a78bfa' : (
                status === 'available' ? 'rgba(255,255,255,0.3)' : 'rgba(100,116,139,0.2)'
            ),
            strokeWidth: status === 'visited' ? 3 : 2,
            strokeDasharray: status === 'available' ? '8,4' : 'none',
            filter: status === 'visited' ? 'drop-shadow(0 0 4px rgba(167,139,250,0.6))' : 'none'
        };
        return base;
    };

    return (
        <line
            x1={`${from.x}%`}
            y1={`${from.y}%`}
            x2={`${to.x}%`}
            y2={`${to.y}%`}
            style={getLineStyle()}
        />
    );
}

export default function RouteMap({ isOpen, onClose, storyId, currentNodeId = 'start', onNavigateToNode }) {
    const { getVisitedNodes, getUnlockedEndings } = useUserProgress();
    const [selectedNode, setSelectedNode] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const containerRef = useRef(null);

    if (!isOpen) return null;

    const tree = STORY_TREE[storyId] || STORY_TREE['1'];
    const visitedNodes = getVisitedNodes(storyId || '1');
    const unlockedEndings = getUnlockedEndings(storyId || '1');

    // Determine node status based on visited nodes
    const getNodeStatus = (node) => {
        if (node.id === currentNodeId) return 'current';
        if (visitedNodes.has(node.id)) return 'visited';
        if (node.type === 'ending' && unlockedEndings.has(node.id)) return 'visited';
        if (node.locked && !visitedNodes.has(node.id)) return 'locked';
        // Check if parent is visited (node is available)
        const parent = tree.nodes.find(n => n.children?.includes(node.id));
        if (parent && visitedNodes.has(parent.id)) return 'available';
        return 'locked';
    };

    // Get connection status based on both nodes being visited
    const getConnectionStatus = (fromNode, toNode) => {
        const fromVisited = visitedNodes.has(fromNode.id) || fromNode.id === currentNodeId;
        const toVisited = visitedNodes.has(toNode.id) || toNode.id === currentNodeId;

        if (fromVisited && toVisited) return 'visited';
        if (fromVisited) return 'available';
        return 'locked';
    };

    // Count endings
    const endingsUnlocked = tree.nodes.filter(n => n.type === 'ending' && (visitedNodes.has(n.id) || unlockedEndings.has(n.id))).length;
    const progressPercent = Math.round((endingsUnlocked / tree.totalEndings) * 100);

    const handleNodeClick = (node) => {
        if (getNodeStatus(node) === 'visited' || getNodeStatus(node) === 'current') {
            setSelectedNode(node);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: '#0f172a',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Grid background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
          linear-gradient(rgba(100,116,139,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100,116,139,0.05) 1px, transparent 1px)
        `,
                backgroundSize: '2rem 2rem',
                pointerEvents: 'none'
            }} />

            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(15,23,42,0.9)',
                backdropFilter: 'blur(8px)',
                zIndex: 20
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '0.4rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                    }}
                >
                    ✕ CERRAR
                </button>

                <h2 style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>
                    🗺️ MAPA DE TRAMA
                </h2>

                {/* Spacer to balance header */}
                <div style={{ width: '5rem' }} />
            </header>

            {/* Tree container */}
            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'auto',
                    padding: '2rem'
                }}
            >
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '30rem',
                    minHeight: '100%'
                }}>
                    {/* SVG for connections */}
                    <svg style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                    }}>
                        {tree.nodes.map(node =>
                            node.children?.map(childId => {
                                const childNode = tree.nodes.find(n => n.id === childId);
                                if (!childNode) return null;
                                return (
                                    <Connection
                                        key={`${node.id}-${childId}`}
                                        from={node}
                                        to={childNode}
                                        status={getConnectionStatus(node, childNode)}
                                    />
                                );
                            })
                        )}
                    </svg>

                    {/* Nodes */}
                    {tree.nodes.map(node => (
                        <TreeNode
                            key={node.id}
                            node={node}
                            status={getNodeStatus(node)}
                            isCurrentNode={node.id === currentNodeId}
                            onClick={handleNodeClick}
                        />
                    ))}
                </div>
            </div>

            {/* Footer with progress */}
            <footer style={{
                padding: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(15,23,42,0.9)',
                backdropFilter: 'blur(8px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                        Progreso: {endingsUnlocked}/{tree.totalEndings} Finales Desbloqueados
                    </span>
                    <span style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600 }}>
                        {progressPercent}%
                    </span>
                </div>
                <div style={{
                    height: '0.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '1rem',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        style={{
                            height: '100%',
                            background: progressPercent === 100
                                ? 'linear-gradient(90deg, #22c55e, #10b981)'
                                : 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                            borderRadius: '1rem',
                            boxShadow: '0 0 10px rgba(139,92,246,0.5)'
                        }}
                    />
                </div>
            </footer>

            {/* Node detail popup */}
            <AnimatePresence>
                {selectedNode && !showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(30,27,75,0.98)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 1rem 3rem rgba(0,0,0,0.5)',
                            zIndex: 100,
                            minWidth: '16rem',
                            textAlign: 'center'
                        }}
                    >
                        <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>
                            {selectedNode.label}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                            {selectedNode.type === 'ending' ? 'Final desbloqueado' :
                                selectedNode.id === currentNodeId ? 'Posición actual' : 'Nodo visitado'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedNode(null); }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                Cerrar
                            </button>
                            {selectedNode.id !== currentNodeId && selectedNode.type !== 'ending' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowConfirmation(true); }}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: 500
                                    }}
                                >
                                    ↩️ Volver aquí
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation warning popup */}
            <AnimatePresence>
                {showConfirmation && selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(30,27,75,0.98)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            border: '1px solid rgba(239,68,68,0.3)',
                            boxShadow: '0 1rem 3rem rgba(0,0,0,0.5), 0 0 20px rgba(239,68,68,0.2)',
                            zIndex: 100,
                            maxWidth: '20rem',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                        <h3 style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '0.75rem' }}>
                            ¿Volver a "{selectedNode.label}"?
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                            Si aún no has completado este camino, <strong style={{ color: '#ef4444' }}>perderás los puntos</strong> ganados desde este punto.
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginBottom: '1rem' }}>
                            Los nodos ya visitados no dan puntos extra.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowConfirmation(false);
                                    setSelectedNode(null);
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onNavigateToNode) {
                                        onNavigateToNode(selectedNode.id);
                                    }
                                    setShowConfirmation(false);
                                    setSelectedNode(null);
                                    onClose();
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'linear-gradient(135deg, #f97316, #ef4444)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}
                            >
                                Sí, volver
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend overlay */}
            <div style={{
                position: 'absolute',
                bottom: '5rem',
                left: '1rem',
                background: 'rgba(15,23,42,0.9)',
                backdropFilter: 'blur(8px)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.65rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <span style={{ width: '0.8rem', height: '0.8rem', borderRadius: '50%', border: '2px solid #facc15', background: 'rgba(250,204,21,0.2)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Actual</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <span style={{ width: '0.8rem', height: '0.8rem', borderRadius: '50%', border: '2px solid #a78bfa', background: 'rgba(139,92,246,0.3)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Visitado</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <span style={{ width: '0.8rem', height: '0.8rem', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.4)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Disponible</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '0.8rem', height: '0.8rem', borderRadius: '50%', border: '2px solid rgba(100,116,139,0.4)', background: 'rgba(100,116,139,0.2)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Bloqueado</span>
                </div>
            </div>
        </motion.div>
    );
}
