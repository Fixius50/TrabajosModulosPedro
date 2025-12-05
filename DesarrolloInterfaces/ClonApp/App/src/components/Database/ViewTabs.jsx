import React, { useState, useRef, useEffect } from 'react';

export function ViewTabs({ database, actions }) {
    const [showViewMenu, setShowViewMenu] = useState(false);
    const menuRef = useRef(null);

    const viewTypes = [
        { id: 'table', label: 'Tabla', icon: '📄', desc: 'Vista de tabla' },
        { id: 'board', label: 'Tablero', icon: '📊', desc: 'Vista Kanban' },
        { id: 'list', label: 'Lista', icon: '📝', desc: 'Vista de lista' }
    ];

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowViewMenu(false);
            }
        };
        if (showViewMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showViewMenu]);

    return (
        <div className="flex items-center gap-2 px-6 py-2 border-b border-zinc-200 bg-zinc-50">
            {database.views.map(view => (
                <button
                    key={view.id}
                    onClick={() => actions.updateDatabase(database.id, { activeViewId: view.id })}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${view.id === database.activeViewId
                        ? 'bg-white text-zinc-900 font-medium shadow-sm'
                        : 'text-zinc-600 hover:bg-zinc-100'
                        }`}
                >
                    {view.name}
                </button>
            ))}

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setShowViewMenu(!showViewMenu)}
                    className="px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 rounded flex items-center gap-1"
                    title="Agregar vista"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>

                {showViewMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                        <div className="p-2 space-y-1">
                            {viewTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        actions.addView(database.id, { name: type.label, type: type.id });
                                        setShowViewMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-zinc-100 rounded transition-colors text-left"
                                >
                                    <span className="text-lg">{type.icon}</span>
                                    <div>
                                        <div className="font-medium text-zinc-900">{type.label}</div>
                                        <div className="text-xs text-zinc-500">{type.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
