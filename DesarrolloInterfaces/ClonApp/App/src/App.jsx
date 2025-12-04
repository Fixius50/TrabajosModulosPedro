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

// Views
import { HomeView } from './components/Views/HomeView';
import { InboxView } from './components/Views/InboxView';
import { TrashView } from './components/Views/TrashView';
import { SettingsView } from './components/Views/SettingsView';
import { PageView } from './components/Views/PageView';

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
        marketTab: 'gallery',
        marketSubTab: 'store',
        iconPickerTab: 'emoji',
        notification: { show: false, message: '' },
        isAuthenticated: true,
        favoritesOpen: true,
        pagesOpen: true
    });

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

    const fetchMarketData = async () => {
        // Mock implementation for now
        setLoadingMarket(true);
        await utils.delay(500);
        setLoadingMarket(false);
    };

    // --- RENDER ---
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
                    {ui.currentView === 'inbox' && <InboxView />}
                    {ui.currentView === 'trash' && <TrashView />}
                    {ui.currentView === 'settings' && <SettingsView onLogout={onLogout} />}
                    {ui.currentView === 'page' && (
                        <PageView
                            pageId={activePageId}
                            isMobile={isMobile}
                            toggleSidebar={toggleSidebar}
                        />
                    )}
                </AnimatePresence>

                {/* Modals */}
                <AnimatePresence>
                    {ui.modals.search && (
                        <SearchModal
                            isOpen={ui.modals.search}
                            onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, search: false } }))}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            filteredPages={filteredPages}
                        />
                    )}
                    {ui.modals.ai && <AIModal isOpen={ui.modals.ai} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, ai: false } }))} />}
                    {ui.modals.workspaceMenu && <WorkspaceMenu isOpen={ui.modals.workspaceMenu} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, workspaceMenu: false } }))} />}
                    {ui.modals.market && <MarketplaceModal isOpen={ui.modals.market} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, market: false } }))} />}
                    {ui.modals.createWorkspace && <CreateWorkspaceModal isOpen={ui.modals.createWorkspace} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, createWorkspace: false } }))} />}
                    {ui.modals.iconPicker && <IconPickerModal isOpen={ui.modals.iconPicker} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, iconPicker: false } }))} />}
                    {ui.modals.coverGallery && <CoverGalleryModal isOpen={ui.modals.coverGallery} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, coverGallery: false } }))} />}
                    {ui.modals.pageOptions && <PageOptionsModal isOpen={ui.modals.pageOptions} onClose={() => setUi(p => ({ ...p, modals: { ...p.modals, pageOptions: false } }))} />}
                </AnimatePresence>
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
