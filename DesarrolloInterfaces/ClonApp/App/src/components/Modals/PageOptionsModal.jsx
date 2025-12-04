import React from 'react';
import { Star as StarIcon, Link as LinkIcon, Trash } from 'lucide-react';

export function PageOptionsModal({ ui, setUi, activePage, activePageId, activeWorkspace, activeWorkspaceId, userProfile, actions, showNotify }) {
    if (!ui.modals.pageOptions) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-end pr-4 pt-12" onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } }))}>
            <div className="bg-white border border-zinc-200 rounded-lg shadow-xl w-64 overflow-hidden text-zinc-700" onClick={e => e.stopPropagation()}>
                {ui.currentView === 'page' && activePage ? (
                    <div className="py-1">
                        <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estilo</div>
                        <div className="px-2 pb-2 flex gap-1">
                            <button className="flex-1 py-1.5 border border-zinc-200 rounded hover:bg-zinc-50 text-xs font-sans">Default</button>
                            <button className="flex-1 py-1.5 border border-zinc-200 rounded hover:bg-zinc-50 text-xs font-serif">Serif</button>
                            <button className="flex-1 py-1.5 border border-zinc-200 rounded hover:bg-zinc-50 text-xs font-mono">Mono</button>
                        </div>
                        <div className="h-px bg-zinc-100 my-1" />
                        <div className="px-3 py-2 flex items-center justify-between hover:bg-zinc-50 cursor-pointer">
                            <span className="text-sm">Texto pequeño</span>
                            <div className="w-8 h-4 bg-zinc-200 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" /></div>
                        </div>
                        <div className="px-3 py-2 flex items-center justify-between hover:bg-zinc-50 cursor-pointer">
                            <span className="text-sm">Ancho completo</span>
                            <div className="w-8 h-4 bg-zinc-200 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" /></div>
                        </div>
                        <div className="h-px bg-zinc-100 my-1" />
                        <button onClick={() => { actions.updatePage(activePageId, { isFavorite: !activePage.isFavorite }); setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } })); }} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2">
                            <StarIcon size={16} fill={activePage.isFavorite ? "currentColor" : "none"} className={activePage.isFavorite ? "text-yellow-400" : "text-zinc-400"} />
                            {activePage.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(window.location.href); setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } })); showNotify("Enlace copiado"); }} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2">
                            <LinkIcon size={16} className="text-zinc-400" /> Copiar enlace
                        </button>
                        <div className="h-px bg-zinc-100 my-1" />
                        <button onClick={() => { if (confirm("¿Eliminar página?")) { actions.deletePage(activePageId); setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } })); } }} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2">
                            <Trash size={16} /> Eliminar página
                        </button>
                    </div>
                ) : (
                    <div className="py-1">
                        <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Espacio de trabajo</div>
                        <div className="px-3 py-2 text-sm text-zinc-600">
                            <div className="font-medium text-zinc-900 mb-1">{activeWorkspace?.name}</div>
                            <div className="text-xs">{userProfile.email}</div>
                        </div>
                        <div className="h-px bg-zinc-100 my-1" />
                        <button onClick={() => { if (confirm("¿Estás seguro de que quieres eliminar este espacio de trabajo permanentemente?")) { actions.removeWorkspace(activeWorkspaceId); setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } })); } }} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2">
                            <Trash size={16} /> Eliminar workspace
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
