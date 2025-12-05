import React from 'react';

export function ListView({ database, items, actions }) {
    const titleProperty = database.properties.find(p => p.type === 'title');

    return (
        <div className="space-y-1">
            {items.map(item => (
                <div
                    key={item.id}
                    onClick={() => actions.setActivePageId(item.pageId)}
                    className="flex items-center gap-3 p-3 hover:bg-zinc-50 rounded cursor-pointer group"
                >
                    <div className="flex-1">
                        <div className="font-medium text-sm mb-1">
                            {item.values[titleProperty.id] || 'Sin título'}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                            {database.properties
                                .filter(p => p.type !== 'title' && p.visible !== false)
                                .slice(0, 4)
                                .map(prop => (
                                    <span key={prop.id}>
                                        <span className="font-medium">{prop.name}:</span>{' '}
                                        {item.values[prop.id] || '-'}
                                    </span>
                                ))
                            }
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('¿Eliminar este elemento?')) {
                                actions.deleteDatabaseItem(database.id, item.id);
                            }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}

            <button
                onClick={() => actions.addDatabaseItem(database.id, '')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 rounded transition-colors w-full text-left"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo
            </button>
        </div>
    );
}
