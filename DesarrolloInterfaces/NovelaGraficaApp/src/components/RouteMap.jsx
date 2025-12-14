import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';
import { StoryRepository } from '../services/StoryRepository';

const repo = new StoryRepository();

// Node component with dynamic styles
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
                    border: '3px solid var(--color-accent)',
                    boxShadow: '0 0 20px rgba(250,204,21,0.6)',
                    color: 'var(--color-accent)'
                };
            case 'visited':
                return {
                    ...base,
                    background: 'rgba(139,92,246,0.3)',
                    border: '2px solid var(--color-secondary)',
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

    return (
        <div
            style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10
            }}
        >
            <motion.div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: status !== 'locked' ? 'pointer' : 'default'
                }}
                whileHover={status !== 'locked' ? { scale: 1.15 } : {}}
                onClick={() => status !== 'locked' && onClick?.(node)}
            >
                <motion.div style={getCircleStyle()}>
                    <span style={{ transform: node.type === 'ending' ? 'rotate(-45deg)' : 'none' }}>
                        {status === 'locked' ? '🔒' : (node.type === 'ending' ? (status === 'visited' ? '🏆' : '💎') : (status === 'visited' ? '✓' : '•'))}
                    </span>
                </motion.div>
                <span style={{
                    marginTop: '0.4rem',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    color: status === 'locked' ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                    textShadow: status !== 'locked' ? '0 0 10px rgba(0,0,0,0.8)' : 'none',
                    whiteSpace: 'nowrap'
                }}>
                    {status === 'locked' ? '???' : node.label}
                </span>
            </motion.div>
        </div>
    );
}

