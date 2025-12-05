import React, { useState } from 'react';
import { Filter, ArrowUpDown, Plus } from 'lucide-react';

export function DatabaseToolbar({ database, activeView, actions }) {
    const [showFilters, setShowFilters] = useState(false);
    const [showPropertyMenu, setShowPropertyMenu] = useState(false);

    const handleAddFilter = () => {
        const property = database.properties[0];
        if (!property) return;

        const newFilters = [
            ...(activeView.filters || []),
            { propertyId: property.id, condition: 'contains', value: '' }
        ];
        actions.updateView(database.id, activeView.id, { filters: newFilters });
    };

    const handleAddProperty = (type) => {
        actions.addProperty(database.id, { name: `Nueva ${type}`, type });
        setShowPropertyMenu(false);
    };

    return (
        <div className="flex items-center gap-2 px-6 py-3 border-b border-zinc-200 bg-white">
            {/* Filter Button */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-zinc-200 rounded hover:bg-zinc-50"
            >
                <Filter size={14} />
                Filtros
                {activeView?.filters?.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                        {activeView.filters.length}
                    </span>
                )}
            </button>

            {/* Sort Button */}
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-zinc-200 rounded hover:bg-zinc-50">
                <ArrowUpDown size={14} />
                Ordenar
            </button>

            {/* Add Property Button */}
            <div className="relative">
                <button
                    onClick={() => setShowPropertyMenu(!showPropertyMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-zinc-200 rounded hover:bg-zinc-50"
                >
                    <Plus size={14} />
                    Propiedad
                </button>

                {showPropertyMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded shadow-lg py-1 z-10 min-w-[150px]">
                        {['text', 'number', 'select', 'multi-select', 'checkbox', 'date', 'url'].map(type => (
                            <button
                                key={type}
                                onClick={() => handleAddProperty(type)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50"
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Filter Editor (expandable) */}
            {showFilters && activeView?.filters?.length > 0 && (
                <div className="absolute top-16 left-6 bg-white border border-zinc-200 rounded shadow-lg p-3 z-10">
                    <div className="space-y-2">
                        {activeView.filters.map((filter, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <select
                                    value={filter.propertyId}
                                    onChange={(e) => {
                                        const newFilters = [...activeView.filters];
                                        newFilters[idx].propertyId = e.target.value;
                                        actions.updateView(database.id, activeView.id, { filters: newFilters });
                                    }}
                                    className="text-sm border border-zinc-200 rounded px-2 py-1"
                                >
                                    {database.properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={filter.condition}
                                    onChange={(e) => {
                                        const newFilters = [...activeView.filters];
                                        newFilters[idx].condition = e.target.value;
                                        actions.updateView(database.id, activeView.id, { filters: newFilters });
                                    }}
                                    className="text-sm border border-zinc-200 rounded px-2 py-1"
                                >
                                    <option value="is">Es</option>
                                    <option value="contains">Contiene</option>
                                    <option value="is-empty">Está vacío</option>
                                    <option value="is-not-empty">No está vacío</option>
                                </select>

                                {filter.condition !== 'is-empty' && filter.condition !== 'is-not-empty' && (
                                    <input
                                        type="text"
                                        value={filter.value}
                                        onChange={(e) => {
                                            const newFilters = [...activeView.filters];
                                            newFilters[idx].value = e.target.value;
                                            actions.updateView(database.id, activeView.id, { filters: newFilters });
                                        }}
                                        className="text-sm border border-zinc-200 rounded px-2 py-1"
                                        placeholder="Valor..."
                                    />
                                )}

                                <button
                                    onClick={() => {
                                        const newFilters = activeView.filters.filter((_, i) => i !== idx);
                                        actions.updateView(database.id, activeView.id, { filters: newFilters });
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddFilter}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                        + Agregar filtro
                    </button>
                </div>
            )}

            {showFilters && (!activeView?.filters || activeView.filters.length === 0) && (
                <button
                    onClick={handleAddFilter}
                    className="ml-2 text-sm text-zinc-500 hover:text-zinc-700"
                >
                    + Agregar primer filtro
                </button>
            )}
        </div>
    );
}
