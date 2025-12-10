
import { Moon, Sun, Trash, Database } from 'lucide-react'
import { toast } from 'sonner'
import { LocalDB } from '../lib/db'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { docKeys, folderKeys, trashKeys } from '../hooks/useDocuments'

export function Settings() {
    const queryClient = useQueryClient()
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [isClearing, setIsClearing] = useState(false)

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark')
        setTheme(isDark ? 'dark' : 'light')
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    const handleClearData = async () => {
        if (!confirm('¿Estás seguro? Esto borrará todos tus documentos, carpetas y papelera.')) return

        setIsClearing(true)
        try {
            // Clear all data stores
            await LocalDB.saveAllDocuments([])
            await LocalDB.saveAllFolders([])
            await LocalDB.saveAllTrash([])

            // Invalidate all queries to refresh the UI
            await queryClient.invalidateQueries({ queryKey: docKeys.all })
            await queryClient.invalidateQueries({ queryKey: folderKeys.all })
            await queryClient.invalidateQueries({ queryKey: trashKeys.all })

            toast.success('Base de datos local limpiada')
        } catch (e) {
            toast.error('Error al limpiar datos')
            console.error(e)
        } finally {
            setIsClearing(false)
        }
    }

    return (
        <div className="p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <header className="mb-8 border-b border-border pb-4">
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground mt-2">
                    Personaliza tu experiencia y gestiona tus datos.
                </p>
            </header>

            <div className="space-y-6">
                {/* Theme Section */}
                <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Apariencia</h3>
                                <p className="text-sm text-muted-foreground">Alternar entre modo claro y oscuro.</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-colors"
                        >
                            {theme === 'light' ? 'Activar Modo Oscuro' : 'Activar Modo Claro'}
                        </button>
                    </div>
                </section>

                {/* Data Section */}
                <section className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-destructive">Zona de Peligro</h3>
                                <p className="text-sm text-muted-foreground">Gestiona el almacenamiento local de la aplicación.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClearData}
                            disabled={isClearing}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium transition-colors disabled:opacity-50"
                        >
                            <Trash size={16} />
                            {isClearing ? 'Borrando...' : 'Borrar Todos los Datos'}
                        </button>
                    </div>
                </section>

                <div className="text-center text-xs text-muted-foreground pt-8">
                    MultiDocApp v1.0.0 • Persistencia Local
                </div>
            </div>
        </div>
    )
}