// Connection line
function Connection({ from, to, status }) {
    const getLineStyle = () => {
        return {
            stroke: status === 'visited' ? 'var(--color-secondary)' : (status === 'available' ? 'rgba(255,255,255,0.3)' : 'rgba(100,116,139,0.2)'),
            strokeWidth: status === 'visited' ? 3 : 2,
            strokeDasharray: status === 'available' ? '8,4' : 'none',
            filter: status === 'visited' ? 'drop-shadow(0 0 4px rgba(167,139,250,0.6))' : 'none'
        };
    };

    return (
        <line x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`} style={getLineStyle()} />
    );
}

export default function RouteMap({ isOpen, onClose, storyId, currentNodeId = 'start', onNavigateToNode }) {
    const { getVisitedNodes, getUnlockedEndings } = useUserProgress();
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Fetch nodes on tree open
    useEffect(() => {
        if (!isOpen) return;

        async function loadTree() {
            try {
                // Ensure storyId is valid
                const safeStoryId = storyId || '1';
                console.log("DEBUG: Loading tree for storyId:", safeStoryId);

                // Add a small delay/loading state if needed, but for now direct call
                const data = await repo.getAllNodesBySeries(safeStoryId);
                console.log("DEBUG: Raw data from repo:", data);

                if (!data || data.length === 0) {
                    console.warn("DEBUG: No nodes returned from repo!");
                    setNodes([]);
                    return;
                }

                const processed = layoutNodes(data);
                console.log("DEBUG: Processed layout nodes:", processed);
                setNodes(processed);
            } catch (err) {
                console.error("DEBUG: Error loading tree:", err);
            }
        }
        loadTree();
    }, [isOpen, storyId]);

    // Generic layout function
    const layoutNodes = (rawData) => {
        if (!rawData || !rawData.length) return [];

        const levels = {};
        // Find start node - handles both demo 'start' and potentially other IDs
        const startNode = rawData.find(n => n.id === 'start') || rawData[0];

        const queue = [{ id: startNode.id, level: 0 }];
        const visited = new Set();
        const nodeMap = {};
        rawData.forEach(n => nodeMap[n.id] = n);

        const processedIds = new Set();

        while (queue.length > 0) {
            const { id, level } = queue.shift();
            if (visited.has(id)) continue;
            visited.add(id);

            if (!levels[level]) levels[level] = [];
            levels[level].push(id);
            processedIds.add(id);

            const node = nodeMap[id];
            if (node && node.children) {
                node.children.forEach(childId => {
                    // Check if child actually exists in our data
                    if (nodeMap[childId]) {
                        queue.push({ id: childId, level: level + 1 });
                    }
                });
            }
        }

        // Handle orphan nodes (not connected to start) - place them at bottom or ignore
        // For now, let's include them in a 'lost+found' level if any important ones are missed?
        // Simpler: Just rely on BFS from start.

        const finalNodes = [];

        // If BFS didn't find anything (disconnected start?), fallback to linear
        if (Object.keys(levels).length === 0) {
            return rawData.map((n, i) => ({ ...n, x: 50, y: 10 + (i * 10) }));
        }

        const maxLevel = Math.max(...Object.keys(levels).map(Number));

        Object.keys(levels).forEach(lvl => {
            const layerNodes = levels[lvl];
            const layerHeight = 80 / (maxLevel + 1);
            const y = 10 + (Number(lvl) * layerHeight);

            layerNodes.forEach((nid, idx) => {
                const x = (100 / (layerNodes.length + 1)) * (idx + 1);
                finalNodes.push({
                    ...nodeMap[nid],
                    x,
                    y
                });
            });
        });

        return finalNodes;
    };

    if (!isOpen) return null;

    const visitedNodes = getVisitedNodes(storyId || '1');
    const unlockedEndings = getUnlockedEndings(storyId || '1');
    const totalEndings = nodes.filter(n => n.type === 'ending').length || 1;
    const endingsUnlocked = nodes.filter(n => n.type === 'ending' && (visitedNodes.has(n.id) || unlockedEndings.has(n.id))).length;
    const progressPercent = Math.round((endingsUnlocked / totalEndings) * 100);

    const getNode = (id) => nodes.find(n => n.id === id);


    // Determine node status based on visited nodes
    const getNodeStatus = (node) => {
        if (node.id === currentNodeId) return 'current';
        if (visitedNodes.has(node.id)) return 'visited';
        if (node.type === 'ending' && unlockedEndings.has(node.id)) return 'visited';
        if (node.locked && !visitedNodes.has(node.id)) return 'locked';

        // Check availability strictly based on processed nodes parents
        const parent = nodes.find(n => n.children?.includes(node.id));
        if (parent && visitedNodes.has(parent.id)) return 'available';

        return 'locked';
    };

    const handleNodeClick = (node) => {
        if (getNodeStatus(node) === 'visited' || getNodeStatus(node) === 'current') {
            setSelectedNode(node);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, background: 'var(--color-bg-dark)', zIndex: 1000,
                display: 'flex', flexDirection: 'column'
            }}
        >
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(var(--color-bg-card) 2px, transparent 0)',
                backgroundSize: '30px 30px', opacity: 0.1
            }} />

            <header style={{ padding: '1rem', borderBottom: '1px solid var(--color-primary)', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={onClose} style={{ color: 'white', background: 'none', border: '1px solid white', padding: '0.5rem' }}>CERRAR MAPA</button>
                <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>MAPA DE RUTAS</h2>
                <div style={{ width: 100 }}></div>
            </header>

            <div style={{ flex: 1, position: 'relative' }}>
                {nodes.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
                        <p>Cargando mapa o sin datos disponibles...</p>
                    </div>
                ) : (
                    <>
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                            {nodes.map(node =>
                                node.children?.map(childId => {
                                    const child = getNode(childId);
                                    if (!child) return null;
                                    return <Connection key={`${node.id}-${childId}`} from={node} to={child} status={visitedNodes.has(node.id) && visitedNodes.has(childId) ? 'visited' : 'locked'} />;
                                })
                            )}
                        </svg>
                        {nodes.map(node => (
                            <TreeNode
                                key={node.id}
                                node={node}
                                status={getNodeStatus(node)}
                                isCurrentNode={node.id === currentNodeId}
                                onClick={handleNodeClick}
                            />
                        ))}
                    </>
                )}
            </div>

            <footer style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)' }}>
                <div style={{ color: 'white', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Finales: {endingsUnlocked}/{totalEndings}</span>
                    <span>{progressPercent}% Completado</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: 2 }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 2 }}></div>
                </div>
            </footer>

            {/* Legend Overlay */}
            <div style={{ position: 'absolute', bottom: '5rem', left: '1rem', background: 'rgba(0,0,0,0.8)', padding: '1rem', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-accent)' }}></div>
                    <span style={{ color: 'white', fontSize: '0.8rem' }}>Actual</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--color-secondary)' }}></div>
                    <span style={{ color: 'white', fontSize: '0.8rem' }}>Visitado</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px dashed white' }}></div>
                    <span style={{ color: 'white', fontSize: '0.8rem' }}>Disponible</span>
                </div>
            </div>

            {/* Detail Popup */}
            <AnimatePresence>
                {selectedNode && !showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            background: 'var(--color-bg-dark)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--color-primary)',
                            textAlign: 'center', minWidth: 300
                        }}
                    >
                        <h3 style={{ color: 'white' }}>{selectedNode.label}</h3>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                            <button onClick={() => setSelectedNode(null)} style={{ padding: '0.5rem 1rem', background: '#333', color: 'white', border: 'none', borderRadius: '0.5rem' }}>Cerrar</button>
                            {selectedNode.id !== currentNodeId && selectedNode.type !== 'ending' && (
                                <button onClick={() => setShowConfirmation(true)} style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: 'black', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold' }}>Saltar Aquí</button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Popup */}
            <AnimatePresence>
                {showConfirmation && selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            background: 'var(--color-bg-dark)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--color-danger)',
                            textAlign: 'center', minWidth: 300
                        }}
                    >
                        <h3 style={{ color: 'var(--color-danger)' }}>⚠️ ¿Viaje Rápido?</h3>
                        <p style={{ color: 'white', fontSize: '0.9rem' }}>Perderás los puntos acumulados en la rama actual.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                            <button onClick={() => setShowConfirmation(false)} style={{ padding: '0.5rem 1rem', background: '#333', color: 'white', border: 'none', borderRadius: '0.5rem' }}>Cancelar</button>
                            <button
                                onClick={() => {
                                    if (onNavigateToNode) onNavigateToNode(selectedNode.id);
                                    setShowConfirmation(false);
                                    setSelectedNode(null);
                                    onClose();
                                }}
                                style={{ padding: '0.5rem 1rem', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold' }}
                            >
                                Confirmar Salto
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
