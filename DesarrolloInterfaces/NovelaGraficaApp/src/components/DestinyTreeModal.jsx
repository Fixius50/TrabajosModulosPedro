import { useEffect, useState, useRef } from 'react';
import { useStoryEngine } from '../engine/StoryEngine';
import { StoryRepository } from '../services/StoryRepository';

const repo = new StoryRepository();

export default function DestinyTreeModal({ isOpen, onClose, storyId, currentNodeId, onNavigateToNode, history = [], onRewind, externalNodes }) {
    const [nodes, setNodes] = useState([]);
    const [layout, setLayout] = useState({});
    const containerRef = useRef(null);

    // 1. Fetch Data
    useEffect(() => {
        if (isOpen) {
            const loadTree = async () => {
                let allNodes = [];
                if (externalNodes && Object.keys(externalNodes).length > 0) {
                    // Check if externalNodes is already an array or object
                    allNodes = Array.isArray(externalNodes) ? externalNodes : Object.values(externalNodes);
                } else if (storyId) {
                    allNodes = await repo.getAllNodesBySeries(storyId);
                }

                // Perform layouting
                const computedLayout = computeTreeLayout(allNodes, 'start');
                setNodes(allNodes);
                setLayout(computedLayout);
            };
            loadTree();
        }
    }, [isOpen, storyId, externalNodes]);

    // Auto-center on open
    useEffect(() => {
        if (nodes.length > 0 && currentNodeId && containerRef.current) {
            const pos = layout[currentNodeId];
            if (pos) {
                containerRef.current.scrollTo({
                    left: pos.x - containerRef.current.clientWidth / 2 + 50,
                    top: pos.y - containerRef.current.clientHeight / 2 + 50,
                    behavior: 'smooth'
                });
            }
        }
    }, [nodes, currentNodeId, layout, isOpen]);

    // --- DRAG TO PAN LOGIC ---
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartPos({ x: e.pageX, y: e.pageY });
        setScrollPos({
            x: containerRef.current.scrollLeft,
            y: containerRef.current.scrollTop
        });
        containerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.pageX - startPos.x;
        const dy = e.pageY - startPos.y;
        containerRef.current.scrollLeft = scrollPos.x - dx;
        containerRef.current.scrollTop = scrollPos.y - dy;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
    };

    // --- LAYOUT ALGORITHM ---
    const computeTreeLayout = (allNodes, rootId = 'start') => {
        const positions = {};
        if (!allNodes || allNodes.length === 0) return positions;

        const nodeMap = {};
        allNodes.forEach(n => nodeMap[n.id] = n);

        let actualRootId = rootId;
        if (!nodeMap[rootId]) {
            actualRootId = allNodes[0]?.id;
        }

        const levels = {};
        const queue = [{ id: actualRootId, level: 0 }];
        const visited = new Set();

        while (queue.length > 0) {
            const { id, level } = queue.shift();
            if (visited.has(id) || !nodeMap[id]) continue;
            visited.add(id);

            if (!levels[level]) levels[level] = [];
            levels[level].push(id);

            const node = nodeMap[id];
            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(childId => {
                    queue.push({ id: childId, level: level + 1 });
                });
            }
        }

        allNodes.forEach(node => {
            if (!visited.has(node.id)) {
                const orphanLevel = 99;
                if (!levels[orphanLevel]) levels[orphanLevel] = [];
                levels[orphanLevel].push(node.id);
                visited.add(node.id);
            }
        });

        const HEADER_OFFSET = 100;
        const LEVEL_HEIGHT = 180;
        const CANVAS_CENTER_X = 1500; // Increased base center for panning space

        Object.keys(levels).forEach(lvl => {
            const levelNodes = levels[lvl];
            const count = levelNodes.length;
            const levelNum = parseInt(lvl);

            const TOTAL_WIDTH = Math.max(800, count * 150);
            const startX = CANVAS_CENTER_X - (TOTAL_WIDTH / 2);
            const gap = TOTAL_WIDTH / (count + 1);

            levelNodes.forEach((nodeId, idx) => {
                positions[nodeId] = {
                    x: startX + (gap * (idx + 1)),
                    y: HEADER_OFFSET + (levelNum * LEVEL_HEIGHT)
                };
            });
        });

        return positions;
    };

    const [showLegend, setShowLegend] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#020617] text-slate-200 font-sans flex flex-col">

            {/* Header */}
            <div className="h-14 border-b border-white/10 bg-[#0f172a] flex items-center justify-between px-4 shadow-lg z-50">
                <button
                    onClick={onClose}
                    className="bg-[#1e293b] hover:bg-[#334155] px-3 py-1.5 rounded text-xs font-bold tracking-wider transition-colors border border-white/5"
                >
                    ✕ CERRAR
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-cyan-400">📖</span>
                    <h2 className="text-sm font-bold tracking-[0.2em] text-cyan-50">MAPA NEURONAL</h2>
                </div>
                <button
                    onClick={() => setShowLegend(!showLegend)}
                    className="bg-[#1e293b] hover:bg-[#334155] px-3 py-1.5 rounded text-xs font-bold tracking-wider transition-colors border border-white/5"
                >
                    ? LEYENDA
                </button>
            </div>

            {/* Main Map Area */}
            <div className="flex-1 relative overflow-hidden bg-[#0a0f1e]">
                {/* Grid Background */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                <div
                    ref={containerRef}
                    className="w-full h-full overflow-auto cursor-grab relative scrollbar-hide"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div className="absolute inset-0 min-w-[3000px] min-h-[2000px]">

                        {/* Connecting Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {nodes.map(node => {
                                const fromPos = layout[node.id];
                                if (!fromPos || !node.children) return null;
                                return node.children.map(childId => {
                                    const toPos = layout[childId];
                                    if (!toPos) return null;

                                    // PATH HIGHLIGHT LOGIC
                                    // Check if this connection (node -> child) is in the history
                                    // History is [node1, node2, node3...]
                                    // We check if node.id is at index i and childId is at index i+1
                                    const nodeIndex = history.lastIndexOf(node.id);
                                    let isTraversed = false;
                                    if (nodeIndex !== -1 && nodeIndex < history.length - 1) {
                                        // If the next node in history matches the childId
                                        if (history[nodeIndex + 1] === childId) {
                                            isTraversed = true;
                                        }
                                    }

                                    return (
                                        <line
                                            key={`${node.id}-${childId}`}
                                            x1={(fromPos.x || 0) + 32}
                                            y1={(fromPos.y || 0) + 32}
                                            x2={toPos.x + 32}
                                            y2={toPos.y + 32}
                                            stroke={isTraversed ? "#facc15" : "#334155"} // Yellow if traversed
                                            strokeWidth={isTraversed ? "3" : "1"}
                                            strokeDasharray={isTraversed ? "0" : "4"}
                                            className={isTraversed ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all duration-500" : ""}
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

                            let status = 'locked';
                            if (isCurrent) status = 'current';
                            else if (isVisited) status = 'visited';

                            return (
                                <NodeComponent
                                    key={node.id}
                                    node={node}
                                    x={pos.x}
                                    y={pos.y}
                                    status={status}
                                    onClick={() => {
                                        if (isVisited && !isCurrent && onRewind) {
                                            if (window.confirm("¿Rebobinar a este punto?")) {
                                                onRewind(node.id);
                                            }
                                        }
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Legend Overlay */}
                {showLegend && (
                    <div className="absolute top-4 right-4 bg-[#0f172a] border border-white/10 p-4 rounded-lg shadow-xl text-xs space-y-3 z-50 min-w-[150px]">
                        <h4 className="font-bold text-slate-400 mb-2 border-b border-white/5 pb-2">Hitos del Mapa</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full border-2 border-yellow-500 bg-yellow-500/20"></div>
                            <span>Ubicación Actual</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full border border-slate-500 bg-slate-800"></div>
                            <span>Visitado (Rebobinar)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center text-[8px]">🔒</div>
                            <span className="text-slate-500">Bloqueado</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-0.5 bg-yellow-400 shadow-[0_0_5px_yellow]"></div>
                            <span>Ruta Tomada</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="h-10 bg-[#0f172a] border-t border-white/5 flex items-center px-4 justify-between text-[10px] text-slate-500">
                <span>Progreso: {Math.min(nodes.length, history.length)} / {nodes.length} Nodos Descubiertos</span>
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

const NodeComponent = ({ node, x, y, status, onClick }) => {
    const baseClass = "absolute w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-lg";

    let specificClass = "";
    let icon = null;

    switch (status) {
        case 'current':
            specificClass = "bg-[#0f172a] border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-110 cursor-default";
            icon = <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_#facc15]" />;
            break;
        case 'visited':
            specificClass = "bg-[#1e293b] border border-slate-500 hover:border-cyan-400 hover:scale-105 cursor-pointer";
            icon = <div className="w-2 h-2 bg-slate-400 rounded-full" />;
            break;
        case 'locked':
        default:
            specificClass = "bg-[#020617] border border-slate-800 opacity-60";
            icon = <span className="text-slate-700 text-xs">🔒</span>;
            break;
    }

    return (
        <div
            className={baseClass + " " + specificClass}
            style={{ left: x, top: y }}
            onClick={onClick}
        >
            {icon}
            <div className="absolute -top-5 w-40 text-center text-[9px] text-slate-400 truncate opacity-0 hover:opacity-100 transition-opacity">
                {status !== 'locked' ? (node.label || "Escena") : "???"}
            </div>
        </div>
    );
};
