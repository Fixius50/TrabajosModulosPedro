import React from 'react';
import { Modal } from '../UI';
import { ICONS_LIST } from '../../lib/utils';

export function IconPickerModal({ ui, setUi, actions, activePageId }) {
    return (
        <Modal isOpen={ui.modals.iconPickerModal} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, iconPickerModal: false } }))} title="Elegir Icono">
            <div className="p-4">
                <div className="grid grid-cols-8 gap-2">
                    {ICONS_LIST.map(icon => (
                        <button key={icon} onClick={() => { actions.updatePage(activePageId, { icon }); setUi(p => ({ ...p, modals: { ...p.modals, iconPickerModal: false } })); }} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 rounded text-xl">
                            {icon}
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    );
}
