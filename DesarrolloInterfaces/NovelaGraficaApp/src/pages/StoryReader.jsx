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
    const { currentNode, loading, handleChoice, history, rewindTo } = useStoryEngine(seriesId);

    // Local UI State
    const [showMap, setShowMap] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Loading State
    if (loading && !currentNode) {
        return (
            <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-yellow-500">
                <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
                <p className="font-mono text-sm tracking-widest animate-pulse">LOADING ENGINE...</p>
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
            />

            {/* OVERLAY: Floating HUD (Zone 3 System) */}
            <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between z-50 pointer-events-none">
                {/* Left Controls */}
                <div className="pointer-events-auto flex gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
                        title="Back to Library"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
                        title="Settings"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                </div>

                {/* Right Controls */}
                <div className="pointer-events-auto flex gap-3">
                    <button
                        onClick={() => setShowMap(true)}
                        className="p-2 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white/80 hover:text-yellow-400 hover:border-yellow-400/50 hover:bg-yellow-400/10 transition-all hover:scale-105 animate-pulse"
                        title="Neural Map"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    </button>
                </div>
            </div>

            {/* OVERLAY: Route Map Modal (Neural Map) */}
            <DestinyTreeModal
                isOpen={showMap}
                onClose={() => setShowMap(false)}
                storyId={seriesId}
                currentNodeId={currentNode.id}
                history={history}
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
