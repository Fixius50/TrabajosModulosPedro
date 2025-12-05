import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { ICONS_LIST } from '../lib/utils';

export function IconPickerInline({ onSelect, onClose }) {
    const [search, setSearch] = useState('');
    const pickerRef = useRef(null);

    const filteredIcons = ICONS_LIST.filter(icon =>
        search === '' || icon.toLowerCase().includes(search.toLowerCase())
    );

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // ESC to close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            ref={pickerRef}
            className="absolute top-full left-0 mt-2 z-50 w-80 bg-white border border-zinc-200 rounded-lg shadow-xl"
        >
            {/* Header with search */}
            <div className="p-3 border-b border-zinc-200">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold flex-1">Seleccionar Icono</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-zinc-100 rounded transition-colors"
                    >
                        <X size={16} className="text-zinc-500" />
                    </button>
                </div>

                <div className="relative">
                    <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar emoji..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-zinc-200 rounded-md focus:outline-none focus:border-blue-500"
                        autoFocus
                    />
                </div>
            </div>

            {/* Icon grid */}
            <div className="p-3 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                    {filteredIcons.map((icon, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onSelect(icon);
                                onClose();
                            }}
                            className="text-2xl p-2 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                            title={icon}
                        >
                            {icon}
                        </button>
                    ))}
                </div>

                {filteredIcons.length === 0 && (
                    <div className="text-center py-8 text-sm text-zinc-400">
                        No se encontraron emojis
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-zinc-200 text-xs text-zinc-400">
                {filteredIcons.length} emojis disponibles
            </div>
        </div>
    );
}
