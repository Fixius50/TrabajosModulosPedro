import React, { useState } from 'react';
import { ImageIcon, FileText, Plus } from 'lucide-react';
import { FancyEditable, EditorBlock } from '../../components/Editor';
import { IconPickerInline } from '../IconPickerInline';

export function PageView({ activePage, activePageId, ui, setUi, actions }) {
    const [showIconPicker, setShowIconPicker] = useState(false);

    if (!activePage) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4"><FileText size={32} /></div>
                <p>Selecciona o crea una página</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 pb-32">
            {/* Cover & Icon */}
            <div className="group relative mb-8">
                {activePage.cover && <div className="h-48 w-full rounded-xl bg-cover bg-center mb-8 shadow-sm" style={{ backgroundImage: activePage.cover.startsWith('http') ? `url(${activePage.cover})` : activePage.cover }} />}
                {!activePage.cover && <div className="h-12 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs text-zinc-400 mb-4">
                    <button onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: true } }))} className="hover:bg-zinc-100 px-2 py-1 rounded flex items-center gap-1"><ImageIcon size={12} /> Añadir portada</button>
                </div>}

                <div className="text-7xl mb-4 group relative w-fit">
                    <div
                        className="cursor-pointer"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                    >
                        {activePage.icon?.startsWith('http') || activePage.icon?.startsWith('data:') ?
                            <img src={activePage.icon} alt="" className="w-20 h-20 object-contain" /> :
                            (activePage.icon || <FileText size={64} className="text-zinc-200" />)
                        }
                    </div>

                    {showIconPicker && (
                        <IconPickerInline
                            onSelect={(icon) => {
                                actions.updatePage(activePageId, { icon });
                                setShowIconPicker(false);
                            }}
                            onClose={() => setShowIconPicker(false)}
                        />
                    )}
                </div>
                <FancyEditable tagName="h1" html={activePage.title} className="text-4xl font-bold text-zinc-900 placeholder:text-zinc-300 mb-8 outline-none break-words" placeholder="Título de la página" onChange={(val) => actions.updatePage(activePageId, { title: val })} />
            </div>

            {/* Blocks */}
            <div className="space-y-1">
                {activePage.blocks.map((block, index) => (
                    <EditorBlock key={block.id} block={block} index={index} actions={actions} />
                ))}
                <div className="h-24 group flex items-center text-zinc-300 hover:text-zinc-400 cursor-text" onClick={() => actions.addBlock(activePage.blocks.length)}>
                    <Plus size={20} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Haz clic para añadir un bloque</span>
                </div>
            </div>
        </div>
    );
}
