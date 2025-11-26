import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    List, Plus, Trash, Image as ImageIcon, FileText, 
    MoreHorizontal, Search, Settings, GripVertical, 
    ArrowRight, CheckSquare, Sparkles, Sidebar as SidebarIcon,
    X, Github, Palette, Type, Globe, Lock, ChevronDown, Check,
    Users, Inbox, ArrowLeft, SlidersHorizontal, User, Briefcase, Plane, Music,
    Wand2, Loader2, LayoutTemplate, Bell, ChevronsLeft
} from 'lucide-react';

/**
 * --- 1. CONFIGURACIÓN ---
 */
const VERCEL_AI_ENDPOINT = "https://trabajos-modulos-pedro-o66c11qeo-fixius50s-projects.vercel.app/api/generar-pagina";

// TOKEN RESTAURADO (Mantener en privado si es posible)
const GITHUB_TOKEN_DEFAULT = "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";
const GITHUB_OWNER = "Fixius50";
const GITHUB_REPO = "TrabajosModulosPedro";
const GITHUB_PATH = "DesarrolloInterfaces/ClonApp/App";

const generateId = () => Math.random().toString(36).substr(2, 9);
const ICONS_LIST = ['📄', '🎵', '🚀', '💼', '💡', '🎨', '🏈', '🪐', '🍎', '🍕', '⚽', '🚗', '🐶', '🐱', '🎉', '📚', '💸', '🏠', '❤️', '💀', '🔥', '✨'];

const MOCK_COVERS = {
    'ABSTRACTOS': ['https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80'],
    'NASA': ['https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80']
};

const INITIAL_WORKSPACES = [
    { 
        id: 'ws-demo', name: 'Fixius Workspace', initial: 'F', color: 'from-indigo-500 to-purple-500', email: 'user@example.com',
        pages: [] 
    }
];

/**
 * --- 2. COMPONENTES UI ---
 */
const WavyText = ({ text }) => {
  const letters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.04 * i } }),
  };
  const child = {
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 200, repeat: Infinity, repeatType: "mirror", duration: 2 } },
    hidden: { opacity: 0, y: 20, transition: { type: "spring", damping: 12, stiffness: 200 } },
  };
  return (
    <motion.div style={{ overflow: "hidden", display: "flex" }} variants={container} initial="hidden" animate="visible" className="text-zinc-400 text-sm font-medium mt-4">
      {letters.map((letter, index) => <motion.span variants={child} key={index}>{letter === " " ? "\u00A0" : letter}</motion.span>)}
    </motion.div>
  );
};

const BreathingText = ({ text }) => (
    <div className="flex flex-col items-center justify-center gap-4">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6], textShadow: ["0 0 10px rgba(99,102,241,0)", "0 0 20px rgba(99,102,241,0.5)", "0 0 10px rgba(99,102,241,0)"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-center">
            {text}
        </motion.div>
        <motion.p animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-sm text-zinc-500 font-medium">
            Generando tu página con Vercel AI...
        </motion.p>
    </div>
);

const NotificationPopup = ({ message, onClose, isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-6 right-6 bg-zinc-900/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 z-[100] border border-zinc-700/50 max-w-sm cursor-pointer" onClick={onClose}>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-full shadow-lg"><Sparkles size={18} className="text-white" /></div>
                <div className="flex-1"><h4 className="font-bold text-sm">¡Página Creada!</h4><p className="text-xs text-zinc-300 line-clamp-2">{message}</p></div>
                <button className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors shadow-sm">Aceptar</button>
            </motion.div>
        )}
    </AnimatePresence>
);

const FancyEditable = ({ tagName: Tag, html, className, onChange, onKeyDown, placeholder, disabled }) => {
    const contentEditableRef = useRef(null);
    useLayoutEffect(() => { if (contentEditableRef.current && contentEditableRef.current.innerText !== html) contentEditableRef.current.innerText = html; }, [html]);
    const handleInput = (e) => { if (onChange && e.currentTarget.innerText !== html) onChange(e.currentTarget.innerText); };
    return <Tag ref={contentEditableRef} className={`${className} empty:before:content-[attr(placeholder)] empty:before:text-zinc-400 outline-none`} contentEditable={!disabled} suppressContentEditableWarning onInput={handleInput} onKeyDown={onKeyDown} placeholder={placeholder} />;
};

