import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, MessageSquare, MoreHorizontal, Check } from 'lucide-react';
import { clsx } from 'clsx';

// Imports from our modules
import { supabase, AuthService } from './lib/supabase';
import { BackupService } from './lib/backup';
import { utils, ICONS_LIST, COVER_COLORS, COVER_IMAGES } from './lib/utils';
import { useAppStore } from './store/useAppStore';

// Components
import { LandingPage } from './components/Views/LandingPage';
import Sidebar from './components/Sidebar/Sidebar';
import { Modal } from './components/UI';
import { ContextMenu } from './components/ContextMenu';

// Views
import { HomeView } from './components/Views/HomeView';
import { InboxView } from './components/Views/InboxView';
import { TrashView } from './components/Views/TrashView';
import { SettingsView } from './components/Views/SettingsView';
import { PageView } from './components/Views/PageView';
import { EmptyWorkspaceView } from './components/Views/EmptyWorkspaceView';

// Modals
import { SearchModal } from './components/Modals/SearchModal';
import { AIModal } from './components/Modals/AIModal';
import { WorkspaceMenu } from './components/Modals/WorkspaceMenu';
import { MarketplaceModal } from './components/Modals/MarketplaceModal';
import { CreateWorkspaceModal } from './components/Modals/CreateWorkspaceModal';
import { IconPickerModal } from './components/Modals/IconPickerModal';
import { CoverGalleryModal } from './components/Modals/CoverGalleryModal';
import { PageOptionsModal } from './components/Modals/PageOptionsModal';

// Constants
const API_ENDPOINTS = { MARKET: "/api/market", AI: "/api/generar-pagina", UPLOAD: "/api/upload" };

