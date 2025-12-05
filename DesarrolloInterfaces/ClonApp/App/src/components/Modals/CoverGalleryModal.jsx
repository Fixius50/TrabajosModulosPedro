import React from 'react';
import { Modal } from '../UI';
import { COVER_COLORS, COVER_IMAGES } from '../../lib/utils';

export function CoverGalleryModal({ ui, setUi, actions, activePageId, downloads }) {
    return (
        <Modal isOpen={ui.modals.coverGallery} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: false } }))} title="Galería de Portadas">
            <div className="p-4 space-y-4">
                {/* Downloaded Covers Section */}
                {downloads?.covers && downloads.covers.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-3">📥 Descargados</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {downloads.covers.map(cover => (
                                <div
                                    key={cover.id}
                                    onClick={() => {
                                        actions.updatePage(activePageId, { cover: cover.url });
                                        setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: false } }));
                                    }}
                                    className="h-24 rounded-lg cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-indigo-500 transition-all bg-cover bg-center"
                                    style={{ backgroundImage: `url(${cover.url})` }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Color Covers */}
                <div>
                    {downloads?.covers && downloads.covers.length > 0 && (
                        <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-3">🎨 Colores</h4>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        {COVER_COLORS.map(c => (
                            <div
                                key={c.id}
                                onClick={() => {
                                    actions.updatePage(activePageId, { cover: c.color });
                                    setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: false } }));
                                }}
                                className="h-24 rounded-lg cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-indigo-500 transition-all"
                                style={{ background: c.color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Image Covers */}
                <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-3">🖼️ Imágenes</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {COVER_IMAGES.map((img, i) => (
                            <div
                                key={i}
                                onClick={() => {
                                    actions.updatePage(activePageId, { cover: img });
                                    setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: false } }));
                                }}
                                className="h-24 rounded-lg cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-indigo-500 transition-all bg-cover bg-center"
                                style={{ backgroundImage: `url(${img})` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
