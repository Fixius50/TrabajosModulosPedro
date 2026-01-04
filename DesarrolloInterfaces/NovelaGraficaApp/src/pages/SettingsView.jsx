import { useState } from 'react';
import { useUserProgress } from '../stores/userProgress';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function SettingsView() {
    // We only need profile and update function now.
    // Visual settings moved to ProfileView.
    const { profile, updateProfile, activeTheme, getThemeStyles: getRemoteStyles } = useUserProgress();
    const navigate = useNavigate();

    const [username, setUsername] = useState(profile.name || '');
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar || '');
    const [isSaving, setIsSaving] = useState(false);

    const getThemeStyles = () => {
        // A. REMOTE (Database)
        const remote = getRemoteStyles(activeTheme);
        if (remote) return remote;
        // Fallback or specific hardcoded themes if necessary for layout
        return {
            bg: { background: '#0a0a12', color: 'white' },
            accent: '#8b5cf6',
            border: '1px solid rgba(255,255,255,0.1)',
            cardBg: 'rgba(255,255,255,0.05)'
        };
    };

    const theme = getThemeStyles();

    const handleUpdateProfile = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ name: username, avatar: avatarUrl });
            alert('Perfil actualizado correctamente');
        } catch (error) {
            console.error(error);
            alert('Error al actualizar perfil');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) navigate('/login');
    };

    const handleDeleteAccount = () => {
        const confirm = window.confirm("¿Estás seguro? Esta acción borrará TODO tu progreso y compras. No se puede deshacer.");
        if (confirm) {
            alert("Contacta con soporte para borrado definitivo (Simulación: Sesión cerrada)");
            handleLogout();
        }
    };

    return (
        <div style={{ ...theme.bg, minHeight: '100vh', padding: '2rem', paddingBottom: '120px' }}>
            <h1 className="text-4xl font-black mb-2">Cuenta</h1>
            <p className="opacity-60 mb-8">Gestiona tu identidad y seguridad.</p>

            <div className="max-w-2xl mx-auto space-y-6">

                {/* EDITAR PERFIL */}
                <Section title="Datos de Usuario" icon="👤" theme={theme}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold opacity-70 mb-2">Nombre de Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border rounded-lg p-3 outline-none focus:border-current"
                                style={{ borderColor: theme.accent, color: 'inherit' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold opacity-70 mb-2">Avatar URL</label>
                            <input
                                type="text"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-black/20 border rounded-lg p-3 outline-none focus:border-current"
                                style={{ borderColor: theme.accent, color: 'inherit' }}
                            />
                            <p className="text-xs opacity-50 mt-1">Usa una URL de imagen válida.</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={isSaving}
                                className="px-6 py-2 rounded-lg font-bold shadow-lg hover:brightness-110 active:scale-95 transition"
                                style={{ background: theme.accent, color: 'white' }}
                            >
                                {isSaving ? 'Guardando...' : '💾 Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </Section>

                {/* ZONA DE PELIGRO */}
                <Section title="Sesión y Seguridad" icon="🔒" theme={theme}>
                    <div className="space-y-4">
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 rounded-lg font-bold border hover:bg-white/5 transition flex items-center justify-center gap-2"
                            style={{ borderColor: theme.border }}
                        >
                            🚪 Cerrar Sesión
                        </button>

                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-red-500 font-bold mb-2">Zona de Peligro</h3>
                            <button
                                onClick={handleDeleteAccount}
                                className="w-full py-3 rounded-lg font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition border border-red-500/30"
                            >
                                💀 Borrar Cuenta
                            </button>
                        </div>
                    </div>
                </Section>

            </div>
        </div>
    );
}

function Section({ title, icon, children, theme }) {
    // Safe check for theme properties
    const bg = theme?.cardBg || 'rgba(255,255,255,0.05)';
    const border = theme?.border || '1px solid rgba(255,255,255,0.1)';
    const shadow = theme?.shadow || 'none';
    const accent = theme?.accent || 'white';

    return (
        <div className="p-6 rounded-xl" style={{ background: bg, border: border, boxShadow: shadow }}>
            <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl" style={{ color: accent }}>{icon}</span>
                <h2 className="text-xl font-bold">{title}</h2>
            </div>
            {children}
        </div>
    );
}
