import React, { useMemo } from 'react';
import { Search, Globe, FileText, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { Modal } from '../UI';

export function SearchModal({ ui, setUi, searchQuery, setSearchQuery, searchFilters, setSearchFilters, filteredPages, actions }) {
    return (
        <Modal isOpen={ui.modals.search} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, search: false } }))} title="Buscar">
            <div className="p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
                    <input type="text" placeholder="Buscar páginas..." className="w-full pl-10 pr-4 py-2 bg-zinc-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                </div>
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                    <button onClick={() => setSearchFilters(p => ({ ...p, scope: p.scope === 'all' ? 'current' : 'all' }))} className={clsx("px-3 py-1 rounded-full text-xs border flex items-center gap-1 shrink-0", searchFilters.scope === 'current' ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "border-zinc-200 text-zinc-500")}>
                        {searchFilters.scope === 'all' ? <Globe size={12} /> : <FileText size={12} />}
                        {searchFilters.scope === 'all' ? 'Todo el workspace' : 'Página actual'}
                    </button>
                    <button onClick={() => setSearchFilters(p => ({ ...p, date: p.date === 'any' ? 'week' : p.date === 'week' ? 'month' : 'any' }))} className={clsx("px-3 py-1 rounded-full text-xs border flex items-center gap-1 shrink-0", searchFilters.date !== 'any' ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "border-zinc-200 text-zinc-500")}>
                        <Calendar size={12} />
                        {searchFilters.date === 'any' ? 'Cualquier fecha' : searchFilters.date === 'today' ? 'Hoy' : searchFilters.date === 'week' ? 'Última semana' : 'Último mes'}
                    </button>
                    <select value={searchFilters.sort} onChange={(e) => setSearchFilters(p => ({ ...p, sort: e.target.value }))} className="px-3 py-1 rounded-full text-xs border border-zinc-200 text-zinc-500 bg-transparent outline-none shrink-0">
                        <option value="newest">Más recientes</option>
                        <option value="oldest">Más antiguos</option>
                        <option value="alpha">A-Z</option>
                    </select>
                </div>
                <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                    {filteredPages.map(page => (
                        <div key={page.id} onClick={() => { actions.setActivePageId(page.id); setUi(p => ({ ...p, modals: { ...p.modals, search: false } })); }} className="flex items-center gap-3 p-2 hover:bg-zinc-100 rounded-lg cursor-pointer">
                            <div className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded text-lg">{page.icon || <FileText size={14} />}</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{page.title || 'Sin título'}</div>
                                <div className="text-xs text-zinc-400 flex items-center gap-2">
                                    <span>{page.workspaceName}</span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(page.updatedAt))}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredPages.length === 0 && <div className="text-center text-zinc-400 py-8">No se encontraron resultados</div>}
                </div>
            </div>
        </Modal>
    );
}
