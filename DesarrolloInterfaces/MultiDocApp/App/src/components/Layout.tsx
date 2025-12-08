
import React, { useEffect } from 'react'
import { LayoutGrid, Settings, Plus, FolderOpen } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Toaster } from 'sonner'
import { CreateDocumentDialog } from './CreateDocumentDialog'
import { Link, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'

export function Layout({ children }: { children: React.ReactNode }) {
    const { init } = useStore() // Move init here or to a higher level provider
    const routerState = useRouterState()

    useEffect(() => {
        init()
    }, [])

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card flex flex-col z-20 shadow-sm relative">
                <div className="p-6 border-b border-border">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                        MultiDocApp
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/dashboard"
                        activeProps={{ className: 'bg-primary/10 text-primary' }}
                        inactiveProps={{ className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground' }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        <LayoutGrid size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/dashboard" // Intentionally same as dashboard for now, or could be a list view
                        activeProps={{ className: 'bg-primary/10 text-primary' }}
                        inactiveProps={{ className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground' }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        <FolderOpen size={20} />
                        <span>Documentos</span>
                    </Link>

                    <div className="pt-4 mt-4 border-t border-border">
                        <Link
                            to="/settings"
                            activeProps={{ className: 'bg-primary/10 text-primary' }}
                            inactiveProps={{ className: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground' }}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            <Settings size={20} />
                            <span>Configuración</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-border">
                    <CreateDocumentDialog>
                        <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-all font-medium">
                            <Plus size={18} />
                            Nuevo Documento
                        </button>
                    </CreateDocumentDialog>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden bg-muted/20 relative flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={routerState.location.pathname}
                        initial={{ opacity: 0, scale: 0.99, x: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.99, x: -10 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex-1 w-full h-full overflow-auto"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
            <Toaster position="bottom-right" richColors />
        </div>
    )
}
