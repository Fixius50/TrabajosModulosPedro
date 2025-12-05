import React from 'react';

export function ViewTabs({ database, actions }) {
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

            <button
                onClick={() => {
                    const viewTypes = ['table', 'board', 'list'];
                    const currentType = database.views.find(v => v.id === database.activeViewId)?.type || 'table';
                    const nextType = viewTypes[(viewTypes.indexOf(currentType) + 1) % viewTypes.length];
                    actions.addView(database.id, { name: `${nextType.charAt(0).toUpperCase() + nextType.slice(1)}`, type: nextType });
                }}
                className="px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 rounded flex items-center gap-1"
                title="Agregar vista"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16

m8-8H4" />
                </svg>
            </button>
        </div>
    );
}
