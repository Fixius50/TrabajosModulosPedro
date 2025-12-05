import React, { useState, useEffect, useRef } from 'react';
import { FileText, Database } from 'lucide-react';

export function SlashCommandMenu({
    isOpen,
    onClose,
    onSelect,
    position,
    filter = '',
    pages = [],
    databases = []
}) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef(null);

    // Combine pages and databases
    const items = [
        ...pages.map(p => ({
            type: 'page',
            id: p.id,
            title: p.title || 'Sin título',
            icon: p.icon || '📄'
        })),
        ...databases.map(db => ({
            type: 'database',
            id: db.id,
            title: db.title,
            icon: db.icon || '📊'
        }))
    ];

    // Filter items by search term
    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(filter.toLowerCase())
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [filter]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev =>
                        prev < filteredItems.length - 1 ? prev + 1 : prev
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredItems[selectedIndex]) {
                        onSelect(filteredItems[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredItems, onSelect, onClose]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    if (!isOpen || filteredItems.length === 0) return null;

    return (
        <div
            ref={menuRef}
            className="absolute z-50 bg-white border border-zinc-200 rounded-lg shadow-lg py-2 min-w-[300px] max-h-[400px] overflow-y-auto"
            style={{
                top: position.top,
                left: position.left
            }}
        >
            {filteredItems.map((item, index) => (
                <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => onSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${index === selectedIndex
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-zinc-50'
                        }`}
                >
                    {/* Icon */}
                    <span className="text-lg">{item.icon}</span>

                    {/* Title */}
                    <div className="flex-1">
                        <div className="text-sm font-medium">{item.title}</div>
                    </div>

                    {/* Type indicator */}
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                        {item.type === 'page' ? (
                            <>
                                <FileText size={12} />
                                <span>Página</span>
                            </>
                        ) : (
                            <>
                                <Database size={12} />
                                <span>Database</span>
                            </>
                        )}
                    </div>
                </div>
            ))}

            {/* Help text */}
            <div className="px-3 py-2 mt-2 border-t border-zinc-200 text-xs text-zinc-400">
                ↑↓ navegar • Enter seleccionar • Esc cerrar
            </div>
        </div>
    );
}
