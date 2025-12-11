import { Moon, Sun, Trash, Database, Cloud, CloudOff, Upload, Download, RefreshCw, LogIn, LogOut, User } from 'lucide-react'
import { toast } from 'sonner'
import { LocalDB } from '../lib/db'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { docKeys, folderKeys, trashKeys, useDocuments, useFolders, useTrash } from '../hooks/useDocuments'
import * as SupabaseAPI from '../lib/supabase'
import { useStore } from '../store/useStore'

export function Settings() {
    const queryClient = useQueryClient()
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [isClearing, setIsClearing] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [authLoading, setAuthLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showAuthForm, setShowAuthForm] = useState(false)

    const { data: localDocs = [] } = useDocuments()
    const { data: localFolders = [] } = useFolders()
    const { data: localTrash = [] } = useTrash()

    const supabaseConfigured = SupabaseAPI.isSupabaseConfigured()

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark')
        setTheme(isDark ? 'dark' : 'light')

        if (SupabaseAPI.supabase) {
            SupabaseAPI.supabase.auth.getUser().then(({ data }) => {
                setUser(data.user)
            })
            SupabaseAPI.supabase.auth.onAuthStateChange((_, session) => {
                setUser(session?.user ?? null)
            })
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    const handleClearData = async () => {
        if (!confirm('¿Borrar todos los datos locales?')) return
        setIsClearing(true)
        try {
            await LocalDB.saveAllDocuments([])
            await LocalDB.saveAllFolders([])
            await LocalDB.saveAllTrash([])
            await queryClient.invalidateQueries({ queryKey: docKeys.all })
            await queryClient.invalidateQueries({ queryKey: folderKeys.all })
            await queryClient.invalidateQueries({ queryKey: trashKeys.all })
            toast.success('Datos locales borrados')
        } catch (e) {
            toast.error('Error al borrar')
        } finally {
            setIsClearing(false)
        }
    }

    const handleSyncToCloud = async () => {
        if (!supabaseConfigured) return toast.error('Supabase no configurado')
        setIsSyncing(true)
        try {
            const result = await SupabaseAPI.syncLocalToCloud(localDocs, localFolders, localTrash)
            if (result.success) {
                toast.success(`Subido: ${localDocs.length} documentos`)
            } else {
                toast.error(`Errores: ${result.errors.length}`)
            }
        } catch (e) {
            toast.error('Error al sincronizar')
        } finally {
            setIsSyncing(false)
        }
    }

    const handleDownloadFromCloud = async () => {
        if (!supabaseConfigured) return toast.error('Supabase no configurado')
        setIsDownloading(true)
        try {
            const cloudDocs = await SupabaseAPI.fetchDocuments()
            const cloudFolders = await SupabaseAPI.fetchFolders()

            const existingIds = new Set(localDocs.map(d => d.id))
            const newDocs = cloudDocs.filter(d => !existingIds.has(d.id))

            for (const doc of newDocs) {
                await LocalDB.addDocument(doc)
            }

            const existingFolderIds = new Set(localFolders.map(f => f.id))
            const newFolders = cloudFolders.filter(f => !existingFolderIds.has(f.id))

            for (const folder of newFolders) {
                await LocalDB.addFolder(folder)
            }

            await queryClient.invalidateQueries({ queryKey: docKeys.all })
            await queryClient.invalidateQueries({ queryKey: folderKeys.all })
            toast.success(`Descargado: ${newDocs.length} docs, ${newFolders.length} carpetas`)
        } catch (e) {
            toast.error('Error al descargar')
        } finally {
            setIsDownloading(false)
        }
    }

    const handleClearCloudData = async () => {
        if (!SupabaseAPI.supabase) return
        if (!confirm('¿Borrar todos los datos de la NUBE?')) return
        try {
            await SupabaseAPI.supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            await SupabaseAPI.supabase.from('folders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            toast.success('Nube limpiada')
        } catch (e) {
            toast.error('Error')
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!SupabaseAPI.supabase) {
            toast.error('Error: Supabase no está configurado. Revisa las variables de entorno.')
            return
        }
        setAuthLoading(true)
        try {
            const { error } = await SupabaseAPI.supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            toast.success('Sesión iniciada')
            setShowAuthForm(false)
        } catch (e: any) {
            toast.error(e.message || 'Error')
        } finally {
            setAuthLoading(false)
        }
    }

    const handleSignup = async () => {
        if (!SupabaseAPI.supabase) return
        setAuthLoading(true)
        try {
            const { error } = await SupabaseAPI.supabase.auth.signUp({ email, password })
            if (error) throw error
            toast.success('Revisa tu correo')
        } catch (e: any) {
            toast.error(e.message || 'Error')
        } finally {
            setAuthLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        if (!SupabaseAPI.supabase) return
        await SupabaseAPI.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        })
    }

    const handleLogout = async () => {
        if (!SupabaseAPI.supabase) return
        await SupabaseAPI.supabase.auth.signOut()
        toast.success('Sesión cerrada')
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <header className="mb-8 border-b border-border pb-4">
                <h2 className="text-3xl font-bold">Configuración</h2>
                <p className="text-muted-foreground mt-2">Personaliza tu experiencia y gestiona datos.</p>
            </header>

            <div className="space-y-6">
                {/* Theme */}
                <section className="bg-card border rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                            </div>
                            <div>
                                <h3 className="font-semibold">Apariencia</h3>
                                <p className="text-sm text-muted-foreground">Modo claro/oscuro</p>
                            </div>
                        </div>
                        <button onClick={toggleTheme} className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80">
                            {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                        </button>
                    </div>
                </section>

                {/* Cloud */}
                <section className="bg-card border rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Cloud size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold">Sincronización Cloud</h3>
                            <p className="text-sm text-muted-foreground">
                                {supabaseConfigured ? `✅ Conectado • ${localDocs.length} docs locales` : '❌ No configurado'}
                            </p>
                        </div>
                    </div>
                    {supabaseConfigured && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button onClick={handleSyncToCloud} disabled={isSyncing} className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition disabled:opacity-50">
                                <Upload size={20} className="text-green-500" />
                                <span className="text-xs">{isSyncing ? 'Subiendo...' : 'Subir'}</span>
                            </button>
                            <button onClick={handleDownloadFromCloud} disabled={isDownloading} className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition disabled:opacity-50">
                                <Download size={20} className="text-blue-500" />
                                <span className="text-xs">{isDownloading ? 'Bajando...' : 'Descargar'}</span>
                            </button>
                            <button onClick={() => { handleSyncToCloud(); handleDownloadFromCloud(); }} className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-accent transition">
                                <RefreshCw size={20} className="text-purple-500" />
                                <span className="text-xs">Sincronizar</span>
                            </button>
                            <button onClick={handleClearCloudData} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-destructive/30 hover:bg-destructive/10 transition">
                                <CloudOff size={20} className="text-destructive" />
                                <span className="text-xs text-destructive">Borrar Nube</span>
                            </button>
                        </div>
                    )}
                </section>

                {/* Auth */}
                <section className="bg-card border rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold">Cuenta</h3>
                                <p className="text-sm text-muted-foreground">{user ? user.email : 'No autenticado'}</p>
                            </div>
                        </div>
                        {user ? (
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80">
                                <LogOut size={16} /> Salir
                            </button>
                        ) : (
                            <button onClick={() => setShowAuthForm(!showAuthForm)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                                <LogIn size={16} /> Entrar
                            </button>
                        )}
                    </div>
                    {showAuthForm && !user && supabaseConfigured && (
                        <form onSubmit={handleLogin} className="mt-4 space-y-3">
                            <input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-md border bg-background" />
                            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-md border bg-background" />
                            <div className="flex gap-2">
                                <button type="submit" disabled={authLoading} className="flex-1 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50">
                                    {authLoading ? 'Cargando...' : 'Entrar'}
                                </button>
                                <button type="button" onClick={handleSignup} disabled={authLoading} className="flex-1 py-2 rounded-md bg-secondary disabled:opacity-50">
                                    Registrarse
                                </button>
                            </div>
                            <button type="button" onClick={handleGoogleLogin} className="w-full py-2 rounded-md border hover:bg-accent flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Google
                            </button>
                        </form>
                    )}
                </section>

                {/* Custom CSS Theme */}
                <section className="bg-card border rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <span className="font-bold text-lg">CSS</span>
                        </div>
                        <div>
                            <h3 className="font-semibold">Tema Personalizado</h3>
                            <p className="text-sm text-muted-foreground">Inyecta CSS global para personalizar la interfaz.</p>
                        </div>
                    </div>
                    <textarea
                        className="w-full h-48 p-4 font-mono text-xs bg-muted/50 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                        placeholder="/* Ejemplo: */&#10;.bg-card { background: #fff !important; }"
                        value={useStore.getState().customCSS}
                        onChange={(e) => useStore.getState().setCustomCSS(e.target.value)}
                        spellCheck={false}
                    />
                </section>

                {/* Danger Zone */}
                <section className="bg-card border rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-destructive">Zona de Peligro</h3>
                                <p className="text-sm text-muted-foreground">Borrar datos locales</p>
                            </div>
                        </div>
                        <button onClick={handleClearData} disabled={isClearing} className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">
                            <Trash size={16} /> {isClearing ? 'Borrando...' : 'Borrar Local'}
                        </button>
                    </div>
                </section>

                <div className="text-center text-xs text-muted-foreground pt-8">
                    MultiDocApp v1.0 • {supabaseConfigured ? '☁️ Cloud' : '💾 Local'}
                </div>
            </div>
        </div>
    )
}
