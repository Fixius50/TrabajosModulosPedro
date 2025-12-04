import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash, Copy, Star, FilePlus, X } from 'lucide-react';

export const ContextMenu = ({ isOpen, x, y, pageId, onClose, actions, activeWorkspace }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const page = activeWorkspace?.pages.find(p => p.id === pageId);
    if (!page) return null;

    const handleAction = (action) => {
        action();
        onClose();
    };

    // Adjust position if it goes off screen
    const style = {
        top: y,
        left: x,
    };

    // Simple adjustment to keep it in viewport (basic)
    if (x + 200 > window.innerWidth) style.left = x - 200;
    if (y + 200 > window.innerHeight) style.top = y - 200;

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="fixed z-50 bg-white border border-zinc-200 rounded-lg shadow-xl w-48 py-1 overflow-hidden"
                style={style}
            >
                <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                    <p className="text-xs font-medium text-zinc-500 truncate">Acciones para {page.title || 'Sin título'}</p>
                </div>

                <button
                    onClick={() => handleAction(() => actions.updatePage(pageId, { isFavorite: !page.isFavorite }))}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2"
                >
                    <Star size={14} className={page.isFavorite ? "fill-yellow-400 text-yellow-400" : ""} />
                    {page.isFavorite ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
                </button>

                <button
                    onClick={() => handleAction(() => actions.duplicatePage(pageId))}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2"
                >
                    <Copy size={14} /> Duplicar
                </button>

                <button
                    onClick={() => handleAction(() => actions.addPage({ parentId: pageId }))}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2"
                >
                    <FilePlus size={14} /> Nueva Sub-página
                </button>

                <div className="h-px bg-zinc-100 my-1" />

                <button
                    onClick={() => handleAction(() => actions.deletePage(pageId))}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                    <Trash size={14} /> Eliminar
                </button>
            </motion.div>
        </AnimatePresence>
    );
};
