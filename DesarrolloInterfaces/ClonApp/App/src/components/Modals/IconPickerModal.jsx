import React from 'react';
import { Modal } from '../UI';
import { ICONS_LIST } from '../../lib/utils';

const IconPickerModal = ({ isOpen, onClose, actions, activePageId }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Elegir Icono">
            <div className="p-4">
                <div className="grid grid-cols-8 gap-2">
                    {ICONS_LIST.map(icon => (
                        <button key={icon} onClick={() => { actions.updatePage(activePageId, { icon }); onClose(); }} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 rounded text-xl">
                            {icon}
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default IconPickerModal;
