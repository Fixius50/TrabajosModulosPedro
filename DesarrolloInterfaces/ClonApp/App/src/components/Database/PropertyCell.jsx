import React from 'react';

export function PropertyCell({ database, item, property, value, onChange, onPageClick }) {
    const renderInput = () => {
        switch (property.type) {
            case 'title':
                return (
                    <div
                        onClick={onPageClick}
                        className="font-medium text-blue-600 hover:underline cursor-pointer"
                    >
                        {value || 'Sin título'}
                    </div>
                );

            case 'text':
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full outline-none bg-transparent"
                        placeholder="Vacío"
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full outline-none bg-transparent"
                        placeholder="0"
                    />
                );

            case 'checkbox':
                return (
                    <input
                        type="checkbox"
                        checked={value || false}
                        onChange={(e) => onChange(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300"
                    />
                );

            case 'select':
                const options = property.config?.options || [];
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full outline-none bg-transparent border border-zinc-200 rounded px-2 py-1"
                    >
                        <option value="">Seleccionar...</option>
                        {options.map(opt => (
                            <option key={opt.label} value={opt.label}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );

            case 'multi-select':
                const selectedTags = Array.isArray(value) ? value : [];
                const availableOptions = property.config?.options || [];

                return (
                    <div className="flex flex-wrap gap-1">
                        {selectedTags.map(tag => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 flex items-center gap-1"
                            >
                                {tag}
                                <button
                                    onClick={() => onChange(selectedTags.filter(t => t !== tag))}
                                    className="hover:text-blue-900"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <select
                            value=""
                            onChange={(e) => {
                                if (e.target.value && !selectedTags.includes(e.target.value)) {
                                    onChange([...selectedTags, e.target.value]);
                                }
                            }}
                            className="text-xs border-none outline-none bg-transparent"
                        >
                            <option value="">+</option>
                            {availableOptions.map(opt => (
                                <option key={opt.label} value={opt.label}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full outline-none bg-transparent border border-zinc-200 rounded px-2 py-1"
                    />
                );

            case 'url':
                return (
                    <input
                        type="url"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full outline-none bg-transparent text-blue-600 hover:underline"
                        placeholder="https://..."
                    />
                );

            default:
                return <span className="text-zinc-400">-</span>;
        }
    };

    return <div className="min-w-[120px]">{renderInput()}</div>;
}
