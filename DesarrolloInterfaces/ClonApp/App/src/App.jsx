import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, ChevronDown, FileText, Plus, Sparkles, ArrowRight,
    Search, Settings, MoreHorizontal, X, Github, Palette, Type, Globe, Lock,
    Check, Users, Inbox, ArrowLeft, SlidersHorizontal, User, Briefcase, Plane, Music,
    Wand2, Loader2, LayoutTemplate, Bell, ChevronsLeft, CreditCard, LogOut,
    ChevronRight, UploadCloud, Command, FolderOpen, Camera, PlusCircle, Download, FileJson,
    Smile, MessageSquare, ImagePlus, Archive, RefreshCcw, CornerDownLeft, Clock,
    LayoutGrid, Package, Undo2, Filter, Quote, Minus, Info, ListOrdered,
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
                // However, useLocalStorage hook listens to window events or we can manually set.
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
        <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-color)] text-[var(--text-color)] font-sans">
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
                            <div onClick={() => setUi(p => ({ ...p, currentView: 'settings' }))} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                                <Settings size={14} /> <span>Configuración</span>
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto fancy-scroll px-2 pb-4">
                            <div className="mb-4">
                                <div className="px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Páginas</div>
                                {activeWorkspace?.pages.filter(p => !p.parentId && !p.isDeleted && !p.inInbox).map(page => (
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
                        </div>

                        {/* Sidebar Footer */}
                        <div className="p-2 border-t border-zinc-200">
                            <div onClick={() => actions.addPage()} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                                <Plus size={14} /> <span>Nueva página</span>
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
                <div className="flex-1 overflow-y-auto fancy-scroll relative">
                    {activePage ? (
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
                    )}
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
                <div className="fixed z-[100] bg-white border border-zinc-200 rounded-lg shadow-lg py-1 w-48" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button onClick={() => { actions.duplicatePage(contextMenu.pageId); setContextMenu({ ...contextMenu, isOpen: false }); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-100 flex items-center gap-2"><CopyIcon size={14} /> Duplicar</button>
                    <button onClick={() => { actions.deletePage(contextMenu.pageId); setContextMenu({ ...contextMenu, isOpen: false }); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-100 text-red-600 flex items-center gap-2"><Trash size={14} /> Eliminar</button>
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
                    <button onClick={() => { setIsAiGenerating(true); setTimeout(() => { setIsAiGenerating(false); setUi(p => ({ ...p, modals: { ...p.modals, ai: false } })); showNotify("Página generada (Simulación)"); }, 2000); }} disabled={!aiPrompt.trim() || isAiGenerating} className="w-full py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2">
                        {isAiGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                        {isAiGenerating ? 'Generando...' : 'Generar Página'}
                    </button>
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
