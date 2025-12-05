import React, { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TableView } from './TableView';
import { BoardView } from './BoardView';
import { ListView } from './ListView';
import { DatabaseToolbar } from './DatabaseToolbar';
import { ViewTabs } from './ViewTabs';
import { PropertyConfigModal } from '../Modals/PropertyConfigModal';

export function DatabaseView({ databaseId }) {
    const { activeWorkspace, actions } = useAppStore();

    const [selectedProperty, setSelectedProperty] = useState(null);

    const database = useMemo(() => {
        return (activeWorkspace?.databases || []).find(db => db.id === databaseId);
    }, [activeWorkspace, databaseId]);

    if (!database) {
        return <div className="p-4 text-zinc-500">Base de datos no encontrada</div>;
    }

    const activeView = database.views.find(v => v.id === database.activeViewId) || database.views[0];

    // Apply filters
    const filteredItems = useMemo(() => {
        let items = [...database.items];

        activeView?.filters.forEach(filter => {
            items = items.filter(item => {
                const value = item.values[filter.propertyId];
                const property = database.properties.find(p => p.id === filter.propertyId);

                if (filter.condition === 'is') {
                    return value === filter.value;
                } else if (filter.condition === 'contains') {
                    return String(value || '').toLowerCase().includes(String(filter.value || '').toLowerCase());
                } else if (filter.condition === 'is-empty') {
                    return !value || value === '';
                } else if (filter.condition === 'is-not-empty') {
                    return value && value !== '';
                }

                return true;
            });
        });

        return items;
    }, [database.items, activeView?.filters]);

    // Apply sorts
    const sortedItems = useMemo(() => {
        let items = [...filteredItems];

        activeView?.sorts.forEach(sort => {
            items.sort((a, b) => {
                const aVal = a.values[sort.propertyId];
                const bVal = b.values[sort.propertyId];

                if (aVal === bVal) return 0;
                if (!aVal) return 1;
                if (!bVal) return -1;

                const comparison = aVal < bVal ? -1 : 1;
                return sort.direction === 'asc' ? comparison : -comparison;
            });
        });

        return items;
    }, [filteredItems, activeView?.sorts]);

    const renderView = () => {
        switch (activeView?.type) {
            case 'table':
                return <TableView database={database} items={sortedItems} actions={actions} onPropertyClick={setSelectedProperty} />;
            case 'board':
                return <BoardView database={database} items={sortedItems} actions={actions} activeView={activeView} />;
            case 'list':
                return <ListView database={database} items={sortedItems} actions={actions} />;
            default:
                return <div className="p-4 text-zinc-500">Vista no soportada</div>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Database Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200">
                <span className="text-2xl">{database.icon}</span>
                <input
                    type="text"
                    value={database.title}
                    onChange={(e) => actions.updateDatabase(databaseId, { title: e.target.value })}
                    className="text-2xl font-bold outline-none flex-1 bg-transparent"
                    placeholder="Base de datos sin título"
                />
            </div>

            {/* View Tabs */}
            <ViewTabs database={database} actions={actions} />

            {/* Toolbar */}
            <DatabaseToolbar database={database} activeView={activeView} actions={actions} />

            {/* View Content */}
            <div className="flex-1 overflow-auto px-6 py-4">
                {renderView()}
            </div>

            {/* Property Config Modal */}
            {selectedProperty && (
                <PropertyConfigModal
                    isOpen={!!selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    property={selectedProperty}
                    databaseId={databaseId}
                    actions={actions}
                />
            )}
        </div>
    );
}
