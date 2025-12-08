
import { useStore } from '../store/useStore'
import { Moon, Sun, Trash, Database } from 'lucide-react'
import { toast } from 'sonner'
import { LocalDB } from '../lib/db'
import { useEffect, useState } from 'react'

export function Settings() {
    const { init } = useStore()
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

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
        if (!confirm('¿Estás seguro? Esto borrará todos tus documentos locales.')) return

        try {
            await LocalDB.saveAll([])
            await init() // Reload store
            toast.success('Base de datos local limpiada')
        } catch (e) {
            toast.error('Error al limpiar datos')
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
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium transition-colors"
                        >
                            <Trash size={16} />
                            Borrar Todos los Datos
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
