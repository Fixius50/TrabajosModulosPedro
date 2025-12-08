
import React from 'react'
import { LayoutGrid, Settings, Plus, FolderOpen } from 'lucide-react'
import { useStore } from '../store/useStore'
import { cn } from '../lib/utils'
import { Toaster } from 'sonner'
import { CreateDocumentDialog } from './CreateDocumentDialog'

export function Layout({ children }: { children: React.ReactNode }) {
    const { view, setView } = useStore()

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card flex flex-col">
                <div className="p-6 border-b border-border">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                        MultiDocApp
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem
                        icon={<LayoutGrid size={20} />}
                        label="Dashboard"
                        active={view === 'dashboard'}
                        onClick={() => setView('dashboard')}
                    />
                    <NavItem
                        icon={<FolderOpen size={20} />}
                        label="Documentos"
                        active={view === 'dashboard'}
                        onClick={() => setView('dashboard')}
                    />
                    <div className="pt-4 mt-4 border-t border-border">
                        <NavItem
                            icon={<Settings size={20} />}
                            label="Configuración"
                            active={view === 'settings'}
                            onClick={() => setView('settings')}
                        />
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
            <main className="flex-1 overflow-auto bg-muted/20 relative">
                {children}
            </main>
            <Toaster position="bottom-right" richColors />
        </div>
    )
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}
