import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import {
    List, CheckSquare, Quote, Info, Minus, Type, GripVertical, Check, ExternalLink, Play
} from 'lucide-react';

const LinkPreview = ({ url }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    if (!url) return null;

    const isYoutube = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);

    if (isYoutube) {
        const videoId = isYoutube[1];
        return (
            <div className="my-2 rounded-lg overflow-hidden shadow-sm border border-zinc-200 bg-black">
                <iframe
                    width="100%"
                    height="315"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="aspect-video"
                ></iframe>
            </div>
        );
    }

    return (
        <>
            <div onClick={() => setShowConfirm(true)} className="my-2 p-3 border border-zinc-200 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-zinc-50 transition-colors group">
                <div className="w-10 h-10 bg-zinc-100 rounded flex items-center justify-center text-zinc-400 group-hover:text-zinc-600">
                    <ExternalLink size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-900 truncate">{url}</div>
                    <div className="text-xs text-zinc-500">Haz clic para abrir el enlace</div>
                </div>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}>
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-2">Abrir enlace externo</h3>
                        <p className="text-zinc-600 mb-6 text-sm">Estás a punto de salir de ClonApp para visitar:<br /><span className="text-indigo-600 font-medium break-all">{url}</span></p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-zinc-500 hover:bg-zinc-100 rounded-lg text-sm font-medium">Cancelar</button>
                            <button onClick={() => { window.open(url, '_blank'); setShowConfirm(false); }} className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-black">Ir al sitio</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const SlashMenu = ({ query, onSelect, onClose }) => {
    const [activeCategory, setActiveCategory] = useState('basicos');

    const categories = {
        basicos: {
            label: 'Básicos',
            items: [
                { id: 'h1', label: 'Encabezado 1', icon: <Type size={18} />, desc: 'Título grande' },
                { id: 'h2', label: 'Encabezado 2', icon: <Type size={16} />, desc: 'Título mediano' },
                { id: 'h3', label: 'Encabezado 3', icon: <Type size={14} />, desc: 'Título pequeño' },
                { id: 'bullet', label: 'Lista', icon: <List size={16} />, desc: 'Lista simple' },
                { id: 'todo', label: 'Tareas', icon: <CheckSquare size={16} />, desc: 'Tareas pendientes' },
            ]
        },
        avanzados: {
            label: 'Avanzados',
            items: [
                { id: 'quote', label: 'Cita', icon: <Quote size={16} />, desc: 'Captura una cita' },
                { id: 'callout', label: 'Destacado', icon: <Info size={16} />, desc: 'Resalta información' },
                { id: 'divider', label: 'Divisor', icon: <Minus size={16} />, desc: 'Separa visualmente' },
            ]
        }
    };

    const allItems = Object.values(categories).flatMap(cat => cat.items);
    const filtered = query ? allItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase())) : categories[activeCategory].items;

    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => (prev + 1) % filtered.length); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length); }
            else if (e.key === 'Enter') { e.preventDefault(); onSelect(filtered[selectedIndex].id); }
            else if (e.key === 'Escape') { onClose(); }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [filtered, selectedIndex, onSelect, onClose]);

    if (filtered.length === 0) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute top-full left-0 z-50 w-80 bg-white rounded-lg shadow-popover border border-zinc-200 overflow-hidden mt-2 max-h-96">
            {!query && (
                <div className="border-b border-zinc-100 bg-zinc-50/50">
                    <div className="flex gap-1 px-2 py-1.5">
                        {Object.entries(categories).map(([key, cat]) => (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key)}
                                className={clsx(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                    activeCategory === key
                                        ? "bg-white shadow-sm text-zinc-900 border border-zinc-200"
                                        : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="p-1.5 space-y-0.5 max-h-80 overflow-y-auto">
                {query && <div className="text-xs font-bold text-zinc-400 px-2 py-1 uppercase">Resultados</div>}
                {filtered.map((item, i) => (
                    <div key={item.id} onClick={() => onSelect(item.id)} className={clsx("flex items-center gap-3 px-2 py-1.5 rounded cursor-pointer transition-colors", i === selectedIndex ? "bg-zinc-100" : "hover:bg-zinc-50")}>
                        <div className="w-10 h-10 rounded border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 shrink-0 shadow-sm">{item.icon}</div>
                        <div><div className="text-sm font-medium text-zinc-800">{item.label}</div><div className="text-xs text-zinc-400">{item.desc}</div></div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export const FancyEditable = ({ tagName: Tag, html, className, onChange, onKeyDown, placeholder, disabled, autoFocus }) => {
    const contentEditableRef = useRef(null);
    useEffect(() => { if (autoFocus && contentEditableRef.current) contentEditableRef.current.focus(); }, [autoFocus]);
    useLayoutEffect(() => { if (contentEditableRef.current && contentEditableRef.current.innerText !== html) contentEditableRef.current.innerText = html; }, [html]);
    return <Tag ref={contentEditableRef} className={clsx(className, "empty:before:content-[attr(placeholder)] empty:before:text-zinc-300 outline-none")} contentEditable={!disabled} suppressContentEditableWarning onInput={(e) => onChange && onChange(e.currentTarget.innerText)} onKeyDown={onKeyDown} placeholder={placeholder} />;
};

export const EditorBlock = ({ block, index, actions }) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (['bullet', 'todo'].includes(block.type)) {
                if (!block.content) {
                    if ((block.level || 0) > 0) actions.updateBlock(block.id, { level: (block.level || 0) - 1 });
                    else actions.updateBlock(block.id, { type: 'p' });
                } else actions.addBlock(index + 1, { type: block.type, level: block.level || 0 });
            } else actions.addBlock(index + 1);
        } else if (e.key === 'Backspace' && (!block.content)) {
            e.preventDefault();
            if ((block.level || 0) > 0) actions.updateBlock(block.id, { level: (block.level || 0) - 1 });
            else if (['bullet', 'todo'].includes(block.type)) actions.updateBlock(block.id, { type: 'p' });
            else actions.deleteBlock(index);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const currentLevel = block.level || 0;
            actions.updateBlock(block.id, { level: e.shiftKey ? Math.max(0, currentLevel - 1) : Math.min(3, currentLevel + 1) });
        }
    };

    const handleChange = (val) => {
        if (block.type === 'p') {
            const shortcuts = { '# ': 'h1', '## ': 'h2', '### ': 'h3', '- ': 'bullet', '[] ': 'todo', '> ': 'quote', '---': 'divider' };
            if (shortcuts[val]) { actions.updateBlock(block.id, { type: shortcuts[val], content: '' }); return; }
        }
        actions.updateBlock(block.id, { content: val });
    };

    const showSlashMenu = block.type === 'p' && block.content.startsWith('/');
    const slashQuery = showSlashMenu ? block.content.substring(1) : '';

    const urlMatch = block.type === 'p' && block.content.match(/(https?:\/\/[^\s]+)/g);
    const firstUrl = urlMatch ? urlMatch[0] : null;

    return (
        <motion.div id={block.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="group relative flex items-start pl-2 md:pl-6 mb-1 py-0.5">
            <div className="absolute left-0 top-1.5 p-0.5 text-zinc-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:text-zinc-500 transition-opacity touch-none hidden md:block"><GripVertical size={16} /></div>
            <div className="w-full relative">
                {showSlashMenu && <SlashMenu query={slashQuery} onSelect={(type) => actions.updateBlock(block.id, { type, content: '' })} onClose={() => { }} />}
                {block.type === 'h1' && <FancyEditable tagName="h1" html={block.content} className="text-3xl font-bold text-zinc-800 mb-2 mt-6" placeholder="Encabezado 1" onKeyDown={handleKeyDown} onChange={handleChange} autoFocus />}
                {block.type === 'h2' && <FancyEditable tagName="h2" html={block.content} className="text-2xl font-semibold text-zinc-800 mb-1 mt-4" placeholder="Encabezado 2" onKeyDown={handleKeyDown} onChange={handleChange} autoFocus />}
                {block.type === 'h3' && <FancyEditable tagName="h3" html={block.content} className="text-xl font-semibold text-zinc-800 mb-1 mt-3" placeholder="Encabezado 3" onKeyDown={handleKeyDown} onChange={handleChange} autoFocus />}
                {block.type === 'p' && (
                    <>
                        <FancyEditable tagName="p" html={block.content} className="text-base text-zinc-700 leading-relaxed min-h-[1.5rem]" placeholder='Escribe "/" para comandos...' onKeyDown={handleKeyDown} onChange={handleChange} autoFocus />
                        {firstUrl && <LinkPreview url={firstUrl} />}
                    </>
                )}
                {block.type === 'bullet' && (
                    <div className="flex items-start gap-2" style={{ marginLeft: (block.level || 0) * 1.5 + 'rem' }}>
                        <div className={clsx("mt-2.5 shrink-0 transition-all", (block.level || 0) % 3 === 0 ? "w-1.5 h-1.5 rounded-full bg-zinc-800" : (block.level || 0) % 3 === 1 ? "w-1.5 h-1.5 rounded-full border border-zinc-800 bg-transparent" : "w-1.5 h-1.5 bg-zinc-800")} />
                        <FancyEditable tagName="p" html={block.content} className="flex-1 text-base text-zinc-700 leading-relaxed" placeholder="Lista" onKeyDown={handleKeyDown} onChange={(val) => actions.updateBlock(block.id, { content: val })} autoFocus />
                    </div>
                )}
                {block.type === 'todo' && (
                    <div className="flex items-start gap-3" style={{ marginLeft: (block.level || 0) * 1.5 + 'rem' }}>
                        <div onClick={() => actions.updateBlock(block.id, { checked: !block.checked })} className={clsx("mt-1 w-4 h-4 rounded-[3px] border cursor-pointer flex items-center justify-center transition-colors", block.checked ? 'bg-[#2EAADC] border-[#2EAADC]' : 'border-zinc-400 hover:bg-zinc-100')}>{block.checked && <Check size={12} className="text-white" />}</div>
                        <FancyEditable tagName="p" html={block.content} className={clsx("flex-1 text-base min-h-[1.5rem] transition-opacity", block.checked ? 'line-through text-zinc-400 opacity-50' : 'text-zinc-700')} placeholder="Tarea por hacer" onKeyDown={handleKeyDown} onChange={(val) => actions.updateBlock(block.id, { content: val })} autoFocus />
                    </div>
                )}
                {block.type === 'quote' && <div className="flex items-start gap-3 pl-4 border-l-4 border-zinc-900 my-2"><FancyEditable tagName="p" html={block.content} className="text-lg italic text-zinc-700" placeholder="Cita..." onKeyDown={handleKeyDown} onChange={(val) => actions.updateBlock(block.id, { content: val })} autoFocus /></div>}
                {block.type === 'divider' && <div className="py-4"><div className="h-px bg-zinc-200 w-full" /></div>}
                {block.type === 'callout' && <div className="p-4 bg-zinc-50 rounded-lg flex gap-3 border border-zinc-200 my-2"><Info size={20} className="text-zinc-500 shrink-0" /><FancyEditable tagName="p" html={block.content} className="text-base text-zinc-800" placeholder="Destacado..." onKeyDown={handleKeyDown} onChange={(val) => actions.updateBlock(block.id, { content: val })} autoFocus /></div>}
            </div>
        </motion.div>
    );
};
