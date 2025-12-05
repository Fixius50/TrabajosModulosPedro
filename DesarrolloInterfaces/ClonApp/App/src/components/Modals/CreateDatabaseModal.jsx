import React, { useState } from 'react';
import { X, Table, List, Trello } from 'lucide-react';

export function CreateDatabaseModal({ isOpen, onClose, actions, setActiveDatabaseId, setUi }) {
    const [name, setName] = useState('');
    const [viewType, setViewType] = useState('table');

    const handleCreate = () => {
        if (!name.trim()) return;

        const databaseId = actions.addDatabase(name, 'fullpage', null);

        // Switch to database view
        setUi(p => ({ ...p, currentView: 'database' }));
        setActiveDatabaseId(databaseId);

        // Reset and close
        setName('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Nueva Base de Datos</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            autoFocus
                            placeholder="Mi base de datos..."
                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                            Vista inicial
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setViewType('table')}
                                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${viewType === 'table'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-zinc-200 hover:bg-zinc-50'
                                    }`}
                            >
                                <Table size={20} />
                                <span className="text-xs">Tabla</span>
                            </button>
                            <button
                                onClick={() => setViewType('board')}
                                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${viewType === 'board'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-zinc-200 hover:bg-zinc-50'
                                    }`}
                            >
                                <Trello size={20} />
                                <span className="text-xs">Tablero</span>
                            </button>
                            <button
                                onClick={() => setViewType('list')}
                                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${viewType === 'list'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-zinc-200 hover:bg-zinc-50'
                                    }`}
                            >
                                <List size={20} />
                                <span className="text-xs">Lista</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Crear
                    </button>
                </div>
            </div>
        </div>
    );
}
