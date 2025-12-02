import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MapCanvas from './components/MapCanvas';
import WikiView from './components/WikiView';

function App() {
    // --- State ---
    const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'wiki'
    const [entities, setEntities] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [worldName, setWorldName] = useState('Antigravity Realm');

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('worldWikis_data');
        if (saved) {
            try {
                setEntities(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved data", e);
            }
        } else {
            // Seed data
            setEntities([
                { id: '1', name: 'Mystic Forest', type: 'zone', description: 'A forest shrouded in eternal mist.', x: 100, y: 100, parentId: null },
                { id: '2', name: 'Elder Tree', type: 'creature', description: 'The guardian of the forest.', x: 150, y: 250, parentId: '1' }
            ]);
        }
    }, []);

    useEffect(() => {
        if (entities.length > 0) {
            localStorage.setItem('worldWikis_data', JSON.stringify(entities));
        }
    }, [entities]);

    // --- Computed / Derived State ---
    const selectedEntity = useMemo(() =>
        entities.find(e => e.id === selectedId),
        [entities, selectedId]);

    const rootEntities = useMemo(() =>
        entities.filter(e => !e.parentId),
        [entities]);

    const availableParents = useMemo(() => {
        if (!selectedEntity) return [];
        // Prevent circular references (simple check: can't be own parent)
        // For full cycle detection, a more complex check is needed, but this matches original logic
        return entities.filter(e => e.id !== selectedEntity.id);
    }, [entities, selectedEntity]);

    const connections = useMemo(() => {
        const conns = [];
        entities.forEach(child => {
            if (child.parentId) {
                const parent = entities.find(p => p.id === child.parentId);
                if (parent) {
                    const startX = child.x + 75; // Center of 150px width
                    const startY = child.y;
                    const endX = parent.x + 75;
                    const endY = parent.y + 100; // Height approx
                    const path = `M ${startX} ${startY} C ${startX} ${startY - 50}, ${endX} ${endY + 50}, ${endX} ${endY}`;
                    conns.push({
                        id: `${child.id}-${parent.id}`,
                        path: path,
                        isActive: selectedId === child.id || selectedId === parent.id
                    });
                }
            }
        });
        return conns;
    }, [entities, selectedId]);

    // --- Actions ---
    const createEntity = () => {
        const newId = Date.now().toString();
        const newEntity = {
            id: newId,
            name: 'New Entity',
            type: 'zone',
            description: '',
            x: Math.random() * (window.innerWidth - 300) + 50,
            y: Math.random() * (window.innerHeight - 200) + 50,
            parentId: null
        };
        setEntities(prev => [...prev, newEntity]);
        setSelectedId(newId);
    };

    const updateEntity = (id, updates) => {
        setEntities(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    };

    const deleteEntity = (id) => {
        if (!window.confirm('Are you sure? This will unlink children.')) return;
        setEntities(prev => {
            // Unlink children
            const newEntities = prev.map(e => e.parentId === id ? { ...e, parentId: null } : e);
            // Remove entity
            return newEntities.filter(e => e.id !== id);
        });
        setSelectedId(null);
    };

    const clearWorld = () => {
        if (window.confirm('Delete everything?')) {
            setEntities([]);
            setSelectedId(null);
        }
    };

    const loadExampleWorld = () => {
        if (entities.length > 0 && !window.confirm('Overwrite current world with example?')) return;

        setEntities([
            { id: 'z1', name: 'Kingdom of Aethelgard', type: 'zone', description: 'The central kingdom of humans, known for its high stone walls and the Iron Law.', x: 400, y: 50, parentId: null },
            { id: 'z2', name: 'Royal Capital', type: 'zone', description: 'The heart of Aethelgard.', x: 400, y: 250, parentId: 'z1' },
            { id: 'p1', name: 'King Alaric', type: 'person', description: 'The stern ruler of Aethelgard. He wields the Sunblade.', x: 300, y: 450, parentId: 'z2' },
            { id: 'i1', name: 'Sunblade', type: 'item', description: 'A legendary sword said to cut through darkness itself.', x: 300, y: 600, parentId: 'p1' },
            { id: 'z3', name: 'Whispering Woods', type: 'zone', description: 'A mysterious forest bordering the kingdom.', x: 800, y: 100, parentId: null },
            { id: 'c1', name: 'Forest Spirit', type: 'creature', description: 'An ethereal being that protects the Whispering Woods.', x: 800, y: 300, parentId: 'z3' },
            { id: 'l1', name: 'Law of Magic', type: 'law', description: 'Magic cannot be created, only borrowed from the earth.', x: 100, y: 100, parentId: null }
        ]);
        setSelectedId(null);
    };

    return (
        <div id="app">
            {/* View Switcher */}
            <div className="view-switcher">
                <button
                    className={`switch-btn ${viewMode === 'editor' ? 'active' : ''}`}
                    onClick={() => setViewMode('editor')}
                >
                    <i className="ri-map-2-line"></i> Board
                </button>
                <button
                    className={`switch-btn ${viewMode === 'wiki' ? 'active' : ''}`}
                    onClick={() => setViewMode('wiki')}
                >
                    <i className="ri-book-open-line"></i> Wiki
                </button>
            </div>

            {/* Sliding Views Container */}
            <div className={`views-container ${viewMode === 'wiki' ? 'show-wiki' : ''}`}>

                {/* View 1: Editor */}
                <div className="view-panel">
                    <Sidebar
                        selectedEntity={selectedEntity}
                        availableParents={availableParents}
                        onCreate={createEntity}
                        onUpdate={updateEntity}
                        onDelete={deleteEntity}
                        onLoadExample={loadExampleWorld}
                        onClear={clearWorld}
                    />
                    <MapCanvas
                        entities={entities}
                        connections={connections}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onUpdateEntity={updateEntity}
                    />
                </div>

                {/* View 2: Wiki */}
                <div className="view-panel">
                    <WikiView
                        worldName={worldName}
                        entities={entities}
                        rootEntities={rootEntities}
                    />
                </div>

            </div>
        </div>
    );
}

export default App;
