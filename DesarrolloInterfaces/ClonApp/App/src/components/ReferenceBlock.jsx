import React from 'react';
import { FileText, Database, ExternalLink } from 'lucide-react';

export function ReferenceBlock({ reference, onClick }) {
    const { type, id, title, icon } = reference;

    const handleClick = (e) => {
        e.preventDefault();
        if (onClick) {
            onClick(reference);
        }
    };

    return (
        <span
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-2 py-1 mx-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded cursor-pointer transition-colors text-sm border border-blue-200"
            contentEditable={false}
        >
            {/* Icon */}
            <span className="text-base">{icon || (type === 'database' ? '📊' : '📄')}</span>

            {/* Title */}
            <span className="font-medium">{title || 'Sin título'}</span>

            {/* Type icon */}
            {type === 'database' ? (
                <Database size={12} className="opacity-60" />
            ) : (
                <FileText size={12} className="opacity-60" />
            )}

            {/* External link indicator */}
            <ExternalLink size={10} className="opacity-40" />
        </span>
    );
}
