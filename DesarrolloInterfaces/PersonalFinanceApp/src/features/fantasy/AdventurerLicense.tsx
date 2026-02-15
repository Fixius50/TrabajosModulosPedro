import { useState, useEffect } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storageService, type UserProfile } from '../../services/storageService';
import { useStealth } from '../../context/StealthContext';
import { useAuth } from '../../context/AuthContext';

export default function AdventurerLicense() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isStealth, toggleStealth, formatAmount } = useStealth();
    const { signOut } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        setProfile(storageService.getUserProfile());
    }, []);

    const logout = async () => {
        await signOut();
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        if (!confirm('¿ESTÁS SEGURO? Esta acción es irreversible.\n\nSe eliminará tu cuenta y todos los datos locales asociados.\n\nPulsa Aceptar para confirmar.')) {
            return;
        }

        try {
            // 1. Delete Local Data
            storageService.deleteAccount();

            // 2. Sign Out
            await signOut();

            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Error al eliminar la cuenta.');
        }
    };

    const getRank = (xp: number) => {
        if (xp >= 10000) return 'Platino I';
        if (xp >= 5000) return 'Oro I';
        if (xp >= 2500) return 'Oro II';
        if (xp >= 1000) return 'Plata I';
        if (xp >= 500) return 'Plata II';
        return 'Bronce I';
    };

    const guildId = profile?.name ? `MER-${profile.name.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}` : 'PENDING';
    const rank = profile ? getRank(profile.stats.wealthXP) : '...';

    return (
        <div className="font-display text-primary/90 bg-[#0c0b06] min-h-screen flex justify-center items-center overflow-hidden relative selection:bg-amber-500/30">
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f4c025' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            <div className="w-full min-h-screen relative bg-[#0c0b06]/90 flex flex-col backdrop-blur-md pb-24">



                {/* ID Card / License Container */}
                <div className="m-6 mt-16 mb-0 p-1 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/5 to-transparent relative">
                    <div className="bg-[#110f0a] rounded-xl p-6 relative overflow-hidden border border-primary/10">
                        {/* Holofoil Effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none"></div>

                        {/* Dragony Watermark */}
                        <div className="absolute -right-10 -top-10 text-primary/5 rotate-12 pointer-events-none">
                            <span className="material-symbols-outlined text-[9.375rem]">verified_user</span>
                        </div>

                        {/* Profile Header */}
                        <div className="flex items-center gap-5 relative z-10 mb-6">
                            <div className="w-24 h-24 rounded-full border-2 border-primary/40 p-1 bg-[#16140d] relative shadow-[0_0_1.25rem_rgba(244,192,37,0.15)]">
                                <img
                                    src={profile?.avatar || "https://ui-avatars.com/api/?name=Adventurer&background=1c1917&color=f4c025"}
                                    alt="Avatar del Aventurero"
                                    className="w-full h-full rounded-full object-cover filter sepia-[0.2]"
                                />
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#221e10] rounded-full border border-primary/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-sm">verified</span>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <h2 className="text-2xl font-bold text-primary tracking-tight">{profile?.name || 'Aventurero'}</h2>
                                <span className="text-sm text-stone-400 font-medium">{profile?.title || 'Novato'}</span>
                            </div>
                        </div>

                        {/* ID Details */}
                        <div className="space-y-4 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[0.625rem] uppercase tracking-widest text-primary/40 font-bold block mb-1">ID de Gremio</span>
                                    <span className="font-mono text-primary/80 text-sm">{guildId}</span>
                                </div>
                                <div>
                                    <span className="text-[0.625rem] uppercase tracking-widest text-primary/40 font-bold block mb-1">Rango</span>
                                    <span className="font-mono text-primary/80 text-sm">{rank}</span>
                                </div>
                            </div>

                            {/* XP Bar */}
                            <div className="pt-2">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs uppercase tracking-widest text-primary/60 font-bold">XP de Riqueza</span>
                                    <span className="text-xs text-primary font-bold">{profile?.stats.wealthXP} / {profile?.stats.maxXP}</span>
                                </div>
                                <div className="w-full h-3 bg-black/40 rounded-full border border-primary/20 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary/60 to-primary shadow-[0_0_0.625rem_rgba(244,192,37,0.5)]"
                                        style={{ width: `${(profile?.stats.wealthXP || 0) / (profile?.stats.maxXP || 1) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#16140d] p-4 rounded-lg border border-primary/10 flex flex-col items-center gap-1">
                                    <span className="text-2xl font-bold text-primary">{formatAmount(profile?.stats.goldEarned || 0, '')}</span>
                                    <span className="text-[0.625rem] uppercase tracking-widest text-stone-500">Oro Ganado</span>
                                </div>
                                <div className="bg-[#16140d] p-4 rounded-lg border border-primary/10 flex flex-col items-center gap-1">
                                    <span className="text-2xl font-bold text-stone-300">{profile?.stats.questsCompleted || 0}</span>
                                    <span className="text-[0.625rem] uppercase tracking-widest text-stone-500">Misiones Completas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Menu */}
                <div className="flex-1 p-6 space-y-2">
                    <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-4 pl-2">Configuración del Gremio</h3>

                    {[
                        {
                            icon: isStealth ? 'visibility' : 'visibility_off',
                            label: isStealth ? t('stealth_off') : t('stealth_on'),
                            action: toggleStealth,
                            active: isStealth
                        }
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={item.action}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${item.active ? 'bg-primary/10 border-primary/30' : 'bg-[#16140d] hover:bg-primary/5 border-transparent hover:border-primary/10'}`}
                        >
                            <span className={`material-symbols-outlined transition-colors ${item.active ? 'text-primary' : 'text-primary/60 group-hover:text-primary'}`}>{item.icon}</span>
                            <span className={`flex-1 transition-colors ${item.active ? 'text-primary font-bold' : 'text-stone-300 group-hover:text-primary'}`}>{item.label}</span>
                            <span className="material-symbols-outlined text-stone-600 text-sm">arrow_forward_ios</span>
                        </button>
                    ))}

                    {/* Currency Selector */}
                    <div className="relative w-full group">
                        <select
                            value={profile?.currency || 'EUR'}
                            onChange={(e) => {
                                if (profile) {
                                    const newProfile = { ...profile, currency: e.target.value };
                                    setProfile(newProfile);
                                    storageService.updateUserProfile(newProfile);
                                }
                            }}
                            className="w-full appearance-none bg-[#16140d] hover:bg-primary/5 border border-transparent hover:border-primary/10 text-stone-300 hover:text-primary p-4 rounded-xl outline-none cursor-pointer flex items-center gap-4 transition-all pl-12 font-bold"
                        >
                            <option value="EUR">Moneda: Taros (EUR €)</option>
                            <option value="USD">Moneda: Áureos (USD $)</option>
                            <option value="GBP">Moneda: Libras (GBP £)</option>
                        </select>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 group-hover:text-primary pointer-events-none transition-colors">payments</span>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-600 text-sm pointer-events-none">expand_more</span>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#16140d] hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-left group mt-6"
                    >
                        <span className="material-symbols-outlined text-red-400 group-hover:text-red-300 transition-colors">logout</span>
                        <span className="text-red-400 group-hover:text-red-300 transition-colors flex-1">Abandonar Misión</span>
                    </button>

                    {/* Data Management Section */}
                    <div className="px-6 pb-6 pt-6 space-y-2">
                        <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-2 pl-2">Gestión de Datos</h3>

                        <button
                            onClick={() => {
                                const data = storageService.exportData();
                                const blob = new Blob([data], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `grimoire_backup_${new Date().toISOString().split('T')[0]}.json`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#16140d] hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all text-left group"
                        >
                            <span className="material-symbols-outlined text-stone-400 group-hover:text-primary transition-colors">download</span>
                            <span className="text-stone-300 group-hover:text-primary transition-colors flex-1">Exportar Grimorio (JSON)</span>
                        </button>

                        {/* Danger Zone */}
                        <div className="pt-4 space-y-2">
                            <h3 className="text-xs uppercase tracking-widest text-red-500 font-bold mb-2 pl-2">Zona de Peligro</h3>
                            <button
                                onClick={handleDeleteAccount}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 hover:border-red-500/50 transition-all text-left group"
                            >
                                <span className="material-symbols-outlined text-red-500 group-hover:text-red-400 transition-colors">delete_forever</span>
                                <span className="text-red-500 group-hover:text-red-400 transition-colors flex-1 font-bold">Eliminar Cuenta</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Nav Spacer */}
                <div className="h-20"></div>
            </div>
        </div>
    );
}
