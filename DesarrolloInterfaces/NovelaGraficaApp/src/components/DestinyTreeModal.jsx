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
        console.log("Modal: useEffect trigger. isOpen:", isOpen, "storyId:", storyId);
        if (isOpen && storyId) {
            const loadTree = async () => {
                console.log("Modal: Fetching nodes...");
                const allNodes = await repo.getAllNodesBySeries(storyId);
                console.log("Modal: Nodes received:", allNodes);
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

    const [showLegend, setShowLegend] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#020617] text-slate-200 font-sans flex flex-col">

            {/* 1. Header Navigation Bar */}
            <div className="h-14 border-b border-white/10 bg-[#0f172a] flex items-center justify-between px-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-50">
                {/* Left: Close */}
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] px-3 py-1.5 rounded text-xs font-bold tracking-wider transition-colors border border-white/5"
                >
                    ✕ CERRAR
                </button>

                {/* Center: Title */}
                <div className="flex items-center gap-2">
                    <span className="text-cyan-400">📖</span>
                    <h2 className="text-sm font-bold tracking-[0.2em] text-cyan-50">MAPA DE TRAMA</h2>
                </div>

                {/* Right: Legend Toggle */}
                <button
                    onClick={() => setShowLegend(!showLegend)}
                    className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] px-3 py-1.5 rounded text-xs font-bold tracking-wider transition-colors border border-white/5"
                >
                    ? LEYENDA
                </button>
            </div>

            {/* 2. Main Map Area (Grid Background) */}
            <div className="flex-1 relative overflow-hidden bg-[#0a0f1e]">
                {/* CSS Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                <div
                    ref={containerRef}
                    className="w-full h-full overflow-auto cursor-grab active:cursor-grabbing relative scrollbar-hide"
                >
                    <div className="absolute inset-0 min-w-[2000px] min-h-[1500px]">

                        {/* Empty State */}
                        {nodes.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="text-yellow-500/50 font-mono text-xl animate-pulse tracking-widest">
                                    [ WAITING FOR NEURAL LINK... ]
                                </div>
                            </div>
                        )}

                        {/* Connecting Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {nodes.map(node => {
                                const fromPos = layout[node.id];
                                if (!fromPos || !node.children) return null;
                                return node.children.map(childId => {
                                    const toPos = layout[childId];
                                    if (!toPos) return null;
                                    return (
                                        <line
                                            key={`${node.id}-${childId}`}
                                            x1={fromPos.x + 32} y1={fromPos.y + 32} // Center of w-16 (64px) -> 32
                                            x2={toPos.x + 32} y2={toPos.y + 32}
                                            stroke="#334155"
                                            strokeWidth="1"
                                            strokeDasharray="0"
                                        />
                                    );
                                });
                            })}
                        </svg>

                        {/* Nodes */}
                        {nodes.map(node => {
                            const pos = layout[node.id] || { x: 0, y: 0 };
                            const isCurrent = node.id === currentNodeId;
                            const isVisited = history.includes(node.id);

                            // Status mapping
                            let status = 'locked';
                            if (isCurrent) status = 'current';
                            else if (isVisited) status = 'visited';
                            else status = 'locked'; // Default to locked/unknown for unvisited

                            return (
                                <NodeComponent
                                    key={node.id}
                                    node={node}
                                    x={pos.x}
                                    y={pos.y}
                                    status={status}
                                    onClick={() => {
                                        if (isVisited && !isCurrent && onRewind) {
                                            onRewind(node.id);
                                        }
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Legend Overlay (Conditional) */}
                {showLegend && (
                    <div className="absolute top-4 right-4 bg-[#0f172a] border border-white/10 p-4 rounded-lg shadow-xl text-xs space-y-3 z-50 min-w-[150px]">
                        <h4 className="font-bold text-slate-400 mb-2 border-b border-white/5 pb-2">Hitos del Mapa</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full border-2 border-yellow-500 bg-yellow-500/20"></div>
                            <span>Ubicación Actual</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full border border-slate-500 bg-slate-800"></div>
                            <span>Visitado</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center text-[8px]">🔒</div>
                            <span className="text-slate-500">Bloqueado</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Footer / Progress Bar */}
            <div className="h-10 bg-[#0f172a] border-t border-white/5 flex items-center px-4 justify-between text-[10px] text-slate-500">
                <span>Progreso: {Math.min(nodes.length, history.length)} / {nodes.length} Nodos Descubiertos</span>

                {/* Custom Progress Bar */}
                <div className="w-1/3 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                        style={{ width: `${(Math.min(nodes.length, history.length) / Math.max(nodes.length, 1)) * 100}%` }}
                    />
                </div>

                <span>{Math.round((Math.min(nodes.length, history.length) / Math.max(nodes.length, 1)) * 100)}%</span>
            </div>
        </div>
    );
}

// Sub-component: Clean RPG Node
const NodeComponent = ({ node, x, y, status, onClick }) => {
    // Styles
    const baseClass = "absolute w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-lg";

    let specificClass = "";
    let icon = null;
    let labelClass = "text-slate-500 opacity-50";

    switch (status) {
        case 'current':
            specificClass = "bg-[#0f172a] border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-110 cursor-default";
            icon = <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_#facc15]" />;
            labelClass = "text-yellow-400 font-bold opacity-100";
            break;
        case 'visited':
            specificClass = "bg-[#1e293b] border border-slate-500 hover:border-cyan-400 hover:scale-105 cursor-pointer";
            icon = <div className="w-2 h-2 bg-slate-400 rounded-full" />;
            labelClass = "text-slate-300 opacity-100";
            break;
        case 'locked':
        default:
            specificClass = "bg-[#020617] border border-slate-800 opacity-60";
            icon = <span className="text-slate-700 text-xs">🔒</span>;
            labelClass = "text-slate-700 opacity-40";
            break;
    }

    return (
        <div
            className={baseClass + " " + specificClass}
            style={{ left: x, top: y }}
            onClick={onClick}
        >
            {/* Inner Icon */}
            {icon}

            {/* Floating Label (Bottom) */}
            <div className={`absolute -bottom-6 w-32 text-center text-[10px] uppercase tracking-wide truncate ${labelClass}`}>
                {status === 'current' ? (
                    <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">AQUÍ</span>
                ) : (
                    node.label || "???"
                )}
            </div>

            {/* Top Label (Name) if visited */}
            {status !== 'locked' && (
                <div className="absolute -top-5 w-40 text-center text-[9px] text-slate-400 truncate">
                    {node.label || "Escena"}
                </div>
            )}
        </div>
    );
};
