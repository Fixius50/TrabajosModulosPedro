import { useTranslation } from 'react-i18next';
import { Clock, LogOut, Activity } from 'lucide-react';

interface SessionTimeoutModalProps {
    timeLeft: number;
    onRemainActive: () => void;
    onLogout: () => void;
}

export default function SessionTimeoutModal({ timeLeft, onRemainActive, onLogout }: SessionTimeoutModalProps) {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-[#1c1917] w-full max-w-sm rounded-xl border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.2)] p-6 relative overflow-hidden">

                {/* Background Pulse Animation */}
                <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />

                <div className="relative z-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mx-auto border-2 border-red-500/30 text-red-400">
                        <Clock size={32} className="animate-pulse" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {t('session_timeout_title', '¿Sigues ahí?')}
                        </h3>
                        <p className="text-stone-400 text-sm">
                            {t('session_timeout_message', 'Tu sesión se cerrará por inactividad en:')}
                        </p>
                        <div className="text-4xl font-mono font-bold text-red-500 mt-2 tabular-nums">
                            00:{timeLeft.toString().padStart(2, '0')}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut size={16} />
                            {t('logout', 'Cerrar Sesión')}
                        </button>
                        <button
                            onClick={onRemainActive}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                        >
                            <Activity size={16} />
                            {t('remain_active', 'Seguir Conectado')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
