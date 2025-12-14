import { useEffect, useState, useRef } from 'react';
import { useStoryEngine } from '../engine/StoryEngine';
import { StoryRepository } from '../services/StoryRepository';

const repo = new StoryRepository();

export default function DestinyTreeModal({ isOpen, onClose, storyId, currentNodeId, onNavigateToNode, history = [], onRewind }) {
    const [nodes, setNodes] = useState([]);
    const [layout, setLayout] = useState({});
    const containerRef = useRef(null);

    // 1. Fetch Data
    useEffect(() => {
        if (isOpen && storyId) {
            const loadTree = async () => {
                const allNodes = await repo.getAllNodesBySeries(storyId);
                // Perform layouting
                const computedLayout = computeTreeLayout(allNodes, 'start');
                setNodes(allNodes);
                setLayout(computedLayout);
            };
            loadTree();
        }
    }, [isOpen, storyId]);

    // Auto-center on open
    useEffect(() => {
        if (nodes.length > 0 && currentNodeId && containerRef.current) {
            const pos = layout[currentNodeId];
            if (pos) {
                // Simple center logic
                containerRef.current.scrollTo({
                    left: pos.x - containerRef.current.clientWidth / 2 + 50,
                    top: pos.y - containerRef.current.clientHeight / 2 + 50,
                    behavior: 'smooth'
                });
            }
        }
    }, [nodes, currentNodeId, layout, isOpen]);

    // 2. BFS Layout Algorithm (Simplified for visualization)
    const computeTreeLayout = (nodes, rootId) => {
        const positions = {};
        // Mock layout: Grid based on index for robustness in this phase
        // Real implementation would use Dagre/D3
        const levels = {};

        let maxX = 0;
        nodes.forEach((node, idx) => {
            // Create a pseudo-tree visual
            // Root at top center
            // Children spread out
            // For now, using a simple grid fallback to ensure visibility of all nodes
            const col = idx % 3;
            const row = Math.floor(idx / 3);

            // Spread them out more
            positions[node.id] = {
                x: col * 200 + 400 - (row * 50), // Staggered
                y: row * 180 + 100
            };
        });

        return positions;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10 pointer-events-none">
                <div className="pointer-events-auto">
                    <h2 className="text-yellow-500 font-mono tracking-widest text-sm border border-yellow-500/30 px-3 py-1 bg-slate-900 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                        NEURAL_MAP::V1.0
                    </h2>
                </div>
                <button onClick={onClose} className="pointer-events-auto text-white hover:text-red-400 font-bold tracking-wider">[ CLOSE ]</button>
            </div>

            {/* Canvas Area */}
            <div
                ref={containerRef}
                className="relative w-full h-full overflow-auto cursor-grab active:cursor-grabbing"
                style={{
                    backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    backgroundColor: '#020617'
                }}
            >
                <div className="absolute inset-0 min-w-[1500px] min-h-[1500px]">
                    {/* Render Connections (SVG Layer) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                        {nodes.map(node => {
                            const fromPos = layout[node.id];
                            if (!fromPos || !node.children) return null;
                            return node.children.map(childId => {
                                const toPos = layout[childId];
                                if (!toPos) return null;
                                return (
                                    <line
                                        key={`${node.id}-${childId}`}
                                        x1={fromPos.x + 48} y1={fromPos.y + 48} // Center of 24x24 (w-24=6rem=96px? No w-24 is 6rem=96px. Center is 48)
                                        x2={toPos.x + 48} y2={toPos.y + 48}
                                        stroke="#fbbf24"
                                        strokeWidth="2"
                                    />
                                );
                            });
                        })}
                    </svg>

                    {/* Render Nodes */}
                    {nodes.map(node => {
                        const pos = layout[node.id] || { x: 0, y: 0 };

                        // Status Logic
                        const isCurrent = node.id === currentNodeId;
                        const isVisited = history.includes(node.id);
                        // Available only if parent is visited? For now show all structure but locked state
                        const isAvailable = true; // In full map, we might hide future nodes.

                        let status = 'locked';
                        if (isCurrent) status = 'current';
                        else if (isVisited) status = 'visited';
                        else if (isAvailable) status = 'locked'; // Use 'locked' for future/unvisited for now

                        return (
                            <NodeComponent
                                key={node.id}
                                node={node}
                                x={pos.x}
                                y={pos.y}
                                status={status}
                                onClick={() => {
                                    if (isVisited && !isCurrent) {
                                        onRewind && onRewind(node.id);
                                    } else if (status === 'locked') {
                                        // Do nothing or shake
                                    }
                                }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 p-3 bg-slate-900/80 border border-white/10 rounded text-xs text-slate-400 space-y-1 backdrop-blur-sm pointer-events-none">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span> Actual</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-white bg-slate-800"></span> Visitado (Rebobinar)</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-slate-600 border-dashed bg-slate-900"></span> Desconocido</div>
            </div>
        </div>
    );
}

// BATCH 9: Specific Node Implementation
const NodeComponent = ({ node, x, y, status, onClick }) => {
    // Styles from Batch 9
    const styles = {
        current: "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-110 bg-slate-900 z-20 cursor-default",
        visited: "border-white bg-slate-800 opacity-100 hover:scale-105 hover:border-yellow-200 cursor-pointer z-10",
        locked: "border-slate-700 bg-slate-950 opacity-40 border-dashed cursor-not-allowed z-0"
    };

    return (
        <div
            className={`absolute w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${styles[status]}`}
            style={{ left: x, top: y }}
            onClick={onClick}
        >
            {status === 'locked' ? (
                <span className="text-xl text-slate-600">?</span>
            ) : (
                <div className="text-center p-1 w-full flex flex-col items-center">
                    {/* Icon or Mini-image could go here */}
                    <span className="text-[10px] uppercase font-bold text-white/90 drop-shadow-md leading-tight max-w-[90%] truncate">
                        {node.label || "Escena"}
                    </span>
                    <span className="text-[9px] text-white/50">{node.id.slice(0, 4)}</span>

                    {/* Pulse Animation for Current */}
                    {status === 'current' && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                            <div className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-bounce">
                                AQUÍ
                            </div>
                        </div>
                    )}

                    {/* Tooltip for Visited */}
                    {status === 'visited' && (
                        <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black text-white text-[9px] px-1 rounded">
                            Click to Rewind
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
