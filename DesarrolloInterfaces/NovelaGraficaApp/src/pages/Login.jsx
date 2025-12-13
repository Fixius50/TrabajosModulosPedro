import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'register') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                // Auto login happens on some configurations, but usually requires email confirmation
                // For this demo, we can assume auto-confirm is off or handle it.
                // However, Supabase often returns a session immediately if email confirm is disabled.

                // Let's check if we got a session, if not tell them to check email
                alert('Registro exitoso. Si la confirmación de email está activa, por favor verifica tu correo.');
                setMode('login'); // Switch to login after register
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
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
                        ACCESO
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
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.75rem',
                            background: loading ? '#4b5563' : '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '0.5rem',
                            transition: 'background 0.3s'
                        }}
                    >
                        {loading ? 'Procesando...' : (mode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA')}
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
                    <span style={{ padding: '0 0.5rem' }}>o cónectate con</span>
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
                        gap: '0.5rem'
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

                <p style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.75rem'
                }}>
                    Protected by reCAPTCHA and Subject to the Privacy Policy and Terms of Service.
                </p>
            </motion.div>
        </div>
    );
}
