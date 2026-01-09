import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        let mounted = true; // Track mount status

        const emailToUse = username.includes('@')
            ? username
            : `${username.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

        console.log('Attempting Auth with:', emailToUse);

        try {
            if (mode === 'register') {
                const { data, error } = await supabase.auth.signUp({
                    email: emailToUse,
                    password,
                    options: { data: { username: username } }
                });

                if (error) throw error;

                alert('¡Registro exitoso! Por favor verifica tu correo. (Si no llega, usa Google o el script de fix)');
                if (mounted) setMode('login');
            } else {
                // Login with Timeout
                const loginPromise = supabase.auth.signInWithPassword({
                    email: emailToUse,
                    password,
                });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Login Request Timeout (10s)')), 10000)
                );

                const { error } = await Promise.race([loginPromise, timeoutPromise]);

                if (error) throw error;

                // Force hard navigation just in case
                navigate('/', { replace: true });
                return; // Return early so finally doesn't toggle state on unmounted component
            }
        } catch (error) {
            console.error("Login Error:", error);
            if (mounted) {
                setError(error.message === 'Invalid login credentials'
                    ? 'Credenciales incorrectas'
                    : error.message);
            }
        } finally {
            if (mounted) setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background Effects */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
                pointerEvents: 'none'
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'rgba(20, 20, 30, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    width: '90%',
                    maxWidth: '400px',
                    boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
                    zIndex: 1
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{
                        color: '#fff',
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '2rem',
                        marginBottom: '0.5rem',
                        textShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                    }}>
                        NOVELA VERSE
                    </h1>
                    <div style={{ height: '2px', width: '50px', background: '#8b5cf6', margin: '0 auto' }} />
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    marginBottom: '2rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '0.5rem',
                    padding: '0.25rem'
                }}>
                    <button
                        onClick={() => setMode('login')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: 'none',
                            background: mode === 'login' ? '#8b5cf6' : 'transparent',
                            color: mode === 'login' ? 'white' : 'rgba(255,255,255,0.6)',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        LOGIN
                    </button>
                    <button
                        onClick={() => setMode('register')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: 'none',
                            background: mode === 'register' ? '#8b5cf6' : 'transparent',
                            color: mode === 'register' ? 'white' : 'rgba(255,255,255,0.6)',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        REGISTRO
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid #ef4444',
                            borderRadius: '0.5rem',
                            color: '#fca5a5',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            {mode === 'login' ? 'Usuario o Email' : 'Nombre de Usuario'}
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: PlayerOne"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                outline: 'none',
                                boxSizing: 'border-box',
                                fontFamily: 'monospace'
                            }}
                        />
                        {/* DEBUG VISUAL */}
                        {username && !username.includes('@') && (
                            <div className="text-xs text-purple-400 mt-1 pl-1 opacity-70">
                                Se usará: {username.toLowerCase().replace(/\s+/g, '')}@gmail.com
                            </div>
                        )}
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                    >
                        {loading ? 'Procesando...' : (mode === 'login' ? 'ENTRAR' : 'CREAR CUENTA')}
                    </button>
                </form>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '1.5rem 0',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.875rem'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ padding: '0 0.5rem' }}>o entra con Google</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                {/* Google Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'white',
                        color: 'black',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'transform 0.1s active'
                    }}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 44.029 C -12.984 44.029 -11.424 44.639 -10.174 45.829 L -6.744 42.409 C -8.804 40.489 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 44.029 -14.754 44.029 Z" />
                        </g>
                    </svg>
                    Google
                </button>
            </motion.div>
        </div>
    );
}
