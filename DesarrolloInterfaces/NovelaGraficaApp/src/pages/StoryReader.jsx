import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoryEngine } from '../engine/StoryEngine';
import VisualNovelCanvas from '../components/VisualNovelCanvas';
import DestinyTreeModal from '../components/DestinyTreeModal';
import SettingsModal from '../components/SettingsModal';

export default function StoryReader() {
    const { seriesId } = useParams();
    const navigate = useNavigate();

    // Connect to the new Central Brain
    const { currentNode, loading, handleChoice, history, rewindTo, loadJsonStory, storyNodes } = useStoryEngine(seriesId);

    // Initial Load Effect for JSON Stories
    const [init, setInit] = useState(false);
    if (!init && seriesId && seriesId.startsWith('json:')) {
        const themeName = seriesId.replace('json:', '');
        loadJsonStory(themeName);
        setInit(true);
    }

    // Local UI State
    const [showMap, setShowMap] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

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
            />

            {/* OVERLAY: Route Map Modal (Neural Map) */}
            <DestinyTreeModal
                isOpen={showMap}
                onClose={() => setShowMap(false)}
                storyId={seriesId}
                currentNodeId={currentNode.id}
                history={history}
                externalNodes={storyNodes}
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

        </div>
    );
}
