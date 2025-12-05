import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, MessageSquare, MoreHorizontal, Check } from 'lucide-react';
import { clsx } from 'clsx';

// Imports from our modules
import { supabase, AuthService } from './lib/supabase';
import { BackupService } from './lib/backup';
import { utils, ICONS_LIST, COVER_COLORS, COVER_IMAGES } from './lib/utils';
import { useAppStore } from './store/useAppStore';
import { useCSSVariables, themeToVariables } from './hooks/useCSSVariables';

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
import { DatabaseView } from './components/Database/DatabaseView';

// Modals
import { SearchModal } from './components/Modals/SearchModal';
import { AIModal } from './components/Modals/AIModal';
import { WorkspaceMenu } from './components/Modals/WorkspaceMenu';
import { MarketplaceModal } from './components/Modals/MarketplaceModal';
import { CreateWorkspaceModal } from './components/Modals/CreateWorkspaceModal';
import { IconPickerModal } from './components/Modals/IconPickerModal';
import { CoverGalleryModal } from './components/Modals/CoverGalleryModal';
import { PageOptionsModal } from './components/Modals/PageOptionsModal';
import { CreateDatabaseModal } from './components/Modals/CreateDatabaseModal';

// Constants
const API_ENDPOINTS = { MARKET: "/api/market", AI: "/api/generar-pagina", UPLOAD: "/api/upload" };

// Main App Component
function MainApp({ session, onLogout }) {
    // Hooks and State
    const { workspaces, userProfile, activeWorkspace, activeWorkspaceId, activePage, activePageId, themes, activeTheme, activeThemeId, fonts, activeFontId, downloads, actions, setWorkspaces, setUserProfile, setThemes, setFonts, setActiveWorkspaceId, setActiveThemeId, setActiveFontId } = useAppStore();

    // Apply CSS variables from active theme
    const themeVariables = useMemo(() => themeToVariables(activeTheme), [activeTheme]);
    useCSSVariables(themeVariables);

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
            createDatabase: false,
            googleLogin: false
        },
        iconPickerTab: 'emoji',
        notification: { show: false, message: '' },
        isAuthenticated: true,
        favoritesOpen: true,
        pagesOpen: true
    });

    const [activeDatabaseId, setActiveDatabaseId] = useState(null);
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

    // Local Market Data Fetcher
    const fetchMarketData = async () => {
        setLoadingMarket(true);
        try {
            // Themes (CSS only)
            const themes = Object.entries(import.meta.glob('../assets/stylesApp/*.css', { eager: true, as: 'url' })).map(([path, url]) => {
                const name = path.split('/').pop().split('.')[0].replace(/-/g, ' ');
                return {
                    id: name.toLowerCase().replace(/\s+/g, '-'),
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    author: 'Local',
                    preview: '🎨',
                    type: 'css',
                    url: url,
                    colors: { bg: '#1a1a1a', text: '#ffffff' }
                };
            });

            // Covers (Images)
            const covers = Object.entries(import.meta.glob('../assets/coversApp/*.*', { eager: true, as: 'url' })).map(([path, url]) => {
                const name = path.split('/').pop().split('.')[0].replace(/-/g, ' ');
                return {
                    id: name,
                    name: name,
                    author: 'Local',
                    preview: url,
                    type: 'cover'
                };
            });

            // Icons
            const icons = Object.entries(import.meta.glob('../assets/iconsApp/*.svg', { eager: true, as: 'url' })).map(([path, url]) => {
                const name = path.split('/').pop().split('.')[0].replace(/-/g, ' ');
                return {
                    id: name,
                    name: name,
                    author: 'Local',
                    preview: '📦',
                    type: 'icon',
                    url: url
                };
            });

            // Fonts
            const fonts = Object.entries(import.meta.glob('../assets/tipographyApp/**/*.otf', { eager: true, as: 'url' })).map(([path, url]) => {
                const parts = path.split('/');
                const fontName = parts[parts.length - 2];
                return {
                    id: fontName,
                    name: fontName,
                    author: 'Local',
                    preview: 'Aa',
                    type: 'font',
                    url: url
                };
            });
            const uniqueFonts = Array.from(new Map(fonts.map(item => [item.name, item])).values());

            setMarketData({
                styles: themes,
                icons: icons,
                fonts: uniqueFonts,
                covers: covers,
                templates: []
            });

        } catch (error) {
            console.error("Error fetching local market data:", error);
        } finally {
            setLoadingMarket(false);
        }
    };

    // Trigger Market Fetch when modal opens
    useEffect(() => {
        if (ui.modals.market) {
            fetchMarketData();
        }
    }, [ui.modals.market]);

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
                activeDatabaseId={activeDatabaseId}
                actions={actions}
                userProfile={userProfile}
                workspaces={workspaces}
                handleContextMenu={handleContextMenu}
                setActiveDatabaseId={setActiveDatabaseId}
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
                            fonts={fonts}
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
                            downloads={downloads}
                            isMobile={isMobile}
                            toggleSidebar={toggleSidebar}
                        />
                    )}
                    {ui.currentView === 'database' && activeDatabaseId && (
                        <DatabaseView
                            databaseId={activeDatabaseId}
                        />
                    )}
                    {ui.modals.createWorkspace && (
                        <CreateWorkspaceModal
                            ui={ui}
                            setUi={setUi}
                            newWorkspaceName={newWorkspaceName}
                            setNewWorkspaceName={setNewWorkspaceName}
                            actions={actions}
                        />
                    )}
                    {ui.modals.workspaceMenu && (
                        <WorkspaceMenu
                            ui={ui}
                            setUi={setUi}
                            workspaces={workspaces}
                            userProfile={userProfile}
                            activeWorkspaceId={activeWorkspaceId}
                            actions={actions}
                            onLogout={onLogout}
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
                            newWorkspaceName={newWorkspaceName}
                            setNewWorkspaceName={setNewWorkspaceName}
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
                            fonts={fonts}
                            actions={actions}
                            showNotify={showNotify}
                            activePageId={activePageId}
                            downloads={downloads}
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
                            downloads={downloads}
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
                    {ui.modals.createWorkspace && (
                        <CreateWorkspaceModal
                            ui={ui}
                            setUi={setUi}
                            newWorkspaceName={newWorkspaceName}
                            setNewWorkspaceName={setNewWorkspaceName}
                            actions={actions}
                        />
                    )}
                    {ui.modals.workspaceMenu && (
                        <WorkspaceMenu
                            ui={ui}
                            setUi={setUi}
                            workspaces={workspaces}
                            userProfile={userProfile}
                            activeWorkspaceId={activeWorkspaceId}
                            actions={actions}
                            onLogout={onLogout}
                        />
                    )}
                    {ui.modals.createDatabase && (
                        <CreateDatabaseModal
                            isOpen={ui.modals.createDatabase}
                            onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, createDatabase: false } }))}
                            actions={actions}
                            setActiveDatabaseId={setActiveDatabaseId}
                            setUi={setUi}
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
