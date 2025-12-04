import React from 'react';
import { Modal } from '../UI';

const CreateWorkspaceModal = ({ isOpen, onClose, newWorkspaceName, setNewWorkspaceName, actions }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Workspace">
            <div className="p-4">
                <input autoFocus value={newWorkspaceName} onChange={e => setNewWorkspaceName(e.target.value)} placeholder="Nombre del espacio de trabajo" className="w-full p-2 border border-zinc-200 rounded mb-4 outline-none focus:border-black" />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-zinc-500 hover:bg-zinc-100 rounded">Cancelar</button>
                    <button onClick={() => { if (newWorkspaceName.trim()) { actions.addWorkspace(newWorkspaceName); setNewWorkspaceName(''); onClose(); } }} disabled={!newWorkspaceName.trim()} className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 disabled:opacity-50">Crear</button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateWorkspaceModal;
