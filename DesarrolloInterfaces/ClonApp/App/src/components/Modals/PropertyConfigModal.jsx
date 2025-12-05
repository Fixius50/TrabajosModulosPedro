import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const PRESET_COLORS = [
    { name: 'Gris', value: '#6b7280' },
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Naranja', value: '#f97316' },
    { name: 'Amarillo', value: '#eab308' },
    { name: 'Verde', value: '#22c55e' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Púrpura', value: '#a855f7' },
    { name: 'Rosa', value: '#ec4899' },
];

export function PropertyConfigModal({ isOpen, onClose, property, databaseId, actions }) {
    const [name, setName] = useState(property?.name || '');
    const [options, setOptions] = useState(property?.config?.options || []);
    const [newOptionLabel, setNewOptionLabel] = useState('');

    if (!isOpen || !property) return null;

    const handleSave = () => {
        const updates = { name };

        if (property.type === 'select' || property.type === 'multi-select') {
            updates.config = { ...property.config, options };
        }

        actions.updateProperty(databaseId, property.id, updates);
        onClose();
    };

    const handleAddOption = () => {
        if (!newOptionLabel.trim()) return;

        const newOption = {
            label: newOptionLabel.trim(),
            color: PRESET_COLORS[options.length % PRESET_COLORS.length].value
        };

        setOptions([...options, newOption]);
        setNewOptionLabel('');
    };

    const handleDeleteOption = (index) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleUpdateOptionColor = (index, color) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], color };
        setOptions(newOptions);
    };

    const isSelectType = property.type === 'select' || property.type === 'multi-select';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Configurar Propiedad</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Property Name */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Property Type (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                            Tipo
                        </label>
                        <div className="px-3 py-2 bg-zinc-100 rounded-lg text-zinc-600">
                            {property.type}
                        </div>
                    </div>

                    {/* Select/Multi-select Options */}
                    {isSelectType && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Opciones
                            </label>

                            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                                {options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-zinc-50 rounded">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div
                                                className="w-6 h-6 rounded cursor-pointer border border-zinc-300"
                                                style={{ backgroundColor: option.color }}
                                                onClick={() => {
                                                    const colorIndex = PRESET_COLORS.findIndex(c => c.value === option.color);
                                                    const nextColor = PRESET_COLORS[(colorIndex + 1) % PRESET_COLORS.length];
                                                    handleUpdateOptionColor(index, nextColor.value);
                                                }}
                                                title="Click para cambiar color"
                                            />
                                            <span className="text-sm">{option.label}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteOption(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newOptionLabel}
                                    onChange={(e) => setNewOptionLabel(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                                    placeholder="Nueva opción..."
                                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleAddOption}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                >
                                    <Plus size={16} />
                                    Agregar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
