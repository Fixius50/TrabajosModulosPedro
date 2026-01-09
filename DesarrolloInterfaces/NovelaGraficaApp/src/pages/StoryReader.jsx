import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoryEngine } from '../engine/StoryEngine';
import { useUserProgress } from '../stores/userProgress';
import VisualNovelCanvas from '../components/VisualNovelCanvas';
import DestinyTreeModal from '../components/DestinyTreeModal';
import SettingsModal from '../components/SettingsModal';

export default function StoryReader() {
    const { seriesId } = useParams();
    const navigate = useNavigate();

    // Connect to the new Central Brain
    const { currentNode, loading, handleChoice, history, rewindTo, loadJsonStory, storyNodes } = useStoryEngine(seriesId);
    const { completeRoute, unlockedRoutes } = useUserProgress();

    // Initial Load Effect for JSON Stories
    const [init, setInit] = useState(false);

    const isJson = seriesId && (
        seriesId.startsWith('json:') ||
        (seriesId.length < 30 && isNaN(seriesId))
    );

    if (!init && isJson) {
        const themeName = seriesId.replace('json:', '');
        loadJsonStory(themeName);
        setInit(true);
    }

    // Local UI State
    const [showMap, setShowMap] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Completion State
    const [showCompletion, setShowCompletion] = useState(false);
    const [completionData, setCompletionData] = useState(null);

    // Explicit Completion Handler
    const handleCompletion = () => {
        // Calculate Total Endings
        let totalEndings = 0;
        if (storyNodes && Object.keys(storyNodes).length > 0) {
            totalEndings = Object.values(storyNodes).filter(n =>
                (!n.choices || n.choices.length === 0 || n.choices[0]?.action === 'EXIT' || n.action === 'EXIT')
            ).length;
        }

        // Trigger Completion
        const result = completeRoute(seriesId, currentNode.id, totalEndings);

        if (result.reward > 0 || result.message) {
            setCompletionData(result);
            setShowCompletion(true);
        } else {
            // If no reward/new route (already done), still show modal or just exit? 
            // User requested modal "tras darle a terminar". So show it always.
            setCompletionData({ ...result, message: "Capítulo Finalizado" });
            setShowCompletion(true);
        }
    };

    // Loading State
    if (loading && !currentNode) {
        return (
            <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-yellow-500">
                <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
                <p className="font-mono text-sm tracking-widest animate-pulse">LOADING ENGINE v2...</p>
            </div>
        );
    }

    // Error State (Fallback)
    if (!currentNode) {
        return (
            <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-red-500">
                <p>Error: Node not found</p>
                <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 border border-red-500 text-white rounded hover:bg-red-500/20">
                    Return to Library
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-slate-950 overflow-hidden selection:bg-yellow-500/30">

            {/* CORE COMPONENT: Visual Novel Canvas */}
            <VisualNovelCanvas
                currentNode={currentNode}
                onChoiceSelect={handleChoice}
                onOpenMap={() => setShowMap(true)}
                onOpenSettings={() => setShowSettings(true)}
                onBack={() => navigate('/')}
                onComplete={handleCompletion}
            />

            {/* OVERLAY: Route Map Modal (Neural Map) */}
            <DestinyTreeModal
                isOpen={showMap}
                onClose={() => setShowMap(false)}
                storyId={seriesId}
                currentNodeId={currentNode.id}
                history={history}
                externalNodes={storyNodes && Object.keys(storyNodes).length > 0 ? storyNodes : undefined}
                unlockedRoutes={unlockedRoutes ? unlockedRoutes[seriesId] : undefined}
                onNavigateToNode={(nodeId) => {
                    handleChoice(nodeId);
                    setShowMap(false);
                }}
                onRewind={(nodeId) => {
                    if (window.confirm("¿Rebobinar a este punto? Perderás el progreso posterior.")) {
                        rewindTo(nodeId);
                        setShowMap(false);
                    }
                }}
            />

            {/* OVERLAY: Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            {/* OVERLAY: Completion Modal */}
            {showCompletion && completionData && (
                <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur flex items-center justify-center p-4">
                    <div className="bg-slate-900 border-2 border-yellow-500 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                        <div className="text-6xl mb-4">🏆</div>
                        <h2 className="text-3xl font-black text-white italic uppercase mb-2">
                            {completionData.isBonus ? '100% COMPLETADO' : 'RUTA FINALIZADA'}
                        </h2>
                        <p className="text-slate-400 mb-6">{completionData.message}</p>

                        <div className="bg-slate-800 rounded-xl p-4 mb-8">
                            <span className="block text-sm text-slate-500 uppercase font-bold">Recompensa</span>
                            <span className="text-4xl font-black text-yellow-400">+{completionData.reward} pts</span>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => { setShowCompletion(false); navigate('/'); }}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                            >
                                SALIR
                            </button>
                            <button
                                onClick={() => { setShowCompletion(false); setShowMap(true); }}
                                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                            >
                                VER MAPA
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
