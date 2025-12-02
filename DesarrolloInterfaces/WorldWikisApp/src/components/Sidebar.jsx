import React from 'react';

function Sidebar({ selectedEntity, availableParents, onCreate, onUpdate, onDelete, onLoadExample, onClear }) {

    const handleInputChange = (e, field) => {
        onUpdate(selectedEntity.id, { [field]: e.target.value });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand">
                    <i className="ri-earth-line"></i> WorldWikis
                </div>
            </div>

            <div className="sidebar-content">
                {/* Entity Editor */}
                {selectedEntity ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold">Edit Entity</h3>
                            <button className="btn btn-danger" onClick={() => onDelete(selectedEntity.id)}>
                                <i className="ri-delete-bin-line"></i>
                            </button>
                        </div>

                        <div className="input-group">
                            <label className="label">Name</label>
                            <input
                                className="input"
                                value={selectedEntity.name}
                                onChange={(e) => handleInputChange(e, 'name')}
                                placeholder="Entity Name"
                            />
                        </div>

                        <div className="input-group">
                            <label className="label">Type</label>
                            <select
                                className="select"
                                value={selectedEntity.type}
                                onChange={(e) => handleInputChange(e, 'type')}
                            >
                                <option value="zone">Zone/Location</option>
                                <option value="person">Person/Character</option>
                                <option value="creature">Creature</option>
                                <option value="item">Item/Artifact</option>
                                <option value="event">Event</option>
                                <option value="law">Law/Logic</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="label">Description</label>
                            <textarea
                                className="textarea"
                                value={selectedEntity.description}
                                onChange={(e) => handleInputChange(e, 'description')}
                                placeholder="Write the lore..."
                            ></textarea>
                        </div>

                        <div className="input-group">
                            <label className="label">Parent (Container)</label>
                            <select
                                className="select"
                                value={selectedEntity.parentId || ''}
                                onChange={(e) => onUpdate(selectedEntity.id, { parentId: e.target.value || null })}
                            >
                                <option value="">None (Root)</option>
                                {availableParents.map(ent => (
                                    <option key={ent.id} value={ent.id}>
                                        {ent.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-4 text-muted">
                        <p>Select an entity to edit or create a new one.</p>
                    </div>
                )}
            </div>

            <div className="sidebar-footer flex flex-col gap-2">
                <button className="btn btn-primary w-full" onClick={onCreate}>
                    <i className="ri-add-line"></i> New Entity
                </button>
                <button className="btn w-full" onClick={onLoadExample}>
                    <i className="ri-magic-line"></i> Load Example
                </button>
                <button className="btn w-full" onClick={onClear}>
                    <i className="ri-refresh-line"></i> Reset World
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
