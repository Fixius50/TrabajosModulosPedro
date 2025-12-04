import React from 'react';
import { Check, Trash, PlusCircle, LogOut } from 'lucide-react';

const WorkspaceMenu = ({ isOpen, onClose, userProfile, workspaces, activeWorkspaceId, actions, setUi, onLogout }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-start" onClick={onClose}>
            <div className="absolute top-14 left-4 w-72 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-2 border-b border-zinc-100">
                    <div className="text-xs font-semibold text-zinc-500 px-2 py-1 mb-1">Workspaces de {userProfile.email}</div>
                    {workspaces.filter(w => w.email === userProfile.email).map(ws => (
                        <div key={ws.id} onClick={() => { actions.setActiveWorkspaceId(ws.id); onClose(); }} className="flex items-center justify-between px-2 py-1.5 hover:bg-zinc-100 rounded cursor-pointer group">
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${ws.id === activeWorkspaceId ? 'ring-2 ring-offset-1 ring-zinc-400' : ''}`} style={{ background: ws.color || '#666' }}>{ws.initial}</div>
                                <span className={`text-sm ${ws.id === activeWorkspaceId ? 'font-medium text-zinc-900' : 'text-zinc-600'}`}>{ws.name}</span>
                            </div>
                            {ws.id === activeWorkspaceId && <Check size={14} className="text-zinc-600" />}
                            {workspaces.length > 1 && ws.id !== activeWorkspaceId && (
                                <button onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar workspace "${ws.name}"?`)) actions.removeWorkspace(ws.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-500 rounded"><Trash size={12} /></button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-2">
                    <div onClick={() => { onClose(); setUi(p => ({ ...p, modals: { ...p.modals, createWorkspace: true } })); }} className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 rounded cursor-pointer text-zinc-600 text-sm">
                        <PlusCircle size={16} /> <span>Crear nuevo workspace</span>
                    </div>
                    <div onClick={onLogout} className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 rounded cursor-pointer text-zinc-600 text-sm border-t border-zinc-100 mt-1 pt-2">
                        <LogOut size={16} /> <span>Cerrar sesión</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceMenu;
