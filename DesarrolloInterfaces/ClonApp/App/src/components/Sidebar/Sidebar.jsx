import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Smile, ImageIcon, MessageSquare, Search, Sparkles, LayoutGrid, Inbox, Settings, Package, Trash, Plus, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { SidebarItem } from './SidebarItem';

const Sidebar = ({ ui, setUi, activeWorkspace, activeWorkspaceId, activePageId, activeDatabaseId, actions, userProfile, workspaces, handleContextMenu, setActiveDatabaseId }) => {
    const userName = userProfile?.email ? userProfile.email.split('@')[0] : 'Usuario';
    return (
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
                            {activeWorkspace?.initial || (userProfile?.email ? userProfile.email[0].toUpperCase() : 'W')}
                        </div>
                        <span className="font-medium text-sm truncate flex-1">
                            {activeWorkspace?.name || (userProfile?.email ? `${userProfile.email.split('@')[0]}'s Workspace` : 'Workspace')}
                        </span>
                        <div className="w-4 h-4 flex items-center justify-center text-zinc-400 group-hover:text-zinc-600"><ChevronDown size={12} /></div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-2 mb-2 space-y-0.5">
                        <div onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, search: true } }))} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer group">
                            <Search size={14} /> <span className="flex-1">Buscar</span> <span className="text-xs border border-zinc-300 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity">Ctrl+K</span>
                        </div>
                        <div onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, ai: true } }))} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                            <Sparkles size={14} /> <span>{userName} AI</span>
                        </div>
                        <div onClick={() => setUi(p => ({ ...p, currentView: 'home' }))} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                            <LayoutGrid size={14} /> <span>Inicio</span>
                        </div>
                        <div onClick={() => setUi(p => ({ ...p, currentView: 'inbox' }))} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                            <Inbox size={14} /> <span>Bandeja</span>
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

                    {/* Databases Section */}
                    {(activeWorkspace?.databases || []).filter(db => db.type === 'fullpage').length > 0 && (
                        <div className="mb-4">
                            <div className="px-3 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between group cursor-pointer hover:bg-zinc-200/30 rounded" onClick={() => setUi(p => ({ ...p, databasesOpen: !p.databasesOpen }))}>
                                <span>Bases de Datos</span>
                                <div onClick={(e) => { e.stopPropagation(); const name = 'Nueva Base de Datos'; actions.addDatabase(name, 'fullpage'); }} className="opacity-0 group-hover:opacity-100 hover:bg-zinc-300 rounded p-0.5 transition-all"><Plus size={12} /></div>
                            </div>
                            {ui.databasesOpen !== false && (
                                <div>
                                    {(activeWorkspace?.databases || []).filter(db => db.type === 'fullpage').map(database => (
                                        <div
                                            key={database.id}
                                            onClick={() => {
                                                setUi(p => ({ ...p, currentView: 'database' }));
                                                setActiveDatabaseId(database.id);
                                            }}
                                            className={`group flex items-center gap-2 px-3 py-1.5 text-sm rounded hover:bg-zinc-200/50 cursor-pointer relative ${activeDatabaseId === database.id ? 'bg-zinc-200/50 font-medium' : 'opacity-80'}`}
                                        >
                                            <span>{database.icon || '📊'}</span>
                                            <span className="flex-1 truncate">{database.title}</span>

                                            {/* Hover Actions */}
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity absolute right-1 bg-[var(--sidebar-bg)] shadow-sm rounded">
                                                <button onClick={(e) => { e.stopPropagation(); /* TODO: onContextMenu for database */ }} className="p-0.5 hover:bg-zinc-200 rounded text-zinc-500"><MoreHorizontal size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sidebar Footer */}
                    <div className="p-2 border-t border-zinc-200 space-y-0.5">
                        <div onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, createDatabase: true } }))} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                            <span>Nueva Base de Datos</span>
                        </div>
                        <div onClick={() => setUi(p => ({ ...p, modals: { ...p.modals, market: true } }))} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                            <Package size={14} /> <span>Marketplace</span>
                        </div>
                        <div onClick={() => setUi(p => ({ ...p, currentView: 'settings' }))} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                            <Settings size={14} /> <span>Configuración</span>
                        </div>
                        <div onClick={() => setUi(p => ({ ...p, currentView: 'trash' }))} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200/50 rounded-md cursor-pointer">
                            <Trash size={14} /> <span>Papelera</span>
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
