
import { useState, useEffect } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useStealth } from '../../context/StealthContext';
import { useAuth } from '../../context/AuthContext';
import { profileService, UserProfile } from '../../services/profileService';

import { Camera, Edit2, Save, X } from 'lucide-react';

export default function AdventurerLicense() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isStealth, toggleStealth } = useStealth();
    const { user, signOut } = useAuth();

    // State for Profile Data
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        full_name: '',
        avatar_url: ''
    });

    useEffect(() => {
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // First try Supabase profile
            const supaProfile = await profileService.getProfile(user.id);
            if (supaProfile) {
                setProfile(supaProfile);
                setEditForm({
                    username: supaProfile.username || '',
                    full_name: supaProfile.full_name || '',
                    avatar_url: supaProfile.avatar_url || ''
                });
            } else {
                setEditForm({
                    username: user.email?.split('@')[0] || 'Aventurero',
                    full_name: '',
                    avatar_url: ''
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            const updated = await profileService.updateProfile(user.id, {
                username: editForm.username,
                full_name: editForm.full_name,
                avatar_url: editForm.avatar_url
            });

            if (updated) {
                setProfile(updated);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating profile", error);
            alert("No se pudo actualizar el perfil.");
        }
    };

    const logout = async () => {
        await signOut();
        navigate('/');
    };

    // Calculate Rank based on points
    const getRank = (points: number) => {
        if (points >= 10000) return 'Platino I';
        if (points >= 5000) return 'Oro I';
        if (points >= 2500) return 'Oro II';
        if (points >= 1000) return 'Plata I';
        if (points >= 500) return 'Plata II';
        return 'Bronce I';
    };

    // Calculate Level based on points (1000 points per level for simplicity)
    const getLevel = (points: number) => Math.floor(points / 1000) + 1;
    const getProgress = (points: number) => (points % 1000) / 10; // Percentage

    const guildId = profile?.username ? `MER-${profile.username.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}` : 'PENDING';
    const points = profile?.points || 0;
    const rank = getRank(points);
    const level = getLevel(points);

    if (loading) return <div className="min-h-screen bg-[#0c0b06] flex items-center justify-center text-primary">Cargando Licencia...</div>;

    return (
        <div className="font-display text-primary/90 bg-[#0c0b06] min-h-screen flex justify-center items-center overflow-hidden relative selection:bg-amber-500/30">
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f4c025' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            <div className="w-full min-h-screen relative bg-[#0c0b06]/90 flex flex-col backdrop-blur-md pb-24">

                {/* Back Button */}
                <div className="p-4">
                    <button onClick={() => navigate('/grimoire')} className="flex items-center gap-2 text-stone-400 hover:text-primary transition-colors">
                        <span className="material-icons">arrow_back</span>
                        <span>Volver al Grimorio</span>
                    </button>
                </div>


                {/* ID Card / License Container */}
                <div className="m-6 mt-4 mb-0 p-1 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/5 to-transparent relative">
                    <div className="bg-[#110f0a] rounded-xl p-6 relative overflow-hidden border border-primary/10">
                        {/* Holofoil Effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none"></div>

                        {/* Dragony Watermark */}
                        <div className="absolute -right-10 -top-10 text-primary/5 rotate-12 pointer-events-none">
                            <span className="material-symbols-outlined text-[9.375rem]">verified_user</span>
                        </div>

                        {/* Edit Toggle */}
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="absolute top-4 right-4 text-stone-500 hover:text-primary z-20"
                        >
                            {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                        </button>

                        {/* Profile Header */}
                        <div className="flex items-center gap-5 relative z-10 mb-6">
                            <div className="w-24 h-24 rounded-full border-2 border-primary/40 p-1 bg-[#16140d] relative shadow-[0_0_1.25rem_rgba(244,192,37,0.15)] group">
                                <img
                                    src={isEditing ? (editForm.avatar_url || "https://ui-avatars.com/api/?name=Adventurer&background=1c1917&color=f4c025") : (profile?.avatar_url || "https://ui-avatars.com/api/?name=Adventurer&background=1c1917&color=f4c025")}
                                    alt="Avatar del Aventurero"
                                    className="w-full h-full rounded-full object-cover filter sepia-[0.2]"
                                />
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer">
                                        <Camera className="text-white opacity-80" size={24} />
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#221e10] rounded-full border border-primary/30 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary">{level}</span>
                                </div>
                            </div>

                            <div className="flex flex-col flex-1">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={editForm.full_name}
                                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                            placeholder="Nombre Completo"
                                            className="bg-black/30 border border-primary/20 rounded px-2 py-1 text-primary w-full text-lg font-bold placeholder:text-stone-600 focus:outline-none focus:border-primary/50"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                            placeholder="@usuario"
                                            className="bg-black/30 border border-primary/20 rounded px-2 py-1 text-stone-400 w-full text-sm font-medium placeholder:text-stone-600 focus:outline-none focus:border-primary/50"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.avatar_url}
                                            onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                                            placeholder="URL de Avatar (https://...)"
                                            className="bg-black/30 border border-primary/20 rounded px-2 py-1 text-stone-500 w-full text-xs placeholder:text-stone-600 focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-primary tracking-tight">{profile?.full_name || 'Aventurero Anónimo'}</h2>
                                        <span className="text-sm text-stone-400 font-medium">@{profile?.username || 'usuario'}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <button
                                onClick={handleSaveProfile}
                                className="w-full mb-6 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-lg py-2 flex items-center justify-center gap-2 font-bold transition-all"
                            >
                                <Save size={18} />
                                Guardar Cambios
                            </button>
                        )}


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
                                    <span className="text-xs uppercase tracking-widest text-primary/60 font-bold">Progreso Nivel {level}</span>
                                    <span className="text-xs text-primary font-bold">{points % 1000} / 1000 XP</span>
                                </div>
                                <div className="w-full h-3 bg-black/40 rounded-full border border-primary/20 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary/60 to-primary shadow-[0_0_0.625rem_rgba(244,192,37,0.5)]"
                                        style={{ width: `${getProgress(points)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#16140d] p-4 rounded-lg border border-primary/10 flex flex-col items-center gap-1">
                                    <span className="text-2xl font-bold text-primary">{Math.floor(points / 100)}</span>
                                    <span className="text-[0.625rem] uppercase tracking-widest text-stone-500">Misiones Totales</span>
                                </div>
                                <div className="bg-[#16140d] p-4 rounded-lg border border-primary/10 flex flex-col items-center gap-1">
                                    <span className="text-2xl font-bold text-stone-300">{points}</span>
                                    <span className="text-[0.625rem] uppercase tracking-widest text-stone-500">Puntos de Gremio</span>
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
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                item.action();
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${item.active ? 'bg-primary/10 border-primary/30' : 'bg-[#16140d] hover:bg-primary/5 border-transparent hover:border-primary/10'}`}
                        >
                            <span className={`material-symbols-outlined transition-colors ${item.active ? 'text-primary' : 'text-primary/60 group-hover:text-primary'}`}>{item.icon}</span>
                            <span className={`flex-1 transition-colors ${item.active ? 'text-primary font-bold' : 'text-stone-300 group-hover:text-primary'}`}>{item.label}</span>
                            <span className="material-symbols-outlined text-stone-600 text-sm">arrow_forward_ios</span>
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            logout();
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#16140d] hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-left group mt-6"
                    >
                        <span className="material-symbols-outlined text-red-400 group-hover:text-red-300 transition-colors">logout</span>
                        <span className="text-red-400 group-hover:text-red-300 transition-colors flex-1">Cerrar Sesión</span>
                    </button>
                </div>

                {/* Bottom Nav Spacer */}
                <div className="h-20"></div>
            </div>
        </div>
    );
}
