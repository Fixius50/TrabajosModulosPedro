import React, { useState } from 'react'
import { LogIn, User } from 'lucide-react'
import { toast } from 'sonner'
import * as SupabaseAPI from '../lib/supabase'
import { useStore } from '../store/useStore'

export function LoginPage() {
    const { setGuest } = useStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authLoading, setAuthLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!SupabaseAPI.supabase) {
            toast.error('Error: Supabase no está configurado')
            return
        }
        setAuthLoading(true)
        try {
            const { error } = await SupabaseAPI.supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            toast.success('Sesión iniciada')
            // Auth change listener in Layout/App will handle redirect
        } catch (e: any) {
            toast.error(e.message || 'Error al iniciar sesión')
        } finally {
            setAuthLoading(false)
        }
    }

    const handleSignup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!SupabaseAPI.supabase) return
        setAuthLoading(true)
        try {
            const { error } = await SupabaseAPI.supabase.auth.signUp({ email, password })
            if (error) throw error
            toast.success('Revisa tu correo para confirmar')
            setIsSignUp(false)
        } catch (e: any) {
            toast.error(e.message || 'Error al registrarse')
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

    const handleGuestLogin = () => {
        setGuest(true)
        toast.info('Entrando en modo invitado (Local)')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                        MultiDocApp
                    </h1>
                    <p className="text-muted-foreground">Tu universo de documentos multimedia.</p>
                </div>

                <div className="space-y-6">
                    <form onSubmit={isSignUp ? handleSignup : handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full h-12 px-4 rounded-lg border bg-muted/50 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full h-12 px-4 rounded-lg border bg-muted/50 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={authLoading}
                                className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <LogIn size={18} />
                                {authLoading ? '...' : (isSignUp ? 'Crear cuenta' : 'Entrar')}
                            </button>

                            <div className="relative flex items-center justify-center">
                                <span className="absolute inset-x-0 h-px bg-border"></span>
                                <span className="relative bg-card px-2 text-xs text-muted-foreground">O</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                disabled={authLoading}
                                className="w-full h-12 rounded-lg bg-secondary font-medium hover:bg-secondary/80 transition-all disabled:opacity-50"
                            >
                                {isSignUp ? 'Ya tengo cuenta' : 'Crear nueva cuenta'}
                            </button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="h-10 rounded-lg border hover:bg-muted flex items-center justify-center gap-2 transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={handleGuestLogin}
                            className="h-10 rounded-lg border hover:bg-muted flex items-center justify-center gap-2 transition-all"
                        >
                            <User size={18} />
                            Invitado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
