import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { utils, DEFAULT_THEME, INITIAL_STATE } from '../lib/utils.js';

const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => { try { return JSON.parse(window.localStorage.getItem(key)) || initialValue; } catch { return initialValue; } });

    const setValue = useCallback((value) => {
        setStoredValue(oldValue => {
            const valueToStore = value instanceof Function ? value(oldValue) : value;
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            return valueToStore;
        });
    }, [key]);

    return [storedValue, setValue];
};

export const useAppStore = () => {
    const [workspaces, setWorkspaces] = useLocalStorage('notion_v82_ws', INITIAL_STATE.workspaces);
    const [userProfile, setUserProfile] = useLocalStorage('notion_v82_profile', INITIAL_STATE.profile);
    const [themes, setThemes] = useLocalStorage('notion_v82_themes', INITIAL_STATE.themes);
    const [fonts, setFonts] = useLocalStorage('notion_v82_fonts', INITIAL_STATE.fonts);
    const [activeWorkspaceId, setActiveWorkspaceId] = useLocalStorage('notion_v82_active_id', 'ws-demo');
    const [activePageId, setActivePageId] = useState(null);
    const [activeThemeId, setActiveThemeId] = useLocalStorage('notion_v82_active_theme', 'default');
    const [activeFontId, setActiveFontId] = useLocalStorage('notion_v82_active_font', 'sans');
    const [downloads, setDownloads] = useLocalStorage('notion_v82_downloads', { icons: [], covers: [] });

    const activeWorkspace = useMemo(() => {
        if (!Array.isArray(workspaces)) return null;
        const found = workspaces.find(w => w.id === activeWorkspaceId);
        if (found) return found;
        if (workspaces.length > 0) { setActiveWorkspaceId(workspaces[0].id); return workspaces[0]; }
        return null;
    }, [workspaces, activeWorkspaceId]);

    const activePage = useMemo(() => activeWorkspace?.pages.find(p => p.id === activePageId), [activeWorkspace, activePageId]);
    const activeTheme = useMemo(() => themes.find(t => t.id === activeThemeId) || DEFAULT_THEME, [themes, activeThemeId]);
    const activeFont = useMemo(() => fonts.find(f => f.id === activeFontId) || { id: 'sans', name: 'Sans Serif', value: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif' }, [fonts, activeFontId]);

    // Centralized State Exposure
    useEffect(() => {
        window.appState = { workspaces, userProfile, themes, fonts, activeWorkspaceId, activePageId, activeThemeId };
    }, [workspaces, userProfile, themes, fonts, activeWorkspaceId, activePageId, activeThemeId]);

    // CSS Theme Injection Logic
    useEffect(() => {
        const themeLink = document.getElementById('theme-stylesheet');
        if (activeTheme && activeTheme.type === 'css' && activeTheme.url) {
            if (themeLink) {
                themeLink.href = activeTheme.url;
            } else {
                const link = document.createElement('link');
                link.id = 'theme-stylesheet';
                link.rel = 'stylesheet';
                link.href = activeTheme.url;
                document.head.appendChild(link);
            }
        } else {
            if (themeLink) themeLink.remove();
        }
    }, [activeTheme]);

    // Font Injection Logic
    useEffect(() => {
        document.documentElement.style.setProperty('--font-main', activeFont?.value || 'ui-sans-serif, system-ui, sans-serif');
    }, [activeFont]);

    const actions = {
        setActiveWorkspaceId, setActivePageId, setUserProfile, setActiveThemeId,
        addWorkspace: (name) => {
            const wsName = name || (userProfile?.email ? `${userProfile.email.split('@')[0]}'s Workspace` : 'New Workspace');
            const newWs = {
                id: utils.generateId(),
                name: wsName,
                initial: wsName[0].toUpperCase(),
                color: utils.getRandomColor(),
                email: userProfile.email,
                pages: [
                    { id: utils.generateId(), title: 'Bienvenida', icon: '👋', cover: null, comments: [], inInbox: false, isFavorite: false, isDeleted: false, isGenerating: false, parentId: null, updatedAt: new Date().toISOString(), blocks: [{ id: utils.generateId(), type: 'h1', content: 'Bienvenida' }, { id: utils.generateId(), type: 'p', content: 'Este es tu nuevo espacio de trabajo.' }] },
                    { id: utils.generateId(), title: 'Tareas', icon: '✅', cover: null, comments: [], inInbox: false, isFavorite: false, isDeleted: false, isGenerating: false, parentId: null, updatedAt: new Date().toISOString(), blocks: [{ id: utils.generateId(), type: 'h1', content: 'Lista de Tareas' }, { id: utils.generateId(), type: 'todo', content: 'Revisar documentación', checked: false }, { id: utils.generateId(), type: 'todo', content: 'Configurar perfil', checked: false }] }
                ]
            };
            setWorkspaces(p => [...p, newWs]);
            setActiveWorkspaceId(newWs.id);
        },
        removeWorkspace: (id) => { if (workspaces.length <= 1) return false; const newWorkspaces = workspaces.filter(w => w.id !== id); setWorkspaces(newWorkspaces); if (activeWorkspaceId === id) setActiveWorkspaceId(newWorkspaces[0].id); return true; },
        addPage: (overrides = {}) => {
            if (!activeWorkspace) return;
            const newPage = {
                id: utils.generateId(),
                title: '',
                icon: null,
                cover: null,
                comments: [],
                inInbox: false,
                isFavorite: false,
                isDeleted: false,
                isGenerating: false,
                parentId: null,
                updatedAt: new Date().toISOString(),
                blocks: [],
                ...overrides
            };
            const updatedWs = { ...activeWorkspace, pages: [...activeWorkspace.pages, newPage] };
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? updatedWs : w));
            return newPage.id;
        },
        movePage: (pageId, targetParentId) => {
            if (!activeWorkspace) return;
            if (pageId === targetParentId) return;

            const updatedPages = activeWorkspace.pages.map(p => p.id === pageId ? { ...p, parentId: targetParentId } : p);
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? { ...activeWorkspace, pages: updatedPages } : w));
        },
        duplicatePage: (pageId) => {
            if (!activeWorkspace) return;
            const pageToDup = activeWorkspace.pages.find(p => p.id === pageId);
            if (!pageToDup) return;
            const newPage = { ...pageToDup, id: utils.generateId(), title: `${pageToDup.title} (Copia)`, updatedAt: new Date().toISOString(), blocks: pageToDup.blocks.map(b => ({ ...b, id: utils.generateId() })) };
            const updatedWs = { ...activeWorkspace, pages: [...activeWorkspace.pages, newPage] };
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? updatedWs : w));
            // showNotify("Página duplicada"); // Needs to be handled by UI or passed callback
        },
        updatePage: (pid, u) => setWorkspaces(p => p.map(w => w.id === activeWorkspaceId ? { ...w, pages: w.pages.map(pg => pg.id === pid ? { ...pg, ...u } : pg) } : w)),
        deletePage: (pid) => {
            setWorkspaces(p => p.map(w => {
                if (w.id !== activeWorkspaceId) return w;
                const getAllDescendants = (pageId, pages) => {
                    const children = pages.filter(pg => pg.parentId === pageId);
                    let allDescendants = [...children];
                    children.forEach(child => {
                        allDescendants = [...allDescendants, ...getAllDescendants(child.id, pages)];
                    });
                    return allDescendants;
                };
                const descendantsToDelete = getAllDescendants(pid, w.pages);
                const allIdsToDelete = [pid, ...descendantsToDelete.map(p => p.id)];
                const updatedPages = w.pages.map(pg =>
                    allIdsToDelete.includes(pg.id)
                        ? { ...pg, isDeleted: true, deletedAt: new Date().toISOString() }
                        : pg
                );
                return { ...w, pages: updatedPages };
            }));
            if (activePageId === pid) setActivePageId(null);
        },
        restorePage: (pid) => { setWorkspaces(p => p.map(w => w.id === activeWorkspaceId ? { ...w, pages: w.pages.map(pg => pg.id === pid ? { ...pg, isDeleted: false, deletedAt: null } : pg) } : w)); },
        permanentDeletePage: (pid) => { setWorkspaces(p => p.map(w => w.id === activeWorkspaceId ? { ...w, pages: w.pages.filter(pg => pg.id !== pid) } : w)); },
        updateBlock: (bid, u) => activePage && actions.updatePage(activePageId, { blocks: activePage.blocks.map(b => b.id === bid ? { ...b, ...u } : b) }),
        addBlock: (idx, data) => activePage && actions.updatePage(activePageId, { blocks: [...activePage.blocks.slice(0, idx), { id: utils.generateId(), type: 'p', content: '', ...data }, ...activePage.blocks.slice(idx)] }),
        deleteBlock: (idx) => activePage && actions.updatePage(activePageId, { blocks: [...activePage.blocks.slice(0, idx), ...activePage.blocks.slice(idx + 1)] }),
        reorderBlocks: (fromIndex, toIndex) => {
            if (!activePage) return;
            const blocks = [...activePage.blocks];
            const [moved] = blocks.splice(fromIndex, 1);
            blocks.splice(toIndex, 0, moved);
            actions.updatePage(activePageId, { blocks });
        },
        // Database Actions
        addDatabase: (name, type = 'fullpage', parentPageId = null) => {
            if (!activeWorkspace) return null;
            const defaultView = {
                id: utils.generateId(),
                name: 'Tabla',
                type: 'table',
                filters: [],
                sorts: [],
                visibleProperties: []
            };
            const titleProperty = {
                id: utils.generateId(),
                name: 'Nombre',
                type: 'title',
                visible: true,
                order: 0
            };
            const newDatabase = {
                id: utils.generateId(),
                title: name || 'Nueva Base de Datos',
                icon: '📊',
                type,
                parentPageId,
                properties: [titleProperty],
                items: [],
                views: [defaultView],
                activeViewId: defaultView.id
            };
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? { ...w, databases: [...(w.databases || []), newDatabase] } : w));
            return newDatabase.id;
        },
        updateDatabase: (databaseId, updates) => {
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? { ...w, databases: (w.databases || []).map(db => db.id === databaseId ? { ...db, ...updates } : db) } : w));
        },
        deleteDatabase: (databaseId) => {
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? { ...w, databases: (w.databases || []).filter(db => db.id !== databaseId) } : w));
        },
        addDatabaseItem: (databaseId, title = '') => {
            if (!activeWorkspace) return null;
            const database = (activeWorkspace.databases || []).find(db => db.id === databaseId);
            if (!database) return null;

            // Crear página para el item
            const pageId = actions.addPage({ title: title || 'Sin título', isDatabaseItem: true, databaseId });

            const titleProperty = database.properties.find(p => p.type === 'title');
            const newItem = {
                id: utils.generateId(),
                pageId,
                values: {
                    [titleProperty.id]: title || 'Sin título'
                }
            };

            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? {
                ...w,
                databases: (w.databases || []).map(db => db.id === databaseId ? { ...db, items: [...db.items, newItem] } : db)
            } : w));
            return newItem.id;
        },
        updateDatabaseItem: (databaseId, itemId, propertyId, value) => {
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? {
                ...w,
                databases: (w.databases || []).map(db => db.id === databaseId ? {
                    ...db,
                    items: db.items.map(item => item.id === itemId ? {
                        ...item,
                        values: { ...item.values, [propertyId]: value }
                    } : item)
                } : db)
            } : w));
        },
        deleteDatabaseItem: (databaseId, itemId) => {
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? {
                ...w,
                databases: (w.databases || []).map(db => db.id === databaseId ? {
                    ...db,
                    items: db.items.filter(item => item.id !== itemId)
                } : db)
            } : w));
        },
        addProperty: (databaseId, property) => {
            const database = (activeWorkspace?.databases || []).find(db => db.id === databaseId);
            if (!database) return null;

            const newProperty = {
                id: utils.generateId(),
                name: property.name || 'Nueva Propiedad',
                type: property.type || 'text',
                visible: true,
                order: database.properties.length,
                config: property.config || {}
            };

            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? {
                ...w,
                databases: (w.databases || []).map(db => db.id === databaseId ? {
                    ...db,
                    properties: [...db.properties, newProperty]
                } : db)
            } : w));
            return newProperty.id;
        },
        updateProperty: (databaseId, propertyId, updates) => {
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? {
                ...w,
                databases: (w.databases || []).map(db => db.id === databaseId ? {
                    ...db,
                    properties: db.properties.map(p => p.id === propertyId ? { ...p, ...updates } : p)
                } : db)
            } : w));
        },
        deleteProperty: (databaseId, propertyId) => {
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? {
                ...w,
                databases: (w.databases || []).map(db => db.id === databaseId ? {
                    ...db,
                    properties: db.properties.filter(p => p.id !== propertyId && p.type !== 'title')
                } : db)
            } : w));
        },
        addView: (databaseId, view) => {
            const newView = {
                id: utils.generateId(),
                name: view.name || 'Nueva Vista',
                type: view.type || 'table',
                filters: [],
                sorts: [],
                visibleProperties: []
            };

            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? {
                ...w,
                databases: (w.databases || []).map(db => db.id === databaseId ? {
                    ...db,
                    views: [...db.views, newView]
                } : db)
            } : w));
            return newView.id;
        },
        updateView: (databaseId, viewId, updates) => {
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? {
                ...w,
                databases: (w.databases || []).map(db => db.id === databaseId ? {
                    ...db,
                    views: db.views.map(v => v.id === viewId ? { ...v, ...updates } : v)
                } : db)
            } : w));
        },
        deleteView: (databaseId, viewId) => {
            setWorkspaces(workspaces.map(w => w.id === activeWorkspaceId ? {
                ...w,
                databases: (w.databases || []).map(db => db.id === databaseId ? {
                    ...db,
                    views: db.views.filter(v => v.id !== viewId),
                    activeViewId: db.activeViewId === viewId ? db.views[0]?.id : db.activeViewId
                } : db)
            } : w));
        },
        addTheme: (t) => { if (!t.name) return; setThemes(p => { const exists = p.find(ex => ex.id === t.id); if (exists) return p.map(ex => ex.id === t.id ? t : ex); return [...p, t]; }); },
        removeTheme: (themeId) => {
            if (themeId === 'default') return;
            setThemes(p => p.filter(t => t.id !== themeId));
            if (activeThemeId === themeId) setActiveThemeId('default');
        },
        addFont: (f) => { if (!f.name) return; setFonts(p => { const exists = p.find(ex => ex.id === f.id); if (exists) return p; return [...p, f]; }); },
        removeFont: (fontId) => { setFonts(p => p.filter(f => f.id !== fontId)); if (activeFontId === fontId) setActiveFontId('sans'); },
        addComment: (text) => { if (!activePage) return; const newComment = { id: utils.generateId(), author: userProfile.name, avatar: userProfile.avatar, text, createdAt: new Date().toISOString() }; const currentComments = activePage.comments || []; actions.updatePage(activePageId, { comments: [...currentComments, newComment] }); },
        emptyInbox: () => {
            setWorkspaces(p => p.map(w => {
                if (w.id !== activeWorkspaceId) return w;
                return { ...w, pages: w.pages.filter(pg => !pg.inInbox) };
            }));
        },
        emptyTrash: () => {
            setWorkspaces(p => p.map(w => {
                if (w.id !== activeWorkspaceId) return w;
                return { ...w, pages: w.pages.filter(pg => !pg.isDeleted) };
            }));
        },
        deleteAllPages: () => {
            setWorkspaces(p => p.map(w => {
                if (w.id !== activeWorkspaceId) return w;
                return { ...w, pages: [] };
            }));
            setActivePageId(null);
        },
        // Downloads management
        addDownloadedIcon: (icon) => {
            setDownloads(prev => ({
                ...prev,
                icons: [...(prev.icons || []), { ...icon, downloadedAt: Date.now() }]
            }));
        },
        addDownloadedCover: (cover) => {
            setDownloads(prev => ({
                ...prev,
                covers: [...(prev.covers || []), { ...cover, downloadedAt: Date.now() }]
            }));
        },
        isDownloaded: (type, id) => {
            return downloads[type]?.some(item => item.id === id) || false;
        },
        clearDownloadedIcons: () => {
            setDownloads(prev => ({ ...prev, icons: [] }));
        },
        clearDownloadedCovers: () => {
            setDownloads(prev => ({ ...prev, covers: [] }));
        },
        // Internal setters for restoration
        setWorkspaces, setUserProfile, setThemes, setFonts, setActiveWorkspaceId, setActiveThemeId
    };

    return {
        workspaces, userProfile, activeWorkspace, activeWorkspaceId, activePage, activePageId,
        themes, activeTheme, activeThemeId,
        fonts, activeFont, activeFontId,
        downloads,
        actions, utils,
        setWorkspaces, setUserProfile, setThemes, setFonts, setActiveWorkspaceId, setActiveThemeId, setActiveFontId
    };
};
