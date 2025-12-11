
import React, { useEffect, useState } from 'react'
import { LayoutGrid, Settings, Plus, Menu, X, Image, FileCode, FileText, Video, Trash2, RefreshCw } from 'lucide-react'
import { Toaster } from 'sonner'
import { CreateNewDialog } from './CreateNewDialog'
import { SyncStatusIndicator, SyncNotification } from './SyncStatusIndicator'
import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { DataService } from '../lib/data-service'
import { useStore } from '../store/useStore'
import { toast } from 'sonner'
import type { DocType } from '../lib/schemas'

const TYPE_FOLDERS: { label: string; types: DocType[]; icon: React.ReactNode }[] = [
    { label: 'Imágenes', types: ['image'], icon: <Image size={18} /> },
    { label: 'Código/Datos', types: ['code', 'json', 'csv', 'html'], icon: <FileCode size={18} /> },
    { label: 'Documentos', types: ['pdf', 'excel'], icon: <FileText size={18} /> },
    { label: 'Multimedia', types: ['video', 'audio'], icon: <Video size={18} /> },
    { label: 'Texto', types: ['text', 'markdown'], icon: <FileText size={18} /> },
]

export function Layout({ children }: { children: React.ReactNode }) {
    const routerState = useRouterState()
    const navigate = useNavigate()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const { customCSS, syncMode, selectedTypeFilter, setTypeFilter } = useStore()

    useEffect(() => {
        DataService.initializeData()
        // Check if mobile
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleManualSync = async () => {
        setIsSyncing(true)
        try {
            await DataService.syncWithCloud()
            toast.success('Sincronización completada')
        } catch (e) {
            toast.error('Error al sincronizar')
        } finally {
            setIsSyncing(false)
        }
    }

    const handleTypeClick = (types: DocType[]) => {
        // For simplicity, use the first type in the array as the filter
        setTypeFilter(types[0])
        navigate({ to: '/dashboard' })
        isMobile && setIsSidebarOpen(false)
    }

    const handleDashboardClick = () => {
        setTypeFilter(null)
        isMobile && setIsSidebarOpen(false)
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Custom Theme Injection */}
            {customCSS && <style dangerouslySetInnerHTML={{ __html: customCSS }} />}

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card border rounded-md shadow-lg"
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar Hover Zone (Desktop) */}
            <div
                className="hidden md:block fixed left-0 top-0 bottom-0 w-4 z-30"
                onMouseEnter={() => !isMobile && setIsSidebarOpen(true)}
            />

            {/* Sidebar Backdrop (Mobile) */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -256 }}
                animate={{ x: isSidebarOpen ? 0 : -256 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onMouseEnter={() => !isMobile && setIsSidebarOpen(true)}
                onMouseLeave={() => !isMobile && setIsSidebarOpen(false)}
                className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card flex flex-col z-40 shadow-xl"
            >
                <div className="p-6 border-b border-border">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                        MultiDocApp
                    </h1>
                    <div className="mt-3">
                        <SyncStatusIndicator />
                    </div>

                    <div className="mt-6">
                        <CreateNewDialog>
                            <button
                                onClick={() => isMobile && setIsSidebarOpen(false)}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 px-4 rounded-md hover:bg-primary/90 transition-all font-medium shadow-sm hover:shadow-md"
                            >
                                <Plus size={18} />
                                Nuevo / Subir
                            </button>
                        </CreateNewDialog>
                    </div>

                    {/* Manual Sync Button */}
                    {syncMode === 'manual' && (
                        <button
                            onClick={handleManualSync}
                            disabled={isSyncing}
                            className="mt-3 w-full flex items-center justify-center gap-2 border border-primary/30 text-primary py-2 px-4 rounded-md hover:bg-primary/10 transition-all text-sm font-medium disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                            {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                        </button>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {/* Dashboard */}
                    <Link
                        to="/dashboard"
                        onClick={handleDashboardClick}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${routerState.location.pathname === '/dashboard' && !selectedTypeFilter
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                    >
                        <LayoutGrid size={20} />
                        <span>Dashboard</span>
                    </Link>

                    {/* Type Folders */}
                    <div className="pt-2 mt-2 border-t border-border space-y-1">
                        <span className="text-xs text-muted-foreground px-3 py-1 block">Categorías</span>
                        {TYPE_FOLDERS.map((folder) => (
                            <button
                                key={folder.label}
                                onClick={() => handleTypeClick(folder.types)}
                                className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedTypeFilter && folder.types.includes(selectedTypeFilter)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                            >
                                {folder.icon}
                                <span>{folder.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Trash */}
                    <div className="pt-2 mt-2 border-t border-border">
                        <Link
                            to="/trash"
                            onClick={() => isMobile && setIsSidebarOpen(false)}
                            activeProps={{ className: 'bg-primary/10 text-primary' }}
                            inactiveProps={{ className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground' }}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            <Trash2 size={20} />
                            <span>Papelera</span>
                        </Link>
                    </div>

                    {/* Settings */}
                    <div className="pt-4 mt-4 border-t border-border">
                        <Link
                            to="/settings"
                            onClick={() => isMobile && setIsSidebarOpen(false)}
                            activeProps={{ className: 'bg-primary/10 text-primary' }}
                            inactiveProps={{ className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground' }}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            <Settings size={20} />
                            <span>Configuración</span>
                        </Link>
                    </div>
                </nav>
            </motion.aside>

            {/* Sidebar Visual Indicator (when collapsed) */}
            {!isSidebarOpen && !isMobile && (
                <div
                    className="hidden md:flex fixed left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 via-primary/20 to-primary/50 z-20 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                    onMouseEnter={() => setIsSidebarOpen(true)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-hidden bg-muted/20 relative flex flex-col">
                <AnimatePresence>
                    <motion.div
                        key={routerState.location.pathname}
                        initial={{ opacity: 0, scale: 0.99, x: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex-1 w-full h-full overflow-auto"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
            <Toaster position="bottom-right" richColors />
            <SyncNotification />
        </div>
    )
}
