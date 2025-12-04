import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Info } from 'lucide-react';
import { AuthService } from '../../lib/supabase';

export function LandingPage({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            let data;
            if (isSignUp) {
                data = await AuthService.signUp(email, password);
                if (data?.user) {
                    alert("Registro exitoso. Por favor verifica tu correo electrónico (si usas Supabase real) o inicia sesión.");
                    setIsSignUp(false);
                }
            } else {
                data = await AuthService.signInWithPassword(email, password);
                if (data?.user) {
                    onLoginSuccess(data.user);
                }
            }
        } catch (err) {
            setError(err.message || "Error en la autenticación");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const data = await AuthService.signInWithGoogle();
            if (data?.user) onLoginSuccess(data.user);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white to-zinc-50">
            <div className="max-w-md w-full space-y-8">
                {/* Hero */}
                <div className="text-center space-y-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium border border-indigo-100 mx-auto">
                        <Sparkles size={14} />
                        <span>Nueva Arquitectura V82</span>
                    </motion.div>
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
                        Bienvenido
                    </h1>
                    <p className="text-zinc-500">
                        Tu espacio de trabajo, reimaginado.
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-100">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <Info size={16} /> {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Correo electrónico</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2.5 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="nombre@ejemplo.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Contraseña</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2.5 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-zinc-900 text-white rounded-lg font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? "Crear cuenta" : "Iniciar Sesión")}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-zinc-400">O continúa con</span></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Google
                    </button>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-zinc-500">{isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}</span>
                        <button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
                            {isSignUp ? "Inicia sesión" : "Regístrate"}
                        </button>
                    </div>

                    {/* Mock Mode Note */}
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                        <p className="font-bold mb-1">🔧 Modo de Prueba (Mock)</p>
                        <p>Si tienes problemas con la API, usa estas credenciales para probar la app localmente:</p>
                        <div className="mt-2 font-mono bg-yellow-100 p-2 rounded">
                            <p>Email: <strong>demo@ejemplo.com</strong></p>
                            <p>Pass: <strong>demo</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
