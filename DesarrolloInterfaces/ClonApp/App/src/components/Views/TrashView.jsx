import React from 'react';
import { Trash, FileText, Undo2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TrashView = ({ trashPages, actions, showNotify }) => {
    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="flex items-center justify-between mb-8"><h1 className="text-2xl font-bold text-current flex items-center gap-2"><Trash size={24} /> Papelera</h1>{trashPages.length > 0 && (<button onClick={() => { if (confirm("¿Estás seguro de que quieres vaciar la papelera permanentemente?")) actions.emptyTrash(); }} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2"><Trash size={14} /> Vaciar papelera</button>)}</div>
            <p className="text-sm opacity-60 mb-6">Las páginas aquí pueden ser restauradas o eliminadas para siempre.</p>
            {trashPages.length === 0 ? <div className="text-center py-12 opacity-50"><div className="mb-2 text-4xl">🗑️</div>Papelera vacía.</div> : (<div className="grid gap-3">{trashPages.map(page => (<div key={page.id} className="p-3 border border-zinc-200 rounded-lg flex justify-between items-center bg-white shadow-sm"><div className="flex items-center gap-3 opacity-60"><div className="text-lg">{page.icon || <FileText size={16} />}</div><div><div className="font-medium text-sm text-zinc-900">{page.title || 'Sin título'}</div><div className="text-xs text-zinc-500">Borrado {formatDistanceToNow(new Date(page.deletedAt || new Date()))} ago</div></div></div><div className="flex gap-2"><button onClick={() => { actions.restorePage(page.id); showNotify("Página restaurada"); }} className="flex items-center gap-1 bg-zinc-100 text-zinc-700 text-xs px-3 py-1.5 rounded hover:bg-zinc-200"><Undo2 size={12} /> Restaurar</button><button onClick={() => { if (confirm("¿Borrar definitivamente?")) actions.permanentDeletePage(page.id); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash size={14} /></button></div></div>))}</div>)}
        </div>
    );
};

export default TrashView;
