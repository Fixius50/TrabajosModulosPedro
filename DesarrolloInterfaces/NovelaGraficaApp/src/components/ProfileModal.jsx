import { motion } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function ProfileModal({ isOpen, onClose }) {
    const { points, activeTheme, setActive, purchases, reset } = useUserProgress();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    // Purchased themes plus default
    const themes = ['default', ...new Set(purchases.themes || [])].map(id => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        color: id === 'default' ? '#8b5cf6' : (id === 'sepia' ? '#d97706' : '#22c55e') // Mock colors
    }));

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <h2 className="text-xl font-bold text-white tracking-widest uppercase">Perfil de Usuario</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="p-6 space-y-6">
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-yellow-400 bg-[url('/assets/portadas/Batman.png')] bg-cover"></div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Jugador</h3>
                            <div className="text-yellow-400 font-bold text-sm flex items-center gap-2">
                                💎 {points} Puntos
                            </div>
                        </div>
                    </div>

                    {/* Theme Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Tema de la App</label>
                        <div className="flex gap-3 flex-wrap">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setActive('theme', theme.id)}
                                    className={`px-4 py-2 rounded-lg border transition-all text-sm font-bold ${activeTheme === theme.id
                                        ? 'bg-yellow-400 text-black border-yellow-400'
                                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'}`}
                                >
                                    {theme.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <span>🚪</span> Cerrar Sesión
                        </button>

                        <div className="text-center">
                            <span className="text-xs text-slate-600">ID: {supabase?.auth?.getUser()?.id || 'Invitado'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