const SpotlightCard = ({ children, className = "", onClick }) => {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    const handleMouseMove = (e) => { if (!divRef.current) return; const rect = divRef.current.getBoundingClientRect(); setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top }); };
    return (
        <motion.div ref={divRef} onMouseMove={handleMouseMove} onMouseEnter={() => setOpacity(1)} onMouseLeave={() => setOpacity(0)} onClick={onClick} className={`relative rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden cursor-pointer group ${className}`} whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
            <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-10" style={{ opacity, background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(0,0,0,0.05), transparent 40%)` }} />
            <div className="relative h-full z-0">{children}</div>
        </motion.div>
    );
};

const Modal = ({ isOpen, onClose, children, title, size = "max-w-2xl", transparent = false }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`fixed inset-0 m-auto ${size} h-fit max-h-[85vh] ${transparent ? 'bg-transparent shadow-none' : 'bg-white shadow-2xl border border-zinc-200'} rounded-2xl z-50 overflow-hidden flex flex-col text-zinc-800`}>
                        {title !== null && !transparent && (
                            <div className="flex justify-between items-center p-4 border-b border-zinc-100 shrink-0">
                                <h2 className="text-lg font-bold text-zinc-800">{title}</h2>
                                <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-500"><X size={20}/></button>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const EditorBlock = ({ block, index, updateBlock, addBlock, deleteBlock }) => {
    const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addBlock(index + 1); } else if (e.key === 'Backspace' && (!block.content)) { e.preventDefault(); deleteBlock(index); } };
    return (
        <motion.div layout className="group relative flex items-start pl-6 mb-1">
            <div className="absolute left-0 top-1.5 p-1 text-zinc-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:text-zinc-500 transition-opacity"><GripVertical size={16} /></div>
            <div className="w-full">
                {block.type === 'h1' && <FancyEditable tagName="h1" html={block.content} className="text-3xl font-bold text-zinc-800 mb-2" placeholder="Encabezado 1" onKeyDown={handleKeyDown} onChange={(val) => updateBlock(block.id, { content: val })} />}
                {block.type === 'p' && <FancyEditable tagName="p" html={block.content} className="text-base text-zinc-700 leading-relaxed min-h-[24px]" placeholder="Escribe '/' para comandos..." onKeyDown={handleKeyDown} onChange={(val) => updateBlock(block.id, { content: val })} />}
                {block.type === 'todo' && (
                    <div className="flex items-start gap-3">
                        <div onClick={() => updateBlock(block.id, { checked: !block.checked })} className={`mt-1 w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-colors ${block.checked ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-400 hover:border-zinc-600'}`}>{block.checked && <Check size={12} className="text-white" />}</div>
                        <FancyEditable tagName="p" html={block.content} className={`flex-1 text-base min-h-[24px] transition-opacity ${block.checked ? 'line-through text-zinc-400 opacity-50' : 'text-zinc-700'}`} placeholder="Tarea por hacer" onKeyDown={handleKeyDown} onChange={(val) => updateBlock(block.id, { content: val })} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/**
 * --- 3. MAIN APP ---
 */
function App() {
    const [workspaces, setWorkspaces] = useState(() => { const saved = localStorage.getItem('notion_v50_workspaces'); return saved ? JSON.parse(saved) : INITIAL_WORKSPACES; });
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentView, setCurrentView] = useState('home'); 
    const [settingsTab, setSettingsTab] = useState('menu'); 
    const [activeWorkspaceId, setActiveWorkspaceId] = useState('ws-demo');
    const [activePageId, setActivePageId] = useState(null);
    
    const [importedResources, setImportedResources] = useState({ styles: [], fonts: [] });
    const [notification, setNotification] = useState({ show: false, message: '' });
    
    const [showSearch, setShowSearch] = useState(false);
    const [showMarket, setShowMarket] = useState(false);
    const [marketTab, setMarketTab] = useState('gallery');
    const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [showPageOptions, setShowPageOptions] = useState(false);
    const [showAI, setShowAI] = useState(false); 
    
    const [searchQuery, setSearchQuery] = useState('');
    const [githubToken, setGithubToken] = useState(localStorage.getItem('notion_gh_token') || GITHUB_TOKEN_DEFAULT); 
    const [marketData, setMarketData] = useState({ styles: [], fonts: [], covers: MOCK_COVERS });
    const [isLoadingMarket, setIsLoadingMarket] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const workspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
    const activePage = workspace?.pages.find(p => p.id === activePageId);
    const filteredPages = useMemo(() => {
        if (!searchQuery.trim()) return workspace.pages;
        return workspace.pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, workspace]);

    useEffect(() => { localStorage.setItem('notion_v50_workspaces', JSON.stringify(workspaces)); }, [workspaces]);
    useEffect(() => { if (notification.show) { const timer = setTimeout(() => setNotification({ ...notification, show: false }), 5000); return () => clearTimeout(timer); } }, [notification.show]);

    // GitHub Fetch: MEJORADO con Import Dinámico + ImportMap
    const fetchMarketData = async () => {
        setIsLoadingMarket(true);
        if (!githubToken) { setIsLoadingMarket(false); return; }
        try {
            // FIX: Usamos el nombre del paquete definido en importmap en lugar de la URL absoluta
            // Si esto fallara (por configuración del servidor), puedes revertir a "https://esm.sh/@octokit/rest"
            const { Octokit } = await import("@octokit/rest");
            
            const octokit = new Octokit({ auth: githubToken });
            const { data: rootContents } = await octokit.rest.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path: GITHUB_PATH });
            const styles = []; const fonts = []; const covers = { ...MOCK_COVERS }; 
            for (const item of rootContents) {
                if (item.type === 'dir') {
                    if (item.name === 'stylessApp' || item.name === 'themesApp') {
                        try {
                            const { data: files } = await octokit.rest.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path: item.path });
                            for (const f of files) if (f.name.match(/\.(css|json)$/i)) styles.push({ id: f.sha, name: f.name.replace(/\.(css|json)$/, ''), author: 'Fixius50', color: 'bg-zinc-100 text-zinc-800', download_url: f.download_url });
                        } catch(e) {}
                    }
                    if (item.name === 'tipographyApp') {
                        try {
                            const { data: subfolders } = await octokit.rest.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path: item.path });
                            for (const sub of subfolders) if (sub.type === 'dir') { const { data: fontFiles } = await octokit.rest.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path: sub.path }); const font = fontFiles.find(f => f.name.match(/\.(ttf|otf)$/i)); if(font) fonts.push({ id: sub.sha, name: sub.name, type: 'font', download_url: font.download_url }); }
                        } catch(e) {}
                    }
                    if (item.name === 'themesApp') {
                        try {
                            const { data: files } = await octokit.rest.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path: item.path });
                            const imageFiles = files.filter(f => f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i));
                            if (imageFiles.length > 0) { covers['Temas del Repo'] = imageFiles.map(f => f.download_url); }
                        } catch(e) {}
                    }
                }
            }
            setMarketData({ styles, fonts, covers });
        } catch (e) { console.error("GitHub Error:", e); } finally { setIsLoadingMarket(false); }
    };

    // VERCEL AI GENERATOR
    const generatePageWithAI = async () => {
        if (!aiPrompt.trim()) return;
        setIsAiGenerating(true);
        try {
            const response = await fetch(VERCEL_AI_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: `Eres un diseñador experto de Notion. Crea un JSON válido para: "${aiPrompt}". 
                    JSON: { "title": "str", "icon": "emoji", "cover_keyword": "english_keyword", "blocks": [{"type": "h1"|"p"|"todo", "content": "str"}] }` 
                })
            });
            
            if (!response.ok) throw new Error('Error en la API de Vercel');
            
            const parsed = await response.json();
            const keyword = parsed.cover_keyword || "abstract";
            const dynamicCover = `https://image.pollinations.ai/prompt/${encodeURIComponent(keyword)}?width=1200&height=400&nologo=true`;
            const newPage = { id: generateId(), title: parsed.title || 'Idea IA', icon: parsed.icon || '✨', cover: dynamicCover, updatedAt: new Date().toISOString(), isPrivate: true, blocks: parsed.blocks?.map(b => ({ ...b, id: generateId() })) || [] };
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Pensando...

            const updated = workspaces.map(ws => ws.id === activeWorkspaceId ? { ...ws, pages: [...ws.pages, newPage] } : ws);
            setWorkspaces(updated);
            setActivePageId(newPage.id);
            setCurrentView('page');
            setShowAI(false);
            setAiPrompt("");
            setNotification({ show: true, message: `"${newPage.title}" creada por IA.` });
        } catch (e) { console.error("AI Error:", e); alert("Error generando la página."); } finally { setIsAiGenerating(false); }
    };

    useEffect(() => { if(showMarket) fetchMarketData(); }, [showMarket]);

    // Actions
    const updatePage = (pid, u) => setWorkspaces(workspaces.map(ws => ws.id === activeWorkspaceId ? { ...ws, pages: ws.pages.map(p => p.id === pid ? { ...p, ...u } : p) } : ws));
    const createPage = () => { const id = generateId(); const np = { id, title: '', icon: null, cover: null, isPrivate: true, updatedAt: new Date().toISOString(), blocks: [{ id: generateId(), type: 'p', content: '' }] }; setWorkspaces(workspaces.map(ws => ws.id === activeWorkspaceId ? { ...ws, pages: [...ws.pages, np] } : ws)); setActivePageId(id); setCurrentView('page'); };
    const deletePage = (id) => { if(confirm("¿Eliminar?")) { setWorkspaces(workspaces.map(ws => ws.id === activeWorkspaceId ? { ...ws, pages: ws.pages.filter(p => p.id !== id) } : ws)); if(activePageId === id) { setActivePageId(null); setCurrentView('home'); } } };
    const updateBlock = (bid, u) => updatePage(activePageId, { blocks: activePage.blocks.map(b => b.id === bid ? { ...b, ...u } : b) });
    const addBlock = (idx) => { const bs = [...activePage.blocks]; bs.splice(idx, 0, { id: generateId(), type: 'p', content: '' }); updatePage(activePageId, { blocks: bs }); };
    const deleteBlock = (idx) => { const bs = [...activePage.blocks]; bs.splice(idx, 1); updatePage(activePageId, { blocks: bs }); };
    const reorderBlocks = (bs) => updatePage(activePageId, { blocks: bs });
    const importResource = (i, t) => { alert("Recurso importado."); };

    return (
        <div className="flex h-screen w-full bg-[#FBFBFA] text-zinc-800 font-sans selection:bg-indigo-100 relative">
            <NotificationPopup message={notification.message} isVisible={notification.show} onClose={() => setNotification({ ...notification, show: false })} />

            <motion.aside initial={false} animate={{ width: sidebarOpen ? 240 : 80 }} className="h-full bg-[#F7F7F5] flex flex-col z-20 relative border-r border-zinc-200 overflow-hidden transition-all duration-300">
                <div className="p-3 relative shrink-0">
                    <div onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)} className={`flex items-center gap-2 p-1.5 rounded hover:bg-zinc-200 transition-colors cursor-pointer ${!sidebarOpen && 'justify-center'}`}>
                        <div className={`w-5 h-5 rounded-sm bg-gradient-to-br ${workspace.color} flex items-center justify-center font-bold text-white text-[10px] shadow-sm shrink-0`}>{workspace.initial}</div>
                        {sidebarOpen && <><div className="flex-1 overflow-hidden text-sm font-medium truncate text-zinc-700">{workspace.name}</div><ChevronDown size={12} className="text-zinc-500"/></>}
                    </div>
                    <AnimatePresence>
                        {showWorkspaceMenu && sidebarOpen && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-12 left-2 right-2 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 overflow-hidden"><div className="p-2 border-b border-zinc-100"><span className="text-[10px] font-medium text-zinc-500 px-2">TUS ESPACIOS</span></div>{workspaces.map(ws => <div key={ws.id} onClick={() => { setActiveWorkspaceId(ws.id); setShowWorkspaceMenu(false); setCurrentView('home'); }} className="flex items-center gap-2 p-2 hover:bg-zinc-100 cursor-pointer text-sm"><div className={`w-5 h-5 rounded bg-gradient-to-br ${ws.color} text-white flex items-center justify-center text-[10px]`}>{ws.initial}</div><span className="flex-1">{ws.name}</span>{ws.id === activeWorkspaceId && <Check size={14} className="text-indigo-600"/>}</div>)}</motion.div>}
                    </AnimatePresence>
                </div>
                
                <div className="flex-1 overflow-y-auto px-2 space-y-0.5 fancy-scroll">
                    <div onClick={() => setShowSearch(true)} className={`flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 text-zinc-600 cursor-pointer ${!sidebarOpen && 'justify-center'}`}><Search size={18} /> {sidebarOpen && <span className="text-sm">Buscar</span>}</div>
                    <div onClick={() => { setCurrentView('home'); setActivePageId(null); }} className={`flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 cursor-pointer ${!sidebarOpen && 'justify-center'} ${currentView === 'home' ? 'bg-zinc-200 text-zinc-900 font-medium' : 'text-zinc-600'}`}><SidebarIcon size={18} /> {sidebarOpen && <span className="text-sm">Inicio</span>}</div>
                    <div className={`flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 text-zinc-600 cursor-pointer ${!sidebarOpen && 'justify-center'}`}><Users size={18} /> {sidebarOpen && <span className="text-sm">Reuniones</span>}</div>
                    <div onClick={() => setShowAI(true)} className={`flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 text-zinc-600 cursor-pointer ${!sidebarOpen && 'justify-center'}`}><Sparkles size={18} className="text-yellow-600" /> {sidebarOpen && <span className="text-sm">IA Notion</span>}</div>
                    <div className={`flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 text-zinc-600 cursor-pointer ${!sidebarOpen && 'justify-center'}`}><Inbox size={18} /> {sidebarOpen && <span className="text-sm">Bandeja</span>}</div>
                    
                    {sidebarOpen && <div className="mt-4 mb-1 px-2 flex justify-between items-center group"><span className="text-xs font-medium text-zinc-500">PRIVADO</span><button onClick={(e) => { e.stopPropagation(); createPage(); }} className="text-zinc-400 hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={12}/></button></div>}
                    {workspace.pages.map(page => <div key={page.id} onClick={() => { setActivePageId(page.id); setCurrentView('page'); }} className={`flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 cursor-pointer group ${!sidebarOpen && 'justify-center'} ${activePageId === page.id ? 'bg-zinc-200 text-zinc-900 font-medium' : 'text-zinc-600'}`}><span className="text-lg leading-none w-4 text-center shrink-0">{page.icon || <FileText size={16} />}</span>{sidebarOpen && <span className="text-sm truncate opacity-90">{page.title || 'Sin título'}</span>}</div>)}
                    {sidebarOpen && <div onClick={createPage} className="flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 text-zinc-500 cursor-pointer mt-2"><Plus size={16} /> <span className="text-sm">Añadir página</span></div>}
                </div>

                <div className="p-2 border-t border-zinc-200 space-y-0.5">
                    <div onClick={() => { setCurrentView('settings'); setSettingsTab('menu'); }} className={`flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 text-zinc-600 cursor-pointer ${!sidebarOpen && 'justify-center'}`}><Settings size={18} /> {sidebarOpen && <span className="text-sm">Config</span>}</div>
                    <div onClick={() => { setShowMarket(true); setMarketTab('styles'); }} className={`flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 text-zinc-600 cursor-pointer ${!sidebarOpen && 'justify-center'}`}><Palette size={18} /> {sidebarOpen && <span className="text-sm">Styles</span>}</div>
                    <div onClick={() => setCurrentView('trash')} className={`flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 text-zinc-600 cursor-pointer ${!sidebarOpen && 'justify-center'}`}><Trash size={18} /> {sidebarOpen && <span className="text-sm">Papelera</span>}</div>
                    <div onClick={() => setSidebarOpen(!sidebarOpen)} className={`flex items-center gap-3 p-1.5 rounded hover:bg-zinc-200 text-zinc-600 cursor-pointer ${!sidebarOpen && 'justify-center'}`}><ChevronsLeft size={18} className={!sidebarOpen ? "rotate-180" : ""} /> {sidebarOpen && <span className="text-sm">Colapsar</span>}</div>
                </div>
            </motion.aside>

            <main className="flex-1 h-full overflow-hidden relative flex flex-col bg-white">
                <header className="h-12 flex items-center justify-between px-3 shrink-0 hover:bg-transparent transition-colors">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 overflow-hidden w-full">
                        {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-zinc-100 rounded mr-2 md:hidden"><List size={18}/></button>}
                        {currentView === 'home' ? <span>Inicio</span> : currentView === 'settings' ? <span>Configuración</span> : currentView === 'trash' ? <span>Papelera</span> : <div className="flex items-center gap-2 overflow-hidden w-full"><span className="text-lg">{activePage?.icon || <FileText size={16} />}</span><span className="text-zinc-800 truncate font-medium">{activePage?.title || 'Sin título'}</span></div>}
                    </div>
                    {currentView === 'page' && <div className="relative ml-2"><button onClick={() => setShowPageOptions(!showPageOptions)} className="p-1 text-zinc-500 hover:bg-zinc-100 rounded transition-colors"><MoreHorizontal size={20} /></button><AnimatePresence>{showPageOptions && <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="absolute right-0 top-8 w-48 bg-white border border-zinc-200 rounded-lg shadow-xl z-50 overflow-hidden py-1"><div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase">Acciones</div><div onClick={() => { deletePage(activePageId); setShowPageOptions(false); }} className="flex items-center gap-2 px-3 py-1.5 text-red-500 hover:bg-red-50 cursor-pointer text-sm"><Trash size={14}/> Eliminar página</div></motion.div>}</AnimatePresence></div>}
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:px-24 md:py-12 relative fancy-scroll">
                    {currentView === 'home' && (
                        <div className="max-w-4xl mx-auto h-full flex flex-col">
                            {workspace.pages.length > 0 ? (
                                <>
                                    <div className="text-center mb-12">
                                        <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-2xl text-indigo-600 font-bold">{workspace.initial}</div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-zinc-800 mb-2">Buenos días</h1>
                                        <p className="text-zinc-500">Estás en <span className="text-indigo-600 font-medium">{workspace.name}</span>.</p>
                                    </div>
                                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">TUS PÁGINAS</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {workspace.pages.map(page => (
                                            <SpotlightCard key={page.id} onClick={() => { setActivePageId(page.id); setCurrentView('page'); }} className="h-32 flex flex-col">
                                                <div className="h-1/2 w-full bg-zinc-100 relative overflow-hidden">{page.cover ? <img src={page.cover} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-r from-zinc-100 to-zinc-200"/>}</div>
                                                <div className="absolute top-[35%] left-3 bg-white rounded-md p-1 shadow-sm text-xl leading-none">{page.icon || '📄'}</div>
                                                <div className="p-3 pt-5"><div className="font-medium text-zinc-800 truncate text-sm">{page.title || 'Sin título'}</div><div className="text-[10px] text-zinc-400 mt-0.5">Editado recientemente</div></div>
                                            </SpotlightCard>
                                        ))}
                                        <motion.div whileHover={{ scale: 1.01 }} onClick={createPage} className="h-32 rounded-xl border border-dashed border-zinc-300 hover:bg-zinc-50 flex flex-col items-center justify-center cursor-pointer transition-colors"><Plus size={24} className="text-zinc-400 mb-2" /><span className="text-xs font-medium text-zinc-500">Nueva página</span></motion.div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={createPage} className="w-32 h-32 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 flex items-center justify-center cursor-pointer group"><Plus size={48} className="text-indigo-400 group-hover:text-indigo-600 transition-colors"/></motion.div>
                                    <WavyText text="Comience su productividad creando una página" />
                                </div>
                            )}
                        </div>
                    )}
                    {/* Resto de vistas... */}
                    {currentView === 'settings' && <div className="max-w-2xl mx-auto pt-4">{settingsTab === 'menu' && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}><h1 className="text-xl font-bold mb-6 text-zinc-800">Configuración</h1><div className="bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden"><div className="p-4 hover:bg-zinc-100 cursor-pointer flex justify-between items-center border-b border-zinc-200"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500"><User size={16}/></div><div><div className="font-medium text-sm">Cuenta</div><div className="text-xs text-zinc-500">Gestiona tu perfil</div></div></div><ArrowRight size={16} className="text-zinc-400"/></div><div onClick={() => setSettingsTab('appearance')} className="p-4 hover:bg-zinc-100 cursor-pointer flex justify-between items-center border-b border-zinc-200"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500"><Palette size={16}/></div><div><div className="font-medium text-sm">Apariencia</div><div className="text-xs text-zinc-500">Temas y colores</div></div></div><ArrowRight size={16} className="text-zinc-400"/></div><div onClick={() => setSettingsTab('fonts')} className="p-4 hover:bg-zinc-100 cursor-pointer flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500"><Type size={16}/></div><div><div className="font-medium text-sm">Tipografía</div><div className="text-xs text-zinc-500">Fuentes y tamaño</div></div></div><ArrowRight size={16} className="text-zinc-400"/></div></div></motion.div>}{(settingsTab === 'appearance' || settingsTab === 'fonts') && <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}><button onClick={() => setSettingsTab('menu')} className="flex items-center gap-1 text-zinc-500 mb-4 text-sm hover:text-zinc-800"><ArrowLeft size={14}/> Volver</button><h2 className="text-xl font-bold mb-6 text-zinc-800">{settingsTab === 'appearance' ? 'Apariencia' : 'Tipografía'}</h2><div className="space-y-2">{(settingsTab === 'appearance' ? importedResources.styles : importedResources.fonts).length === 0 ? <p className="text-zinc-500 text-xs">No hay recursos importados.</p> : (settingsTab === 'appearance' ? importedResources.styles : importedResources.fonts).map(r => (<div key={r.id} className="bg-white p-3 rounded-lg border border-zinc-200 flex justify-between items-center shadow-sm"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-zinc-100 rounded border border-zinc-200"></div><div><div className="font-medium text-sm">{r.name}</div><div className="text-xs text-zinc-400">Importado</div></div></div><button className="text-indigo-600 text-xs font-medium">Aplicar</button></div>))}</div></motion.div>}</div>}
                    {currentView === 'trash' && <div className="max-w-md mx-auto pt-20 text-center"><div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400"><Trash size={32}/></div><h1 className="text-xl font-bold text-zinc-800 mb-2">Papelera vacía</h1></div>}
                    {currentView === 'page' && activePage && (
                        <motion.div key={activePage.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-32">
                            <div className="group/cover relative -mx-12 mb-8">
                                {activePage.cover && <div className="h-48 md:h-60 w-full relative"><img src={activePage.cover} className="w-full h-full object-cover"/><div className="absolute bottom-2 right-2 opacity-0 group-hover/cover:opacity-100 transition-opacity flex gap-2"><button onClick={() => { setMarketTab('gallery'); setShowMarket(true); }} className="bg-white/90 text-xs px-2 py-1 rounded shadow-sm hover:bg-white text-zinc-600 border border-zinc-200">Cambiar portada</button></div></div>}
                            </div>
                            <div className="relative mb-8 group/header">
                                <div className="relative inline-block -mt-12 ml-1 mb-4 z-10">
                                    <div onClick={() => setShowIconPicker(!showIconPicker)} className="text-7xl cursor-pointer hover:opacity-80 transition-opacity">{activePage.icon || '📄'}</div>
                                    {showIconPicker && <div className="absolute top-full left-0 z-50 bg-white border border-zinc-200 p-3 rounded-xl shadow-xl w-64 grid grid-cols-6 gap-2 h-48 overflow-y-auto">{ICONS_LIST.map(icon => <div key={icon} onClick={() => { updatePage(activePageId, { icon }); setShowIconPicker(false); }} className="text-xl p-1 hover:bg-zinc-100 rounded cursor-pointer text-center">{icon}</div>)}</div>}
                                </div>
                                <div className="flex items-center gap-1 mb-4 opacity-0 group-hover/header:opacity-100 transition-opacity text-sm text-zinc-400">{!activePage.cover && <button onClick={() => { setMarketTab('gallery'); setShowMarket(true); }} className="hover:bg-zinc-100 px-2 py-1 rounded flex items-center gap-2"><ImageIcon size={14}/> Añadir portada</button>}</div>
                                <input value={activePage.title} onChange={(e) => updatePage(activePage.id, { title: e.target.value })} placeholder="Título de la página" className="w-full bg-transparent text-4xl font-bold text-zinc-800 placeholder:text-zinc-300 border-none outline-none px-0" />
                            </div>
                            <div className="space-y-1 min-h-[200px]">{activePage.blocks.map((block, index) => <EditorBlock key={block.id} block={block} index={index} updateBlock={updateBlock} addBlock={addBlock} deleteBlock={deleteBlock} />)}</div>
                            <div className="h-24 -mx-4 cursor-text mt-4" onClick={() => addBlock(activePage.blocks.length)} />
                        </motion.div>
                    )}
                </div>
            </main>

            {/* MODALS (Search, AI, Market) */}
            <Modal isOpen={showSearch} onClose={() => setShowSearch(false)} title={null}><div className="p-4 border-b border-zinc-100 bg-[#FBFBFA]"><div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-lg mb-3 border border-zinc-200 shadow-sm"><Search className="text-zinc-400" size={20} /><input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar páginas..." className="bg-transparent w-full outline-none text-lg placeholder:text-zinc-400 text-zinc-700" /></div></div>{searchQuery ? <div className="p-1 bg-[#FBFBFA] min-h-[300px]">{filteredPages.map(p => <div key={p.id} onClick={() => { setActivePageId(p.id); setCurrentView('page'); setShowSearch(false); }} className="flex items-center gap-3 p-2 mx-2 hover:bg-zinc-200 rounded cursor-pointer group"><div className="text-lg">{p.icon || '📄'}</div><div><div className="text-sm font-medium text-zinc-700">{p.title || 'Sin título'}</div></div></div>)}</div> : <div className="h-[300px] flex items-center justify-center text-zinc-400 text-sm">Empieza a escribir para buscar...</div>}</Modal>
            <Modal isOpen={showAI} onClose={() => setShowAI(false)} title={null} transparent={true}><div className="flex items-center justify-center h-full p-4"><div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative overflow-hidden min-h-[300px] flex flex-col"><div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none"/>{isAiGenerating ? <div className="flex-1 flex items-center justify-center"><BreathingText text="Creando Ideas..." /></div> : <div className="relative z-10 flex-1 flex flex-col"><h2 className="text-2xl font-bold text-zinc-800 mb-2 flex items-center gap-2"><Sparkles className="text-indigo-500"/> IA Notion</h2><p className="text-zinc-500 text-sm mb-6">Describe la página que quieres crear.</p><textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Ej: Rutina de ejercicios..." className="w-full bg-white border border-zinc-200 rounded-xl p-4 h-32 resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 mb-4 text-zinc-700"/><div className="flex justify-end gap-2 mt-auto"><button onClick={() => setShowAI(false)} className="px-4 py-2 rounded-lg text-zinc-500 hover:bg-zinc-100 text-sm">Cancelar</button><button onClick={generatePageWithAI} disabled={!aiPrompt.trim() || isAiGenerating} className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"><Wand2 size={16}/> Generar Página</button></div></div>}</div></div></Modal>
            <Modal isOpen={showMarket} onClose={() => setShowMarket(false)} title={null} size="max-w-4xl"><div className="flex flex-col h-full bg-[#FBFBFA]"><div className="flex justify-between items-center px-6 pt-6 pb-2"><div className="flex gap-6 text-sm font-medium">{['Galería', 'Estilos', 'Fuentes'].map(tab => <button key={tab} onClick={() => setMarketTab(tab.toLowerCase())} className={`pb-2 px-1 transition-colors relative ${marketTab === tab.toLowerCase() ? 'text-indigo-600' : 'text-zinc-500 hover:text-zinc-800'}`}>{tab}{marketTab === tab.toLowerCase() && <motion.div layoutId="market-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"/>}</button>)}</div><button onClick={() => setShowMarket(false)} className="text-zinc-400 hover:text-zinc-600"><X size={20}/></button></div><div className="h-px bg-zinc-200 mx-6 mb-6"/><div className="flex-1 overflow-y-auto px-6 pb-6 min-h-[400px]">{isLoadingMarket ? <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3"><Loader2 className="animate-spin text-indigo-400" size={32}/><span>Conectando con el repositorio...</span></div> : (<>{marketTab === 'galería' && <div className="space-y-8"><div className="space-y-4"><h4 className="text-xs font-bold text-zinc-400 uppercase">LOCALES</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Object.values(MOCK_COVERS).flat().map((url, i) => <div key={i} onClick={() => { updatePage(activePageId, { cover: url }); setShowMarket(false); }} className="h-24 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all shadow-sm"><img src={url} className="w-full h-full object-cover"/></div>)}</div></div>{marketData.covers['Temas del Repo'] && <div className="space-y-4"><h4 className="text-xs font-bold text-zinc-400 uppercase">DEL REPOSITORIO</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{marketData.covers['Temas del Repo'].map((url, i) => <div key={i} onClick={() => { updatePage(activePageId, { cover: url }); setShowMarket(false); }} className="h-24 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all shadow-sm"><img src={url} className="w-full h-full object-cover"/></div>)}</div></div>}</div>}{marketTab === 'estilos' && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{marketData.styles.map(s => <div key={s.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-zinc-100 flex flex-col"><div className={`h-32 ${s.color} flex items-center justify-center text-4xl font-bold opacity-40`}>Aa</div><div className="p-4"><h3 className="font-bold text-zinc-800">{s.name}</h3><p className="text-xs text-zinc-500 mb-4">Por {s.author}</p><button onClick={() => importResource(s, 'style')} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">Obtener</button></div></div>)}</div>}{marketTab === 'fuentes' && <div className="grid gap-4">{marketData.fonts.map(f => <div key={f.id} className="bg-white p-4 rounded-xl border border-zinc-200 flex justify-between items-center shadow-sm"><div><div className="text-xl font-serif mb-1 text-zinc-800">{f.name}</div><div className="text-xs text-zinc-500">Fuente Open Source</div></div><button onClick={() => importResource(f, 'font')} className="bg-zinc-100 px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-200">Obtener</button></div>)}</div>}</>)}</div></div></Modal>
        </div>
    );
}

// 2. INICIALIZACIÓN
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);