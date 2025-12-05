import React from 'react';
import { DatabaseView } from './Database/DatabaseView';

export function InlineDatabaseBlock({ databaseId, onDelete }) {
    if (!databaseId) {
        return (
            <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-400 text-sm">
                Database no encontrada
            </div>
        );
    }

    return (
        <div className="my-4 border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <DatabaseView databaseId={databaseId} inline={true} />

            {/* Optional: Delete button for inline database */}
            {onDelete && (
                <div className="px-4 py-2 border-t border-zinc-200 bg-zinc-50 flex justify-end">
                    <button
                        onClick={onDelete}
                        className="text-xs text-zinc-500 hover:text-red-600 transition-colors"
                    >
                        Eliminar database
                    </button>
                </div>
            )}
        </div>
    );
}
