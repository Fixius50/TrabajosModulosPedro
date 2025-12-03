import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, ChevronDown, FileText, Plus, Sparkles, ArrowRight,
    Search, Settings, MoreHorizontal, X, Github, Palette, Type, Globe, Lock,
    Check, Users, Inbox, ArrowLeft, SlidersHorizontal, User, Briefcase, Plane, Music,
    Wand2, Loader2, LayoutTemplate, Bell, ChevronsLeft, CreditCard, LogOut,
    ChevronRight, UploadCloud, Command, FolderOpen, Camera, PlusCircle, Download, FileJson,
    Smile, MessageSquare, ImagePlus, Archive, RefreshCcw, CornerDownLeft, Clock,
    LayoutGrid, Package, Undo2, Filter, Quote, Minus, Info, ListOrdered, Trash,
    Star as StarIcon, Link as LinkIcon, Copy as CopyIcon, Edit2 as EditIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

// Imports from our modules
import { supabase, AuthService } from './lib/supabase';
import { BackupService } from './lib/backup';
import { utils, ICONS_LIST, COVER_COLORS, COVER_IMAGES } from './lib/utils';
import { useAppStore } from './store/useAppStore';
import { SidebarItem } from './components/Sidebar';
import { EditorBlock, FancyEditable } from './components/Editor';
import { SpotlightCard, FancyTabs, Modal, FancyText } from './components/UI';

// Constants
const API_ENDPOINTS = { MARKET: "/api/market", AI: "/api/generar-pagina", UPLOAD: "/api/upload" };

