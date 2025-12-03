import React, { useState } from 'https://esm.sh/react@18.2.0';
import { clsx } from 'https://esm.sh/clsx@2.0.0';
import {
    ChevronRight, FileText, Loader2, MoreHorizontal, Plus
} from 'https://esm.sh/lucide-react@0.292.0';

export const SidebarItem = ({ page, depth = 0, actions, ui, setUi, activePageId, allPages, onContextMenu }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = allPages.some(p => p.parentId === page.id && !p.isDeleted && !p.inInbox);
    const children = allPages.filter(p => p.parentId === page.id && !p.isDeleted && !p.inInbox);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedId = e.dataTransfer.getData("text/plain");
        if (draggedId !== page.id) {
            actions.movePage(draggedId, page.id);
        }
    };

    return (
        <>
            <div
                className={clsx("group flex items-center gap-1 p-1 rounded-md hover:bg-[rgba(0,0,0,0.05)] cursor-pointer min-h-[1.75rem] relative select-none", activePageId === page.id ? 'bg-[rgba(0,0,0,0.05)] font-medium' : 'opacity-80')}
                style={{ paddingLeft: `${depth * 0.75 + 0.5}rem` }}
                onClick={() => { actions.setActivePageId(page.id); setUi(p => ({ ...p, currentView: 'page' })); if (ui.isMobile) setUi(p => ({ ...p, sidebarOpen: false })); }}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", page.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <div className="flex items-center justify-center w-4 h-4 shrink-0 hover:bg-zinc-200 rounded transition-colors" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
                    {hasChildren && <ChevronRight size={12} className={clsx("transition-transform", isExpanded && "rotate-90")} />}
                </div>
                <span className="text-lg leading-none w-4 text-center shrink-0 flex items-center justify-center">{page.isGenerating ? <Loader2 className="animate-spin text-indigo-500" size={14} /> : (page.icon || <FileText size={16} />)}</span>
                <span className={clsx("text-sm truncate flex-1", page.isGenerating && "italic text-zinc-400")}>{page.title || 'Sin título'}</span>

                {/* Hover Actions */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 bg-[var(--sidebar-bg)] shadow-sm rounded">
                    <button onClick={(e) => { e.stopPropagation(); onContextMenu(page.id, e); }} className="p-0.5 hover:bg-zinc-200 rounded text-zinc-500"><MoreHorizontal size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); actions.addPage({ parentId: page.id }); setIsExpanded(true); }} className="p-0.5 hover:bg-zinc-200 rounded text-zinc-500"><Plus size={14} /></button>
                </div>
            </div>
            {isExpanded && children.map(child => (
                <SidebarItem key={child.id} page={child} depth={depth + 1} actions={actions} ui={ui} setUi={setUi} activePageId={activePageId} allPages={allPages} onContextMenu={onContextMenu} />
            ))}
        </>
    );
};