// Main App Component
function MainApp({ session, onLogout }) {
    // Hooks and State
    const { workspaces, userProfile, activeWorkspace, activeWorkspaceId, activePage, activePageId, themes, activeTheme, activeThemeId, fonts, activeFontId, actions, setWorkspaces, setUserProfile, setThemes, setFonts, setActiveWorkspaceId, setActiveThemeId, setActiveFontId } = useAppStore();

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
        iconPickerTab: 'emoji',
        notification: { show: false, message: '' },
        isAuthenticated: true,
        favoritesOpen: true,
        pagesOpen: true
    });

    // Trigger Market Fetch when modal opens
    useEffect(() => {
        if (ui.modals.market) {
            fetchMarketData();
        }
    }, [ui.modals.market]);

    const [showComments, setShowComments] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilters, setSearchFilters] = useState({ scope: 'all', sort: 'newest', date: 'any' });
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [marketData, setMarketData] = useState({ styles: [], fonts: [], covers: [] });
    const [loadingMarket, setLoadingMarket] = useState(false);
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
                try {
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
                } catch (e) {
                    console.error("Error restoring backup:", e);
                }
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

        // Date Filter
        const now = new Date();
        if (searchFilters.date === 'today') results = results.filter(p => new Date(p.updatedAt) >= new Date(now.setHours(0, 0, 0, 0)));
        else if (searchFilters.date === 'week') results = results.filter(p => new Date(p.updatedAt) >= new Date(now.setDate(now.getDate() - 7)));
        else if (searchFilters.date === 'month') results = results.filter(p => new Date(p.updatedAt) >= new Date(now.setMonth(now.getMonth() - 1)));

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

    const handleCreateWorkspaceWithTemplate = (workspaceName, templateId) => {
        const templatePages = {
            personal: [
                { title: 'Tareas', icon: '✅', blocks: [{ id: utils.generateId(), type: 'h1', content: 'Mis Tareas' }, { id: utils.generateId(), type: 'todo', content: 'Organizar escritorio', checked: false }] },
                { title: 'Notas', icon: '📝', blocks: [{ id: utils.generateId(), type: 'h1', content: 'Notas Rápidas' }] },
                { title: 'Diario', icon: '📔', blocks: [{ id: utils.generateId(), type: 'h1', content: 'Mi Diario' }] },
            ],
            work: [
                { title: 'Proyectos', icon: '💼', blocks: [{ id: utils.generateId(), type: 'h1', content: 'Proyectos Activos' }] },
                { title: 'Reuniones', icon: '🤝', blocks: [{ id: utils.generateId(), type: 'h1', content: 'Ac tas de Reuniones' }] },
                { title: 'Ideas', icon: '💡', blocks: [{ id: utils.generateId(), type: 'h1', content: 'Ideas Nuevas' }] },
                { title: 'Recursos', icon: '📚', blocks: [{ id: utils.generateId(), type: 'h1', content: 'Enlaces y Herramientas' }] },
            ],
            study: [
                { title: 'Apuntes', icon: '📖', blocks: [{ id: utils.generateId(), type: 'h1', content: 'Resum en de Clases' }] },
                { title: 'Tareas', icon: '✏️', blocks: [{ id: utils.generateId(), type: 'h1', content: 'Tareas Pendientes' }] },
                { title: 'Recursos', icon: '🔖', blocks: [{ id: utils.generateId(), type: 'h1', content: 'Material de Estudio' }] },
            ],
        };

        const pages = templateId && templatePages[templateId] ? templatePages[templateId].map(p => ({
            id: utils.generateId(),
            title: p.title,
            icon: p.icon,
            cover: null,
            comments: [],
            inInbox: false,
            isFavorite: false,
            isDeleted: false,
            isGenerating: false,
            parentId: null,
            updatedAt: new Date().toISOString(),
            blocks: p.blocks || []
        })) : [];

        const newWs = {
            id: utils.generateId(),
            name: workspaceName,
            initial: workspaceName[0].toUpperCase(),
            color: 'from-indigo-500 to-purple-500',
            email: userProfile.email,
            pages
        };
        setWorkspaces(p => [...p, newWs]);
        setActiveWorkspaceId(newWs.id);
    };

    const fetchMarketData = async () => {
        setLoadingMarket(true);
        await utils.delay(800);
        setMarketData({
            styles: [
                { id: 'theme-dark', name: 'Dark Mode', author: userProfile?.email ? userProfile.email.split('@')[0] : 'Usuario', colors: { bg: '#18181b', text: '#fafafa' } },
                { id: 'theme-sepia', name: 'Sepia Reading', author: 'Reader', colors: { bg: '#fdf6e3', text: '#5f4b32' } },
                { id: 'theme-ocean', name: 'Ocean Blue', author: 'Nature', colors: { bg: '#f0f9ff', text: '#0c4a6e' } },
                { id: 'theme-forest', name: 'Forest Green', author: 'Nature', colors: { bg: '#f0fdf4', text: '#14532d' } }
            ],
            templates: [
                { id: 'tmpl-marketing', name: 'Plan de Marketing', icon: '📈', description: 'Estrategia completa para Q4', blocks: [{ id: 'b1', type: 'h1', content: 'Plan de Marketing' }, { id: 'b2', type: 'todo', content: 'Definir KPIs', checked: false }] },
                { id: 'tmpl-journal', name: 'Diario Personal', icon: '📔', description: 'Plantilla para reflexiones diarias', blocks: [{ id: 'b1', type: 'h1', content: 'Diario' }, { id: 'b2', type: 'p', content: 'Hoy me siento...' }] },
                { id: 'tmpl-meeting', name: 'Notas de Reunión', icon: '🤝', description: 'Estructura para actas de reuniones', blocks: [{ id: 'b1', type: 'h1', content: 'Reunión de Equipo' }, { id: 'b2', type: 'h2', content: 'Asistentes' }, { id: 'b3', type: 'todo', content: 'Juan', checked: true }] }
            ],
            covers: []
        });
        setLoadingMarket(false);
    };

    // --- RENDER ---
    // Show Empty Workspace View if no workspaces exist
    if (workspaces.length === 0) {
        return <EmptyWorkspaceView onCreateWorkspace={handleCreateWorkspaceWithTemplate} />;
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-color)] text-[var(--text-color)]" style={{ fontFamily: 'var(--font-main)' }}>
            <Sidebar
                ui={ui}
                setUi={setUi}
                activeWorkspace={activeWorkspace}
                activeWorkspaceId={activeWorkspaceId}
                activePageId={activePageId}
                actions={actions}
                userProfile={userProfile}
                workspaces={workspaces}
                handleContextMenu={handleContextMenu}
            />

            <main className="flex-1 h-full relative flex flex-col min-w-0 bg-[var(--bg-color)]">
                <AnimatePresence mode="wait">
                    {ui.currentView === 'home' && (
                        <HomeView
                            workspaces={workspaces}
                            activeWorkspace={activeWorkspace}
                            actions={actions}
                            setUi={setUi}
                        />
                    )}
                    {ui.currentView === 'inbox' && (
                        <InboxView
                            activeWorkspace={activeWorkspace}
                            actions={actions}
                        />
                    )}
                    {ui.currentView === 'trash' && (
                        <TrashView
                            activeWorkspace={activeWorkspace}
                            actions={actions}
                            showNotify={showNotify}
                        />
                    )}
                    {ui.currentView === 'settings' && (
                        <SettingsView
                            ui={ui}
                            setUi={setUi}
                            userProfile={userProfile}
                            actions={actions}
                            themes={themes}
                            activeThemeId={activeThemeId}
                            activeFontId={activeFontId}
                            fetchMarketData={fetchMarketData}
                            onLogout={onLogout}
                            activeWorkspaceId={activeWorkspaceId}
                        />
                    )}
                    {ui.currentView === 'page' && (
                        <PageView
                            activePage={activePage}
                            activePageId={activePageId}
                            ui={ui}
                            setUi={setUi}
                            actions={actions}
                            isMobile={isMobile}
                            toggleSidebar={toggleSidebar}
                        />
                    )}
                </AnimatePresence>

                {/* Modals */}
                <AnimatePresence>
                    {ui.modals.search && (
                        <SearchModal
                            ui={ui}
                            setUi={setUi}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            searchFilters={searchFilters}
                            setSearchFilters={setSearchFilters}
                            filteredPages={filteredPages}
                            actions={actions}
                        />
                    )}
                    {ui.modals.ai && (
                        <AIModal
                            ui={ui}
                            setUi={setUi}
                            aiPrompt={aiPrompt}
                            setAiPrompt={setAiPrompt}
                            isAiGenerating={isAiGenerating}
                            setIsAiGenerating={setIsAiGenerating}
                            actions={actions}
                            showNotify={showNotify}
                            userProfile={userProfile}
                        />
                    )}
                    {ui.modals.workspaceMenu && (
                        <WorkspaceMenu
                            isOpen={ui.modals.workspaceMenu}
                            onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, workspaceMenu: false } }))}
                            ui={ui}
                            setUi={setUi}
                            workspaces={workspaces}
                            activeWorkspaceId={activeWorkspaceId}
                            actions={actions}
                            userProfile={userProfile}
                        />
                    )}
                    {ui.modals.market && (
                        <MarketplaceModal
                            isOpen={ui.modals.market}
                            onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, market: false } }))}
                            ui={ui}
                            setUi={setUi}
                            loadingMarket={loadingMarket}
                            marketData={marketData}
                            themes={themes}
                            actions={actions}
                            showNotify={showNotify}
                        />
                    )}
                    {ui.modals.createWorkspace && (
                        <CreateWorkspaceModal
                            isOpen={ui.modals.createWorkspace}
                            onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, createWorkspace: false } }))}
                            ui={ui}
                            setUi={setUi}
                            actions={actions}
                            newWorkspaceName={newWorkspaceName}
                            setNewWorkspaceName={setNewWorkspaceName}
                        />
                    )}
                    {ui.modals.iconPicker && (
                        <IconPickerModal
                            isOpen={ui.modals.iconPicker}
                            onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, iconPicker: false } }))}
                            ui={ui}
                            setUi={setUi}
                            actions={actions}
                            activePageId={activePageId}
                        />
                    )}
                    {ui.modals.coverGallery && (
                        <CoverGalleryModal
                            isOpen={ui.modals.coverGallery}
                            onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: false } }))}
                            ui={ui}
                            setUi={setUi}
                            actions={actions}
                            activePageId={activePageId}
                            marketData={marketData}
                        />
                    )}
                    {ui.modals.pageOptions && (
                        <PageOptionsModal
                            isOpen={ui.modals.pageOptions}
                            onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } }))}
                            ui={ui}
                            setUi={setUi}
                            actions={actions}
                            activePage={activePage}
                            activePageId={activePageId}
                        />
                    )}
                </AnimatePresence>

                {/* Context Menu */}
                <ContextMenu
                    isOpen={contextMenu.isOpen}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    pageId={contextMenu.pageId}
                    onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
                    actions={actions}
                    activeWorkspace={activeWorkspace}
                />
            </main>
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

    const handleLoginSuccess = (user) => {
        setSession({ user });
    };

    const handleLogout = async () => {
        await AuthService.logout();
        setSession(null);
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;

    return session ? <MainApp session={session} onLogout={handleLogout} /> : <LandingPage onLoginSuccess={handleLoginSuccess} />;
}
