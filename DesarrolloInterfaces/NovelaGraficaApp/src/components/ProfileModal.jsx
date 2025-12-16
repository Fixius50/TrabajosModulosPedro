import { motion } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function ProfileModal({ isOpen, onClose }) {
    const { points, activeTheme, setActive, purchases, reset } = useUserProgress();
    const navigate = useNavigate();

    // Purchased themes plus default
    const themes = ['default', ...new Set(purchases.themes || [])].map(id => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        color: id === 'default' ? '#8b5cf6' : (id === 'sepia' ? '#d97706' : '#22c55e') // Mock colors
    }));

    // Theme Styles
    const getModalStyles = () => {
        switch (activeTheme) {
            case 'comic':
                return {
                    overlay: 'bg-white/80 backdrop-blur-sm',
                    container: 'bg-white border-4 border-black shadow-[8px_8px_0px_black]',
                    text: 'text-black',
                    header: 'bg-yellow-400 border-b-4 border-black text-black',
                    pill: 'border-2 border-black hover:bg-black hover:text-white',
                    activePill: 'bg-black text-white border-black',
                    logout: 'bg-red-500 text-white border-4 border-black font-black hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_black]'
                };
            case 'manga':
                return {
                    overlay: 'bg-white/90 backdrop-blur-sm pixelated',
                    container: 'bg-white border-2 border-black shadow-none rounded-none',
                    text: 'text-black',
                    header: 'bg-black text-white border-b-2 border-black',
                    pill: 'border border-black hover:bg-gray-200',
                    activePill: 'bg-black text-white',
                    logout: 'bg-white text-black border border-black hover:bg-black hover:text-white'
                };
            case 'sepia':
                return {
                    overlay: 'bg-[#f5e6d3]/80 backdrop-blur-sm',
                    container: 'bg-[#f5e6d3] border border-[#d4c4a8] shadow-xl',
                    text: 'text-[#4a3b2a]',
                    header: 'bg-[#e3d0b3] border-b border-[#d4c4a8]',
                    pill: 'border border-[#d4c4a8] hover:bg-[#d4c4a8]',
                    activePill: 'bg-[#4a3b2a] text-[#f5e6d3]',
                    logout: 'bg-[#d4c4a8] text-[#4a3b2a] hover:bg-[#4a3b2a] hover:text-[#f5e6d3]'
                };
            case 'terminal':
                return {
                    overlay: 'bg-black/90 backdrop-blur-md',
                    container: 'bg-black border border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
                    text: 'text-green-500 font-mono',
                    header: 'bg-black border-b border-green-500',
                    pill: 'border border-green-500 hover:bg-green-500/20',
                    activePill: 'bg-green-500 text-black',
                    logout: 'bg-red-900/50 text-red-500 border border-red-500 hover:bg-red-500 hover:text-white'
                };
            default: // Default / Dark
                return {
                    overlay: 'bg-black/80 backdrop-blur-md',
                    container: 'bg-slate-900 border border-slate-700 shadow-2xl',
                    text: 'text-white',
                    header: 'bg-slate-950 border-b border-slate-800',
                    pill: 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500',
                    activePill: 'bg-yellow-400 text-black border-yellow-400',
                    logout: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white'
                };
        }
    };

    const styles = getModalStyles();

    if (!isOpen) return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-colors duration-500 ${styles.overlay}`}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-full max-w-md overflow-hidden flex flex-col transition-all duration-300 ${styles.container}`}
            >
                <div className={`p-6 flex justify-between items-center ${styles.header}`}>
                    <h2 className="text-xl font-bold tracking-widest uppercase">Perfil de Usuario</h2>
                    <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-colors font-bold">✕</button>
                </div>

                <div className={`p-6 space-y-6 ${styles.text}`}>
                    {/* User Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-current bg-[url('/assets/portadas/Batman.png')] bg-cover"></div>
                        <div>
                            <h3 className="font-bold text-lg">Jugador</h3>
                            <div className={`font-bold text-sm flex items-center gap-2 ${activeTheme === 'terminal' ? 'text-green-400' : 'text-yellow-500'}`}>
                                💎 {points} Puntos
                            </div>
                        </div>
                    </div>

                    {/* Theme Selector */}
                    <div>
                        <label className="block text-xs font-bold opacity-60 uppercase mb-3">Tema de la App</label>
                        <div className="flex gap-3 flex-wrap">
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setActive('theme', theme.id)}
                                    className={`px-4 py-2 rounded-lg border transition-all text-sm font-bold ${activeTheme === theme.id
                                        ? styles.activePill
                                        : styles.pill}`}
                                >
                                    {theme.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-current/10 space-y-3">
                        <button
                            onClick={handleLogout}
                            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${styles.logout}`}
                        >
                            <span>🚪</span> Cerrar Sesión
                        </button>

                        <div className="text-center">
                            <span className="text-xs opacity-40">ID: {supabase?.auth?.getUser()?.id || 'Invitado'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
