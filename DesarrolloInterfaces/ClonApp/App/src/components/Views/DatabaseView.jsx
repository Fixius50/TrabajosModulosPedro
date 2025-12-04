import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown, MoreHorizontal, Calendar, Hash, Type, CheckSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { utils } from '../lib/utils';

const PROPERTY_TYPES = {
    text: { icon: <Type size={14} />, label: 'Texto' },
    number: { icon: <Hash size={14} />, label: 'Número' },
    select: { icon: <CheckSquare size={14} />, label: 'Selección' },
    date: { icon: <Calendar size={14} />, label: 'Fecha' },
};

const DatabaseView = ({ activePage, activePageId, actions }) => {
    const [properties, setProperties] = useState(activePage.properties || [
        { id: 'prop-1', name: 'Nombre', type: 'text', isTitle: true },
        { id: 'prop-2', name: 'Tags', type: 'select', options: ['Trabajo', 'Personal', 'Urgente'] },
        { id: 'prop-3', name: 'Estado', type: 'select', options: ['Por hacer', 'En progreso', 'Hecho'] },
    ]);

    const [rows, setRows] = useState(activePage.data || [
        { id: 'row-1', 'prop-1': 'Tarea de ejemplo', 'prop-2': 'Trabajo', 'prop-3': 'Por hacer' },
        { id: 'row-2', 'prop-1': 'Otra tarea', 'prop-2': 'Personal', 'prop-3': 'En progreso' },
    ]);

    const [newPropName, setNewPropName] = useState('');
    const [isAddingProp, setIsAddingProp] = useState(false);

    const addProperty = (type) => {
        const newProp = { id: utils.generateId(), name: newPropName || 'Nueva propiedad', type };
        setProperties([...properties, newProp]);
        setNewPropName('');
        setIsAddingProp(false);
        // Update page in store
        actions.updatePage(activePageId, { properties: [...properties, newProp] });
    };

    const addRow = () => {
        const newRow = { id: utils.generateId() };
        const updatedRows = [...rows, newRow];
        setRows(updatedRows);
        actions.updatePage(activePageId, { data: updatedRows });
    };

    const updateCell = (rowId, propId, value) => {
        const updatedRows = rows.map(row => {
            if (row.id === rowId) return { ...row, [propId]: value };
            return row;
        });
        setRows(updatedRows);
        actions.updatePage(activePageId, { data: updatedRows });
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Database Header */}
            <div className="px-8 py-6 border-b border-zinc-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{activePage.icon || '🗃️'}</div>
                    <input
                        value={activePage.title}
                        onChange={(e) => actions.updatePage(activePageId, { title: e.target.value })}
                        className="text-3xl font-bold outline-none placeholder:text-zinc-300 w-full"
                        placeholder="Nombre de la base de datos"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <div className="flex items-center gap-1 hover:bg-zinc-100 px-2 py-1 rounded cursor-pointer"><Filter size={14} /> Filtrar</div>
                    <div className="flex items-center gap-1 hover:bg-zinc-100 px-2 py-1 rounded cursor-pointer"><ArrowUpDown size={14} /> Ordenar</div>
                    <div className="flex items-center gap-1 hover:bg-zinc-100 px-2 py-1 rounded cursor-pointer"><Search size={14} /> Buscar</div>
                </div>
            </div>

            {/* Table View */}
            <div className="flex-1 overflow-auto">
                <div className="min-w-max">
                    {/* Header Row */}
                    <div className="flex border-b border-zinc-200 bg-zinc-50 sticky top-0 z-10">
                        {properties.map(prop => (
                            <div key={prop.id} className="w-48 px-3 py-2 border-r border-zinc-200 text-xs font-medium text-zinc-500 flex items-center gap-2 group">
                                {PROPERTY_TYPES[prop.type]?.icon}
                                <span className="flex-1 truncate">{prop.name}</span>
                                {!prop.isTitle && <MoreHorizontal size={12} className="opacity-0 group-hover:opacity-100 cursor-pointer" />}
                            </div>
                        ))}
                        <div className="w-12 border-r border-zinc-200 flex items-center justify-center cursor-pointer hover:bg-zinc-100" onClick={() => setIsAddingProp(true)}>
                            <Plus size={14} className="text-zinc-400" />
                        </div>
                    </div>

                    {/* Data Rows */}
                    {rows.map(row => (
                        <div key={row.id} className="flex border-b border-zinc-100 hover:bg-zinc-50/50 group">
                            {properties.map(prop => (
                                <div key={prop.id} className="w-48 border-r border-zinc-100 relative">
                                    {prop.type === 'select' ? (
                                        <select
                                            value={row[prop.id] || ''}
                                            onChange={(e) => updateCell(row.id, prop.id, e.target.value)}
                                            className="w-full h-full px-3 py-2 bg-transparent outline-none text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="">Vacío</option>
                                            {prop.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={row[prop.id] || ''}
                                            onChange={(e) => updateCell(row.id, prop.id, e.target.value)}
                                            className="w-full h-full px-3 py-2 bg-transparent outline-none text-sm"
                                            placeholder="Vacío"
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="w-12 border-r border-zinc-100"></div>
                        </div>
                    ))}

                    {/* Add Row Button */}
                    <div className="flex border-b border-zinc-100 cursor-pointer hover:bg-zinc-50" onClick={addRow}>
                        <div className="px-3 py-2 text-sm text-zinc-400 flex items-center gap-2">
                            <Plus size={14} /> Nuevo
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Property Modal (Simplified) */}
            {isAddingProp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setIsAddingProp(false)}>
                    <div className="bg-white rounded-lg shadow-xl p-4 w-64" onClick={e => e.stopPropagation()}>
                        <h3 className="font-medium mb-3">Nueva Propiedad</h3>
                        <input
                            autoFocus
                            value={newPropName}
                            onChange={e => setNewPropName(e.target.value)}
                            placeholder="Nombre..."
                            className="w-full p-2 border border-zinc-200 rounded mb-3 text-sm outline-none focus:border-black"
                        />
                        <div className="space-y-1">
                            {Object.entries(PROPERTY_TYPES).map(([type, info]) => (
                                <button
                                    key={type}
                                    onClick={() => addProperty(type)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 rounded text-sm text-zinc-600"
                                >
                                    {info.icon} {info.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatabaseView;
