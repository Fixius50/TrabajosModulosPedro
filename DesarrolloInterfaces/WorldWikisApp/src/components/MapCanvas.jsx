import React, { useState, useRef } from 'react';

function MapCanvas({ entities, connections, selectedId, onSelect, onUpdateEntity }) {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedEntityId, setDraggedEntityId] = useState(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const getTypeIcon = (type) => {
        const map = {
            'zone': 'ri-map-pin-line',
            'person': 'ri-user-line',
            'creature': 'ri-aliens-line',
            'item': 'ri-sword-line',
            'event': 'ri-calendar-event-line',
            'law': 'ri-scales-line'
        };
        return map[type] || 'ri-question-line';
    };

    const getChildren = (parentId) => {
        return entities.filter(e => e.parentId === parentId);
    };

    // Drag Handlers
    const startDrag = (event, entity) => {
        event.stopPropagation(); // Prevent map click
        setIsDragging(true);
        setDraggedEntityId(entity.id);
        dragOffset.current = {
            x: event.clientX - entity.x,
            y: event.clientY - entity.y
        };
        onSelect(entity.id);
    };

    const onDrag = (event) => {
        if (!isDragging || !draggedEntityId) return;

        const newX = event.clientX - dragOffset.current.x;
        const newY = event.clientY - dragOffset.current.y;

        onUpdateEntity(draggedEntityId, { x: newX, y: newY });
    };

    const stopDrag = () => {
        setIsDragging(false);
        setDraggedEntityId(null);
    };

    return (
        <main
            className="map-container"
            onMouseMove={onDrag}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onClick={() => onSelect(null)} // Deselect on map click
        >
            {/* Connections SVG */}
            <svg className="connections-layer">
                {connections.map(conn => (
                    <path
                        key={conn.id}
                        d={conn.path}
                        className={`connection ${conn.isActive ? 'active' : ''}`}
                    />
                ))}
            </svg>

            {/* Entities */}
            {entities.map(entity => (
                <div
                    key={entity.id}
                    className={`entity-node ${selectedId === entity.id ? 'selected' : ''}`}
                    style={{ left: entity.x + 'px', top: entity.y + 'px' }}
                    onMouseDown={(e) => startDrag(e, entity)}
                    onClick={(e) => { e.stopPropagation(); onSelect(entity.id); }}
                >
                    <div className="entity-header">
                        <i className={`${getTypeIcon(entity.type)} entity-type-icon`}></i>
                        <span>{entity.name}</span>
                    </div>
                    <div className="text-sm text-muted" style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entity.type.toUpperCase()}
                    </div>

                    {/* Children Indicators */}
                    {getChildren(entity.id).length > 0 && (
                        <div className="entity-children">
                            {getChildren(entity.id).map(child => (
                                <span key={child.id} className="child-badge">
                                    {child.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </main>
    );
}

export default MapCanvas;