// Landing Page Component
function LandingPage({ onLogin }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white to-zinc-50">
            <div className="max-w-4xl w-full text-center space-y-12">
                {/* Hero */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium border border-indigo-100">
                        <Sparkles size={14} />
                        <span>Nueva Arquitectura V82</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900">
                        Tu espacio de trabajo,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">reimaginado.</span>
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                        Escribe, planifica y organiza en un solo lugar. Ahora con Vite + React.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={onLogin} className="px-8 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Entrar a Fixius
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 text-left">
                    <SpotlightCard className="p-6 h-full">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Modular</h3>
                        <p className="text-zinc-500 text-sm">Arquitectura basada en componentes reutilizables.</p>
                    </SpotlightCard>
                    <SpotlightCard className="p-6 h-full">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                            <ArrowRight size={20} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Rápido</h3>
                        <p className="text-zinc-500 text-sm">Powered by Vite para un desarrollo ultrarrápido.</p>
                    </SpotlightCard>
                    <SpotlightCard className="p-6 h-full">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-4">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Estético</h3>
                        <p className="text-zinc-500 text-sm">Diseño premium con animaciones fluidas.</p>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}

// Main App Component
function MainApp({ session, onLogout }) {
    const { workspaces, userProfile, activeWorkspace, activeWorkspaceId, activePage, activePageId, themes, activeTheme, activeThemeId, fonts, actions, setWorkspaces, setUserProfile, setThemes, setFonts, setActiveWorkspaceId, setActiveThemeId } = useAppStore();

    // UI State
    const [ui, setUi] = useState({
        sidebarOpen: true,
        currentView: 'home',
        settingsSection: 'account',
        modals: {
            search: false,
            market: false,
            ai: false,
            workspaceMenu: false,
            iconPicker: false,
            iconPickerModal: false,
            coverGallery: false,
            pageOptions: false,
            createWorkspace: false,
            googleLogin: false
        },
        marketTab: 'gallery',
        marketSubTab: 'store',
        iconPickerTab: 'emoji',
        notification: { show: false, message: '' },
        isAuthenticated: true
    });

    const [showComments, setShowComments] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilters, setSearchFilters] = useState({ scope: 'current', sort: 'newest' });
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [marketData, setMarketData] = useState({ styles: [], fonts: [], covers: [] });
    const [loadingMarket, setLoadingMarket] = useState(false);
    const fileInputRef = useRef(null);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [contextMenu, setContextMenu] = useState({ isOpen: false, pageId: null, x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Mobile Check
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && ui.sidebarOpen) setUi(p => ({ ...p, sidebarOpen: false }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [ui.sidebarOpen]);

    // Restore Backup on Session Load
    useEffect(() => {
        if (session?.user) {
            const userId = session.user.email;
            const restored = BackupService.restoreBackup(userId);

            if (restored && actions.internalSetters) {
                // The store initializes from localStorage, so if restoreBackup updated localStorage, 
                // we might need to force a reload or re-read. 
                // Ideally, we should update the state directly.
                const ws = JSON.parse(localStorage.getItem('notion_v82_ws'));
                const th = JSON.parse(localStorage.getItem('notion_v82_themes'));
                const fn = JSON.parse(localStorage.getItem('notion_v82_fonts'));
                const aid = JSON.parse(localStorage.getItem('notion_v82_active_id'));
                const ath = JSON.parse(localStorage.getItem('notion_v82_active_theme'));

                if (ws) actions.internalSetters.setWorkspaces(ws);
                if (th) actions.internalSetters.setThemes(th);
                if (fn) actions.internalSetters.setFonts(fn);
                if (aid) actions.internalSetters.setActiveWorkspaceId(aid);
                if (ath) actions.internalSetters.setActiveThemeId(ath);

                showNotify("Sesión restaurada correctamente");
            }
        }
    }, [session, actions.internalSetters]);

    const fetchMarketData = async () => {
        setLoadingMarket(true);
        try {
            // Simulate dynamic API call
            await utils.delay(800);
            const mockApiResponse = [
                { name: 'medieval-theme.css', url: 'stylessApp/medieval-theme.css', type: 'css' },
                { name: 'gaming-theme.css', url: 'stylessApp/gaming-theme.css', type: 'css' },
                { name: 'rock-metal-theme.css', url: 'stylessApp/rock-metal-theme.css', type: 'css' },
                { name: 'default-theme.css', url: 'stylessApp/default-theme.css', type: 'css' }
            ];

            const styles = mockApiResponse.map(f => {
                const id = f.name.replace('.css', '');
                return {
                    id: id,
                    name: id.charAt(0).toUpperCase() + id.slice(1).replace('-theme', '').replace('-', ' '),
                    author: 'Fixius50',
                    type: 'css',
                    url: f.url,
                    colors: id.includes('medieval') ? { bg: '#f3e8c8', text: '#1a0f08', sidebar: '#26160c' } :
                        id.includes('gaming') ? { bg: '#09090b', text: '#ffffff', sidebar: '#000000' } :
                            id.includes('rock') ? { bg: '#1c1c1c', text: '#e0e0e0', sidebar: '#111111' } :
                                { bg: '#ffffff', text: '#000000', sidebar: '#f0f0f0' }
                };
            });

            setMarketData({
                styles: styles,
                fonts: [],
                covers: ["https://images.unsplash.com/photo-1497436072909-60f360e1d4b0?w=600"]
            });
        } catch { setMarketData({ styles: [], fonts: [], covers: [] }); } finally { setLoadingMarket(false); }
    };

    // Helpers
    const showNotify = (msg) => {
        setUi(p => ({ ...p, notification: { show: true, message: msg } }));
        setTimeout(() => setUi(p => ({ ...p, notification: { show: false, message: '' } })), 3000);
    };

    const toggleSidebar = () => setUi(p => ({ ...p, sidebarOpen: !p.sidebarOpen }));

    // Search Logic
    const filteredPages = useMemo(() => {
        let pagesToSearch = [];
        if (searchFilters.scope === 'all') workspaces.forEach(ws => ws.pages.forEach(p => { if (!p.isDeleted) pagesToSearch.push({ ...p, workspaceName: ws.name, workspaceId: ws.id }); }));
        else if (activeWorkspace) activeWorkspace.pages.forEach(p => { if (!p.isDeleted) pagesToSearch.push({ ...p, workspaceName: activeWorkspace.name, workspaceId: activeWorkspace.id }); });
        let results = pagesToSearch;
        if (searchQuery.trim()) results = results.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
        results.sort((a, b) => searchFilters.sort === 'newest' ? new Date(b.updatedAt) - new Date(a.updatedAt) : searchFilters.sort === 'oldest' ? new Date(a.updatedAt) - new Date(b.updatedAt) : a.title.localeCompare(b.title));
        return results;
    }, [searchQuery, activeWorkspace, workspaces, searchFilters]);

    // Context Menu
    const handleContextMenu = (pageId, e) => {
        e.preventDefault();
        setContextMenu({ isOpen: true, pageId, x: e.clientX, y: e.clientY });
    };

    // Close context menu on click elsewhere
    useEffect(() => {
        const closeMenu = () => setContextMenu({ ...contextMenu, isOpen: false });
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, [contextMenu]);


    return (
        <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-color)] text-[var(--text-color)]" style={{ fontFamily: 'var(--font-main)' }}>
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {ui.sidebarOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="h-full border-r border-zinc-200 flex flex-col shrink-0 bg-[var(--sidebar-bg)] z-40 absolute md:relative shadow-xl md:shadow-none"
                        style={{ width: 'var(--sidebar-width)' }}
                    >
                        {/* Sidebar Header */}
                        <div className="p-3 hover:bg-zinc-200/50 transition-colors cursor-pointer m-2 rounded-lg flex items-center gap-2 group" onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, workspaceMenu: true } }))}>
                            <div className={`w-6 h-6 rounded bg-gradient-to-br ${activeWorkspace?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                {activeWorkspace?.initial || 'W'}
                            </div>
                            <span className="font-medium text-sm truncate flex-1">{activeWorkspace?.name || 'Workspace'}</span>
                            <div className="w-4 h-4 flex items-center justify-center text-zinc-400 group-hover:text-zinc-600"><ChevronDown size={12} /></div>
                        </div>

                        {/* Quick Actions */}
                        <div className="px-2 mb-2 space-y-0.5">
                            <div onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, search: true } }))} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer group">
                                <Search size={14} /> <span className="flex-1">Buscar</span> <span className="text-xs border border-zinc-300 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity">Ctrl+K</span>
                            </div>
                            <div onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, ai: true } }))} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                                <Sparkles size={14} /> <span>Fixius AI</span>
                            </div>
                            <div onClick={() => setUi(p => ({ ...p, currentView: 'home' }))} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                                <LayoutGrid size={14} /> <span>Inicio</span>
                            </div>
                            <div onClick={() => setUi(p => ({ ...p, currentView: 'inbox' }))} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                                <Inbox size={14} /> <span>Bandeja</span>
                            </div>
                            <div onClick={() => setUi(p => ({ ...p, currentView: 'settings' }))} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                                <Settings size={14} /> <span>Configuración</span>
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto fancy-scroll px-2 pb-4">
                            {/* Favorites Section */}
                            {activeWorkspace?.pages.some(p => p.isFavorite && !p.isDeleted) && (
                                <div className="mb-2">
                                    <div className="px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between group cursor-pointer hover:bg-zinc-200/30 rounded" onClick={() => setUi(p => ({ ...p, favoritesOpen: !p.favoritesOpen }))}>
                                        <span>Favoritos</span>
                                    </div>
                                    {ui.favoritesOpen !== false && (
                                        <div>
                                            {activeWorkspace.pages.filter(p => p.isFavorite && !p.isDeleted).map(page => (
                                                <SidebarItem
                                                    key={page.id}
                                                    page={page}
                                                    actions={actions}
                                                    ui={ui}
                                                    setUi={setUi}
                                                    activePageId={activePageId}
                                                    allPages={activeWorkspace.pages}
                                                    onContextMenu={handleContextMenu}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pages Section */}
                            <div className="mb-4">
                                <div className="px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between group cursor-pointer hover:bg-zinc-200/30 rounded" onClick={() => setUi(p => ({ ...p, pagesOpen: !p.pagesOpen }))}>
                                    <span>Páginas</span>
                                    <div onClick={(e) => { e.stopPropagation(); actions.addPage(); }} className="opacity-0 group-hover:opacity-100 hover:bg-zinc-300 rounded p-0.5 transition-all"><Plus size={12} /></div>
                                </div>
                                {ui.pagesOpen !== false && (
                                    <div>
                                        {activeWorkspace?.pages.filter(p => !p.parentId && !p.isDeleted && !p.inInbox && !p.isFavorite).map(page => (
                                            <SidebarItem
                                                key={page.id}
                                                page={page}
                                                actions={actions}
                                                ui={ui}
                                                setUi={setUi}
                                                activePageId={activePageId}
                                                allPages={activeWorkspace.pages}
                                                onContextMenu={handleContextMenu}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-2 border-t border-zinc-200 space-y-0.5">
                            <div onClick={() => actions.addPage()} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                                <Plus size={14} /> <span>Nueva página</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                                <LayoutTemplate size={14} /> <span>Plantillas</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                                <Download size={14} /> <span>Importar</span>
                            </div>
                            <div onClick={() => setUi(p => ({ ...p, currentView: 'trash' }))} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                                <Trash size={14} /> <span>Papelera</span>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 h-full relative flex flex-col min-w-0 bg-[var(--bg-color)]">
                {/* Topbar */}
                <header className="h-12 shrink-0 flex items-center justify-between px-3 border-b border-zinc-100 bg-[var(--bg-color)]/80 backdrop-blur-sm sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        {!ui.sidebarOpen && <button onClick={toggleSidebar} className="p-1 hover:bg-zinc-100 rounded text-zinc-500"><Menu size={18} /></button>}
                        <div className="flex items-center gap-1 text-sm text-zinc-600">
                            <span>{activePage?.icon}</span>
                            <span className="font-medium truncate max-w-[200px]">{activePage?.title || 'Sin título'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowComments(!showComments)} className={clsx("p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100", showComments && "text-zinc-600 bg-zinc-100")}><MessageSquare size={18} /></button>
                        <button onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: true } }))} className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"><MoreHorizontal size={18} /></button>
                    </div>
                </header>

                {/* Editor Area */}
                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto fancy-scroll relative">
                    {ui.currentView === 'home' && (() => {
                        const visiblePages = activeWorkspace?.pages.filter(p => !p.isDeleted && !p.inInbox) || [];
                        return visiblePages.length === 0 ? (
                            <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center p-8">
                                <motion.div initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", duration: 0.8 }} className="text-center">
                                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="text-6xl mb-6">✨</motion.div>
                                    <h2 className="text-3xl font-bold mb-3 text-current">Empecemos a crear una página</h2>
                                    <p className="text-zinc-500 mb-8 max-w-md">Crea tu primera página y comienza a organizar tus ideas, proyectos y notas.</p>
                                    <motion.button onClick={() => { const id = actions.addPage(); actions.setActivePageId(id); setUi(p => ({ ...p, currentView: 'page' })); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-zinc-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2 mx-auto shadow-lg"><Plus size={18} /> Crear primera página</motion.button>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="max-w-6xl mx-auto py-12 px-6">
                                <div className="mb-8"><h1 className="text-2xl font-bold mb-2 text-current">Hola, {userProfile.name}</h1><p className="text-zinc-500">Continúa donde lo dejaste</p></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {visiblePages.slice(0, 12).map(page => (
                                        <motion.div key={page.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4, scale: 1.02 }} onClick={() => { actions.setActivePageId(page.id); setUi(p => ({ ...p, currentView: 'page' })); }} className="bg-white border border-zinc-200 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all">
                                            <div className="h-32 relative" style={{ background: page.cover?.includes('http') ? 'transparent' : (page.cover || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') }}>{page.cover?.includes('http') && <img src={page.cover} className="w-full h-full object-cover" />}</div>
                                            <div className="p-4"><div className="flex items-start gap-3"><div className="text-3xl shrink-0">{page.icon || '📄'}</div><div className="flex-1 min-w-0"><h3 className="font-semibold text-zinc-900 truncate mb-1">{page.title || 'Sin título'}</h3><p className="text-xs text-zinc-400">Editado {formatDistanceToNow(new Date(page.updatedAt))} ago</p></div></div></div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {ui.currentView === 'inbox' && (
                        <div className="max-w-3xl mx-auto py-12 px-6">
                            <div className="flex items-center justify-between mb-8"><h1 className="text-2xl font-bold text-current flex items-center gap-2"><Inbox size={24} /> Bandeja de Entrada</h1>{inboxPages.length > 0 && (<button onClick={() => { if (confirm("¿Estás seguro de que quieres borrar todo permanentemente?")) actions.emptyInbox(); }} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2"><Trash size={14} /> Borrar todo</button>)}</div>
                            {inboxPages.length === 0 ? <div className="text-center py-12 opacity-50"><div className="mb-2 text-4xl">📬</div>No tienes notificaciones.</div> : (<div className="grid gap-4">{inboxPages.map(page => (<SpotlightCard key={page.id} className="p-4 flex items-center justify-between cursor-pointer" onClick={() => { actions.updatePage(page.id, { inInbox: false }); }}><div className="flex items-center gap-4"><div className="text-2xl">{page.icon}</div><div><div className="font-bold text-zinc-800">{page.title}</div><div className="text-xs text-zinc-500">{formatDistanceToNow(new Date(page.updatedAt))} ago</div></div></div><div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); actions.deletePage(page.id); }} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600" title="Eliminar"><X size={16} /></button></div></SpotlightCard>))}</div>)}
                        </div>
                    )}

                    {ui.currentView === 'trash' && (
                        <div className="max-w-3xl mx-auto py-12 px-6">
                            <div className="flex items-center justify-between mb-8"><h1 className="text-2xl font-bold text-current flex items-center gap-2"><Trash size={24} /> Papelera</h1>{trashPages.length > 0 && (<button onClick={() => { if (confirm("¿Estás seguro de que quieres vaciar la papelera permanentemente?")) actions.emptyTrash(); }} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2"><Trash size={14} /> Vaciar papelera</button>)}</div>
                            <p className="text-sm opacity-60 mb-6">Las páginas aquí pueden ser restauradas o eliminadas para siempre.</p>
                            {trashPages.length === 0 ? <div className="text-center py-12 opacity-50"><div className="mb-2 text-4xl">🗑️</div>Papelera vacía.</div> : (<div className="grid gap-3">{trashPages.map(page => (<div key={page.id} className="p-3 border border-zinc-200 rounded-lg flex justify-between items-center bg-white shadow-sm"><div className="flex items-center gap-3 opacity-60"><div className="text-lg">{page.icon || <FileText size={16} />}</div><div><div className="font-medium text-sm text-zinc-900">{page.title || 'Sin título'}</div><div className="text-xs text-zinc-500">Borrado {formatDistanceToNow(new Date(page.deletedAt || new Date()))} ago</div></div></div><div className="flex gap-2"><button onClick={() => { actions.restorePage(page.id); showNotify("Página restaurada"); }} className="flex items-center gap-1 bg-zinc-100 text-zinc-700 text-xs px-3 py-1.5 rounded hover:bg-zinc-200"><Undo2 size={12} /> Restaurar</button><button onClick={() => { if (confirm("¿Borrar definitivamente?")) actions.permanentDeletePage(page.id); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash size={14} /></button></div></div>))}</div>)}
                        </div>
                    )}

                    {ui.currentView === 'settings' && (
                        <div className="flex h-full">
                            <div className="w-48 bg-[var(--sidebar-bg)] border-r border-[rgba(0,0,0,0.05)] pt-8 px-2 space-y-1"><div className="px-3 py-2 text-xs font-bold opacity-50 uppercase mb-2">Cuenta</div><button onClick={() => setUi(p => ({ ...p, settingsSection: 'account' }))} className={clsx("w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors", ui.settingsSection === 'account' ? "bg-[rgba(0,0,0,0.05)] font-medium" : "opacity-70 hover:opacity-100 hover:bg-[rgba(0,0,0,0.02)]")}>Mi Perfil</button><button onClick={() => { setUi(p => ({ ...p, settingsSection: 'themes' })); fetchMarketData(); }} className={clsx("w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors", ui.settingsSection === 'themes' ? "bg-[rgba(0,0,0,0.05)] font-medium" : "opacity-70 hover:opacity-100 hover:bg-[rgba(0,0,0,0.02)]")}>Temas & Apariencia</button></div>
                            <div className="flex-1 overflow-y-auto px-12 py-12">
                                {ui.settingsSection === 'account' && (<div className="max-w-2xl animate-in fade-in duration-300"><h1 className="text-xl font-bold mb-6 pb-2 border-b border-[rgba(0,0,0,0.1)]">Mi Perfil</h1><div className="flex items-start gap-6 mb-8"><div onClick={() => triggerUpload('avatar')} className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden border border-zinc-200 shrink-0">{userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full object-cover" /> : <Camera size={32} className="text-zinc-300" />}</div><div className="flex-1 space-y-4"><div><label className="text-xs font-bold opacity-50 uppercase block mb-1">Nombre preferido</label><input value={userProfile.name} onChange={e => actions.setUserProfile(p => ({ ...p, name: e.target.value }))} className="w-full p-2 border border-zinc-200 rounded text-sm outline-none focus:border-zinc-400 bg-transparent transition-colors" /></div><div><label className="text-xs font-bold opacity-50 uppercase block mb-1">Correo electrónico</label><input value={userProfile.email} disabled className="w-full p-2 border border-zinc-200 rounded text-sm bg-[rgba(0,0,0,0.02)] opacity-60 cursor-not-allowed" /></div></div></div><button onClick={async () => { BackupService.saveBackup(userProfile.email); await AuthService.logout(); BackupService.clearLocalData(); window.location.reload(); }} className="text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 text-sm font-medium flex items-center gap-2"><LogOut size={16} /> Cerrar Sesión</button></div>)}
                                {ui.settingsSection === 'themes' && (
                                    <div className="max-w-2xl animate-in fade-in duration-300">
                                        <h1 className="text-xl font-bold mb-6 pb-2 border-b border-[rgba(0,0,0,0.1)]">Apariencia</h1>

                                        {/* Fonts Section */}
                                        <div className="mb-8">
                                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Tipografía</h2>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'sans', name: 'Sans Serif', value: 'ui-sans-serif, system-ui, sans-serif', preview: 'Aa' },
                                                    { id: 'serif', name: 'Serif', value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif', preview: 'Aa' },
                                                    { id: 'mono', name: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', preview: 'Aa' }
                                                ].map(font => (
                                                    <button key={font.id} onClick={() => actions.setActiveFontId(font.id)} className={clsx("p-3 border rounded-lg text-left transition-all", activeFontId === font.id ? "border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50")}>
                                                        <div className="text-2xl mb-2" style={{ fontFamily: font.value }}>{font.preview}</div>
                                                        <div className="text-sm font-medium text-zinc-900">{font.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Temas</h2>
                                        <div className="space-y-3">
                                            <div className="p-4 border border-zinc-200 rounded-lg flex justify-between items-center bg-white shadow-sm"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-white border border-zinc-200 rounded-md flex items-center justify-center text-lg font-serif">Aa</div><div><div className="font-bold text-sm text-zinc-900">stylessApp (Default)</div><div className="text-xs text-zinc-500">Tema original (Claro)</div></div></div><button onClick={() => actions.setActiveThemeId('default')} disabled={activeThemeId === 'default'} className={clsx("px-3 py-1.5 rounded text-xs transition-colors", activeThemeId === 'default' ? "bg-green-100 text-green-700 cursor-default font-medium" : "bg-zinc-900 text-white hover:bg-black")}>{activeThemeId === 'default' ? "Activo" : "Aplicar"}</button></div>
                                            {marketData.styles.map(t => (<div key={t.id} className="p-4 border border-zinc-200 rounded-lg flex justify-between items-center bg-white shadow-sm"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-md flex items-center justify-center text-lg font-bold text-white shadow-inner" style={{ backgroundColor: t.colors?.bg || '#333', color: t.colors?.text || '#fff' }}>Aa</div><div><div className="font-bold text-sm text-zinc-900">{t.name}</div><div className="text-xs text-zinc-500">Por {t.author}</div></div></div><div className="flex gap-2"><button onClick={() => actions.setActiveThemeId(t.id)} disabled={activeThemeId === t.id} className={clsx("px-3 py-1.5 rounded text-xs transition-colors", activeThemeId === t.id ? "bg-green-100 text-green-700 cursor-default font-medium" : "bg-zinc-900 text-white hover:bg-black")}>{activeThemeId === t.id ? "Activo" : "Aplicar"}</button></div></div>))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {ui.currentView === 'page' && (activePage ? (
                        <div className="max-w-3xl mx-auto px-4 py-12 pb-32">
                            {/* Cover & Icon */}
                            <div className="group relative mb-8">
                                {activePage.cover && <div className="h-48 w-full rounded-xl bg-cover bg-center mb-8 shadow-sm" style={{ backgroundImage: activePage.cover.startsWith('http') ? `url(${activePage.cover})` : activePage.cover }} />}
                                {!activePage.cover && <div className="h-12 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs text-zinc-400 mb-4">
                                    <button onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: true } }))} className="hover:bg-zinc-100 px-2 py-1 rounded flex items-center gap-1"><ImageIcon size={12} /> Añadir portada</button>
                                </div>}

                                <div className="text-7xl mb-4 group relative w-fit cursor-pointer" onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, iconPickerModal: true } }))}>
                                    {activePage.icon || <FileText size={64} className="text-zinc-200" />}
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
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4"><FileText size={32} /></div>
                            <p>Selecciona o crea una página</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Notification Toast */}
            <AnimatePresence>
                {ui.notification.show && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-4 right-4 bg-zinc-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-[100] flex items-center gap-2">
                        <Check size={14} className="text-green-400" />
                        {ui.notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Context Menu */}
            {contextMenu.isOpen && (
                <div className="fixed z-[100] bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 w-56 text-zinc-200 overflow-hidden" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={() => { actions.updatePage(contextMenu.pageId, { isFavorite: !activeWorkspace.pages.find(p => p.id === contextMenu.pageId)?.isFavorite }); showNotify(activeWorkspace.pages.find(p => p.id === contextMenu.pageId)?.isFavorite ? "Eliminado de favoritos" : "Añadido a favoritos"); setContextMenu({ ...contextMenu, isOpen: false }); }} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 flex items-center gap-2 transition-colors"><StarIcon size={14} fill={activeWorkspace.pages.find(p => p.id === contextMenu.pageId)?.isFavorite ? "currentColor" : "none"} /> {activeWorkspace.pages.find(p => p.id === contextMenu.pageId)?.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}</button>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); showNotify("Enlace copiado"); setContextMenu({ ...contextMenu, isOpen: false }); }} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 flex items-center gap-2 transition-colors"><LinkIcon size={14} /> Copiar enlace</button>
                    <button onClick={() => { actions.setActivePageId(contextMenu.pageId); setUi(p => ({ ...p, currentView: 'page' })); setContextMenu({ ...contextMenu, isOpen: false }); }} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 flex items-center gap-2 transition-colors"><EditIcon size={14} /> Renombrar</button>
                    <button onClick={() => { actions.duplicatePage(contextMenu.pageId); setContextMenu({ ...contextMenu, isOpen: false }); }} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 flex items-center gap-2 transition-colors"><CopyIcon size={14} /> Duplicar</button>
                    <div className="h-px bg-zinc-700 my-1" />
                    <button onClick={() => { actions.deletePage(contextMenu.pageId); setContextMenu({ ...contextMenu, isOpen: false }); }} className="w-full text-left px-3 py-2 text-sm hover:bg-red-900/30 text-red-400 flex items-center gap-2 transition-colors"><Trash size={14} /> Eliminar</button>
                </div>
            )}

            {/* Modals (Search, AI, etc.) */}
            <Modal isOpen={ui.modals.search} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, search: false } }))} title="Buscar">
                <div className="p-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
                        <input type="text" placeholder="Buscar páginas..." className="w-full pl-10 pr-4 py-2 bg-zinc-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                    </div>
                    <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                        {filteredPages.map(page => (
                            <div key={page.id} onClick={() => { actions.setActivePageId(page.id); setUi(p => ({ ...p, modals: { ...p.modals, search: false } })); }} className="flex items-center gap-3 p-2 hover:bg-zinc-100 rounded-lg cursor-pointer">
                                <div className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded text-lg">{page.icon || <FileText size={14} />}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{page.title || 'Sin título'}</div>
                                    <div className="text-xs text-zinc-400 flex items-center gap-2">
                                        <span>{page.workspaceName}</span>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(new Date(page.updatedAt))}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredPages.length === 0 && <div className="text-center text-zinc-400 py-8">No se encontraron resultados</div>}
                    </div>
                </div>
            </Modal>

            <Modal isOpen={ui.modals.ai} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, ai: false } }))} title="Fixius AI">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4"><Sparkles size={24} /></div>
                    <h3 className="text-lg font-semibold mb-2">Generar Página con IA</h3>
                    <p className="text-zinc-500 text-sm mb-6">Describe qué tipo de página necesitas y la IA la creará por ti.</p>
                    <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg mb-4 h-32 outline-none focus:border-indigo-500 resize-none" placeholder="Ej: Plan de marketing para Q4..." />
                    <button onClick={() => {
                        const newPageId = actions.addPage({ title: 'Generando...', isGenerating: true, icon: '✨' });
                        setUi(p => ({ ...p, modals: { ...p.modals, ai: false } }));
                        setIsAiGenerating(true);

                        // Simulate AI Generation
                        setTimeout(() => {
                            const generatedContent = [
                                { id: utils.generateId(), type: 'h1', content: aiPrompt || 'Página Generada' },
                                { id: utils.generateId(), type: 'p', content: 'Esta página ha sido generada automáticamente por Fixius AI basándose en tu descripción.' },
                                { id: utils.generateId(), type: 'callout', content: `Prompt original: "${aiPrompt}"` },
                                { id: utils.generateId(), type: 'h2', content: 'Contenido Sugerido' },
                                { id: utils.generateId(), type: 'todo', content: 'Revisar el contenido generado', checked: false },
                                { id: utils.generateId(), type: 'todo', content: 'Personalizar los bloques', checked: false },
                                { id: utils.generateId(), type: 'quote', content: 'La creatividad es la inteligencia divirtiéndose. - Albert Einstein' }
                            ];

                            actions.updatePage(newPageId, {
                                title: aiPrompt ? aiPrompt.slice(0, 20) + (aiPrompt.length > 20 ? '...' : '') : 'Página Generada',
                                isGenerating: false,
                                blocks: generatedContent,
                                icon: '🤖'
                            });
                            setIsAiGenerating(false);
                            showNotify("Página generada con éxito");
                        }, 3000);
                    }} disabled={!aiPrompt.trim() || isAiGenerating} className="w-full py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2">
                        {isAiGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                        {isAiGenerating ? 'Generando...' : 'Generar Página'}
                    </button>
                </div>
            </Modal>

            {/* Workspace Menu Modal */}
            {ui.modals.workspaceMenu && (
                <div className="fixed inset-0 z-[100] flex items-start justify-start" onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, workspaceMenu: false } }))}>
                    <div className="absolute top-14 left-4 w-72 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-2 border-b border-zinc-100">
                            <div className="text-xs font-semibold text-zinc-500 px-2 py-1 mb-1">Workspaces de {userProfile.email}</div>
                            {workspaces.filter(w => w.email === userProfile.email).map(ws => (
                                <div key={ws.id} onClick={() => { actions.setActiveWorkspaceId(ws.id); setUi(p => ({ ...p, modals: { ...p.modals, workspaceMenu: false } })); }} className="flex items-center justify-between px-2 py-1.5 hover:bg-zinc-100 rounded cursor-pointer group">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${ws.id === activeWorkspaceId ? 'ring-2 ring-offset-1 ring-zinc-400' : ''}`} style={{ background: ws.color || '#666' }}>{ws.initial}</div>
                                        <span className={`text-sm ${ws.id === activeWorkspaceId ? 'font-medium text-zinc-900' : 'text-zinc-600'}`}>{ws.name}</span>
                                    </div>
                                    {ws.id === activeWorkspaceId && <Check size={14} className="text-zinc-600" />}
                                    {workspaces.length > 1 && ws.id !== activeWorkspaceId && (
                                        <button onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar workspace "${ws.name}"?`)) actions.removeWorkspace(ws.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-500 rounded"><Trash size={12} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-2">
                            <div onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, workspaceMenu: false, createWorkspace: true } }))} className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 rounded cursor-pointer text-zinc-600 text-sm">
                                <PlusCircle size={16} /> <span>Crear nuevo workspace</span>
                            </div>
                            <div onClick={onLogout} className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 rounded cursor-pointer text-zinc-600 text-sm border-t border-zinc-100 mt-1 pt-2">
                                <LogOut size={16} /> <span>Cerrar sesión</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Workspace Modal */}
            <Modal isOpen={ui.modals.createWorkspace} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, createWorkspace: false } }))} title="Crear Workspace">
                <div className="p-4">
                    <input autoFocus value={newWorkspaceName} onChange={e => setNewWorkspaceName(e.target.value)} placeholder="Nombre del espacio de trabajo" className="w-full p-2 border border-zinc-200 rounded mb-4 outline-none focus:border-black" />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, createWorkspace: false } }))} className="px-4 py-2 text-zinc-500 hover:bg-zinc-100 rounded">Cancelar</button>
                        <button onClick={() => { if (newWorkspaceName.trim()) { actions.addWorkspace(newWorkspaceName); setNewWorkspaceName(''); setUi(p => ({ ...p, modals: { ...p.modals, createWorkspace: false } })); } }} disabled={!newWorkspaceName.trim()} className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 disabled:opacity-50">Crear</button>
                    </div>
                </div>
            </Modal>

            {/* Icon Picker Modal */}
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

            {/* Cover Gallery Modal */}
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

            {/* Page Options / Context Menu (Top Right) */}
            {ui.modals.pageOptions && (
                <div className="fixed inset-0 z-[100] flex items-start justify-end pr-4 pt-12" onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } }))}>
                    <div className="bg-white border border-zinc-200 rounded-lg shadow-xl w-64 overflow-hidden text-zinc-700" onClick={e => e.stopPropagation()}>
                        {ui.currentView === 'page' && activePage ? (
                            <div className="py-1">
                                <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estilo</div>
                                <div className="px-2 pb-2 flex gap-1">
                                    <button className="flex-1 py-1.5 border border-zinc-200 rounded hover:bg-zinc-50 text-xs font-sans">Default</button>
                                    <button className="flex-1 py-1.5 border border-zinc-200 rounded hover:bg-zinc-50 text-xs font-serif">Serif</button>
                                    <button className="flex-1 py-1.5 border border-zinc-200 rounded hover:bg-zinc-50 text-xs font-mono">Mono</button>
                                </div>
                                <div className="h-px bg-zinc-100 my-1" />
                                <div className="px-3 py-2 flex items-center justify-between hover:bg-zinc-50 cursor-pointer">
                                    <span className="text-sm">Texto pequeño</span>
                                    <div className="w-8 h-4 bg-zinc-200 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" /></div>
                                </div>
                                <div className="px-3 py-2 flex items-center justify-between hover:bg-zinc-50 cursor-pointer">
                                    <span className="text-sm">Ancho completo</span>
                                    <div className="w-8 h-4 bg-zinc-200 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" /></div>
                                </div>
                                <div className="h-px bg-zinc-100 my-1" />
                                <button onClick={() => { actions.updatePage(activePageId, { isFavorite: !activePage.isFavorite }); setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } })); }} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2">
                                    <StarIcon size={16} fill={activePage.isFavorite ? "currentColor" : "none"} className={activePage.isFavorite ? "text-yellow-400" : "text-zinc-400"} />
                                    {activePage.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                                </button>
                                <button onClick={() => { navigator.clipboard.writeText(window.location.href); setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } })); showNotify("Enlace copiado"); }} className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2">
                                    <LinkIcon size={16} className="text-zinc-400" /> Copiar enlace
                                </button>
                                <div className="h-px bg-zinc-100 my-1" />
                                <button onClick={() => { if (confirm("¿Eliminar página?")) { actions.deletePage(activePageId); setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } })); } }} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2">
                                    <Trash size={16} /> Eliminar página
                                </button>
                            </div>
                        ) : (
                            <div className="py-1">
                                <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Espacio de trabajo</div>
                                <div className="px-3 py-2 text-sm text-zinc-600">
                                    <div className="font-medium text-zinc-900 mb-1">{activeWorkspace?.name}</div>
                                    <div className="text-xs">{userProfile.email}</div>
                                </div>
                                <div className="h-px bg-zinc-100 my-1" />
                                <button onClick={() => { if (confirm("¿Estás seguro de que quieres eliminar este espacio de trabajo permanentemente?")) { actions.removeWorkspace(activeWorkspaceId); setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } })); } }} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-500 flex items-center gap-2">
                                    <Trash size={16} /> Eliminar workspace
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);

                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                    setSession(session);
                });
                setLoading(false);
                return () => subscription.unsubscribe();
            } else {
                // Mock Auth Check
                const hasAuth = localStorage.getItem('notion_mock_user');
                if (hasAuth) setSession({ user: JSON.parse(hasAuth) });
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const handleLogin = async () => {
        const data = await AuthService.login();
        if (data?.user) setSession({ user: data.user });
    };

    const handleLogout = async () => {
        await AuthService.logout();
        setSession(null);
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;

    return session ? <MainApp session={session} onLogout={handleLogout} /> : <LandingPage onLogin={handleLogin} />;
}
