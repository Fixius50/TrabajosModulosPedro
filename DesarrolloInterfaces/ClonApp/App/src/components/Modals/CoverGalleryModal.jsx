import React from 'react';
import { Modal } from '../UI';
import { COVER_COLORS, COVER_IMAGES } from '../../lib/utils';

export function CoverGalleryModal({ ui, setUi, actions, activePageId }) {
    return (
        <Modal isOpen={ui.modals.coverGallery} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: false } }))} title="Galería de Portadas">
            <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                    {COVER_COLORS.map(c => (
                        <div key={c.id} onClick={() => { actions.updatePage(activePageId, { cover: c.color }); setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: false } })); }} className="h-24 rounded-lg cursor-pointer hover:opacity-90 transition-opacity" style={{ background: c.color }} />
                    ))}
                    {COVER_IMAGES.map((img, i) => (
                        <div key={i} onClick={() => { actions.updatePage(activePageId, { cover: img }); setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: false } })); }} className="h-24 rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
                    ))}
                </div>
            </div>
        </Modal>
    );
}
