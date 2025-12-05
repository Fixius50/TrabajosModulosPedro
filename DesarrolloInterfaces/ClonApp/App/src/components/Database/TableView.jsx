import React, { useState } from 'react';
import { PropertyCell } from './PropertyCell';

export function TableView({ database, items, actions, onPropertyClick }) {
    const [hoveredRow, setHoveredRow] = useState(null);

    const handleAddItem = () => {
        actions.addDatabaseItem(database.id, '');
    };

    const handleDeleteItem = (itemId) => {
        if (confirm('¿Eliminar este elemento?')) {
            actions.deleteDatabaseItem(database.id, itemId);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-zinc-200">
                        {database.properties.filter(p => p.visible !== false).map(property => (
                            <th
                                key={property.id}
                                onClick={() => onPropertyClick?.(property)}
                                className="text-left p-3 text-sm font-medium text-zinc-600 bg-zinc-50 sticky top-0 cursor-pointer hover:bg-zinc-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span>{property.name}</span>
                                    <span className="text-xs text-zinc-400">{property.type}</span>
                                </div>
                            </th>
                        ))}
                        <th className="w-10 bg-zinc-50 sticky top-0"></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr
                            key={item.id}
                            onMouseEnter={() => setHoveredRow(item.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer group"
                        >
                            {database.properties.filter(p => p.visible !== false).map(property => (
                                <td
                                    key={property.id}
                                    className="p-3"
                                >
                                    <PropertyCell
                                        database={database}
                                        item={item}
                                        property={property}
                                        value={item.values[property.id]}
                                        onChange={(value) => actions.updateDatabaseItem(database.id, item.id, property.id, value)}
                                        onPageClick={() => {
                                            // Navegar a la página del item
                                            actions.setActivePageId(item.pageId);
                                        }}
                                    />
                                </td>
                            ))}
                            <td className="p-3">
                                {hoveredRow === item.id && (
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-zinc-400 hover:text-red-500 transition-colors"
                                        title="Eliminar"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Add Item Button */}
            <div className="mt-2">
                <button
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 rounded transition-colors w-full text-left"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo
                </button>
            </div>
        </div>
    );
}
