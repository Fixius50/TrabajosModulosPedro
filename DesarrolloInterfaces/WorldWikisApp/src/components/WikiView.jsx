import React from 'react';
import DOMPurify from 'dompurify';

function WikiView({ worldName, entities, rootEntities }) {

    const getChildren = (parentId) => {
        return entities.filter(e => e.parentId === parentId);
    };

    const formatDescription = (text) => {
        if (!text) return { __html: '<i>No description available.</i>' };

        // Sanitize first
        let clean = DOMPurify.sanitize(text);

        // Auto-link
        const sortedNames = entities.map(e => ({ name: e.name, id: e.id }))
            .sort((a, b) => b.name.length - a.name.length);

        sortedNames.forEach(({ name, id }) => {
            const regex = new RegExp(`\\b${name}\\b`, 'gi');
            // We can't easily do onclick scroll in React dangerouslySetInnerHTML without global handlers or custom parsing.
            // For simplicity in this refactor, we'll use standard anchor links with IDs.
            // The smooth scroll might need a global listener or just CSS scroll-behavior.
            clean = clean.replace(regex, (match) => `<a href="#wiki-entity-${id}" class="wiki-link">${match}</a>`);
        });

        return { __html: clean };
    };

    return (
        <div className="wiki-view">
            {/* TOC Sidebar */}
            <nav className="wiki-sidebar">
                <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1f2937' }}>Contents</h3>
                {rootEntities.map(root => (
                    <div key={root.id}>
                        <a href={`#wiki-entity-${root.id}`} className="wiki-toc-link">{root.name}</a>
                        {getChildren(root.id).length > 0 && (
                            <div className="wiki-toc-sub">
                                {getChildren(root.id).map(child => (
                                    <a key={child.id} href={`#wiki-entity-${child.id}`} className="wiki-toc-link">
                                        {child.name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Main Content */}
            <main className="wiki-content">
                <h1 className="wiki-h1">{worldName}</h1>

                {entities.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '4rem' }}>
                        <p>The world is empty. Go back to the Board to create history.</p>
                    </div>
                )}

                {rootEntities.map(rootEntity => (
                    <div key={rootEntity.id} className="wiki-section">
                        {/* Root Entity */}
                        <section id={`wiki-entity-${rootEntity.id}`}>
                            <aside className="wiki-infobox">
                                <div className="infobox-title">{rootEntity.name}</div>
                                <div className="infobox-row"><span>Type</span> <strong>{rootEntity.type}</strong></div>
                                <div className="infobox-row"><span>Children</span> <strong>{getChildren(rootEntity.id).length}</strong></div>
                            </aside>

                            <h2 className="wiki-h2">{rootEntity.name}</h2>
                            <p className="wiki-p" dangerouslySetInnerHTML={formatDescription(rootEntity.description)}></p>
                        </section>

                        {/* Children */}
                        {getChildren(rootEntity.id).length > 0 && (
                            <div style={{ marginLeft: '2rem' }}>
                                {getChildren(rootEntity.id).map(child => (
                                    <div key={child.id} style={{ marginTop: '2rem' }}>
                                        <section id={`wiki-entity-${child.id}`}>
                                            <aside className="wiki-infobox">
                                                <div className="infobox-title">{child.name}</div>
                                                <div className="infobox-row"><span>Type</span> <strong>{child.type}</strong></div>
                                                <div className="infobox-row"><span>Parent</span> <strong>{rootEntity.name}</strong></div>
                                            </aside>

                                            <h3 className="wiki-h3">{child.name}</h3>
                                            <p className="wiki-p" dangerouslySetInnerHTML={formatDescription(child.description)}></p>
                                        </section>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </main>
        </div>
    );
}

export default WikiView;
