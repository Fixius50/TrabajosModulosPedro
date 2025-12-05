import React from 'react';

export function BoardView({ database, items, actions, activeView }) {
    const groupBy = activeView.groupBy || database.properties.find(p => p.type === 'select')?.id;

    if (!groupBy) {
        return <div className="p-4 text-zinc-500">Configure una propiedad "Select" para usar la vista Board</div>;
    }

    const groupProperty = database.properties.find(p => p.id === groupBy);
    const columns = groupProperty?.config?.options || [];

    const itemsByColumn = columns.reduce((acc, option) => {
        acc[option.label] = items.filter(item => item.values[groupBy] === option.label);
        return acc;
    }, {});

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(option => (
                <div
                    key={option.label}
                    className="flex-shrink-0 w-72"
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                        e.currentTarget.classList.remove('bg-blue-50');
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-blue-50');
                        const itemId = e.dataTransfer.getData('itemId');
                        if (itemId) {
                            actions.updateDatabaseItem(database.id, itemId, groupBy, option.label);
                        }
                    }}
                >
                    <div className="bg-zinc-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-sm">{option.label}</h3>
                            <span className="text-xs text-zinc-500">{itemsByColumn[option.label]?.length || 0}</span>
                        </div>

                        <div className="space-y-2">
                            {itemsByColumn[option.label]?.map(item => {
                                const titleProp = database.properties.find(p => p.type === 'title');
                                return (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('itemId', item.id);
                                            e.currentTarget.style.opacity = '0.5';
                                        }}
                                        onDragEnd={(e) => {
                                            e.currentTarget.style.opacity = '1';
                                        }}
                                        onClick={() => actions.setActivePageId(item.pageId)}
                                        className="bg-white rounded p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                    >
                                        <div className="font-medium text-sm mb-2">
                                            {item.values[titleProp.id] || 'Sin título'}
                                        </div>
                                        {database.properties.filter(p => p.type !== 'title' && p.visible !== false).slice(0, 3).map(prop => (
                                            <div key={prop.id} className="text-xs text-zinc-500">
                                                <span className="font-medium">{prop.name}:</span> {item.values[prop.id] || '-'}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => {
                                const itemId = actions.addDatabaseItem(database.id, '');
                                actions.updateDatabaseItem(database.id, itemId, groupBy, option.label);
                            }}
                            className="mt-2 w-full text-sm text-zinc-500 hover:bg-white rounded p-2 transition-colors"
                        >
                            + Nuevo
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
