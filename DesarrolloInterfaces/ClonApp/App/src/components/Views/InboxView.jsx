import React from 'react';
import { Inbox, Trash, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SpotlightCard } from '../UI';

export function InboxView({ activeWorkspace, actions }) {
    const inboxPages = activeWorkspace?.pages.filter(p => p.inInbox && !p.isDeleted) || [];

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-current flex items-center gap-2"><Inbox size={24} /> Bandeja de Entrada</h1>
                {inboxPages.length > 0 && (
                    <button onClick={() => { if (confirm("¿Estás seguro de que quieres borrar todo permanentemente?")) actions.emptyInbox(); }} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2"><Trash size={14} /> Borrar todo</button>
                )}
            </div>
            {inboxPages.length === 0 ? (
                <div className="text-center py-12 opacity-50"><div className="mb-2 text-4xl">📬</div>No tienes notificaciones.</div>
            ) : (
                <div className="grid gap-4">
                    {inboxPages.map(page => (
                        <SpotlightCard key={page.id} className="p-4 flex items-center justify-between cursor-pointer" onClick={() => { actions.updatePage(page.id, { inInbox: false }); }}>
                            <div className="flex items-center gap-4">
                                <div className="text-2xl">{page.icon}</div>
                                <div>
                                    <div className="font-bold text-zinc-800">{page.title}</div>
                                    <div className="text-xs text-zinc-500">{formatDistanceToNow(new Date(page.updatedAt))} ago</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); actions.deletePage(page.id); }} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600" title="Eliminar"><X size={16} /></button>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            )}
        </div>
    );
}
