import { useState, useEffect } from 'react';
import { useUserProgress } from '../stores/userProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { getAssetUrl } from '../utils/assetUtils';

export default function ProfileView() {
    const {
        profile,
        points,
        stats,
        activeTheme,
        getThemeStyles: getRemoteStyles,
        setActive,
        activeFont,
        fontSize,
        updateProfile
    } = useUserProgress();

    // Local state for UI simulation of some settings and editing
    const [localFontSize, setLocalFontSize] = useState(fontSize || 100);
    const [bgOpacity, setBgOpacity] = useState(90);

    // Editing States
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [emailName, setEmailName] = useState('Usuario');

    // Initial load - Get email if name is empty
    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                const nameFromEmail = user.email.split('@')[0];
                setEmailName(nameFromEmail);
            }
        }
        loadUser();
    }, []);

    // Derived values
    const displayName = profile.name || emailName;
    const bannerUrl = getAssetUrl(profile.banner) || getAssetUrl('/assets/portadas/library_bg.jpg');
    // Ensure avatarUrl is valid, use a default if empty
    const avatarUrl = profile.avatar && profile.avatar.length > 10 ? profile.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

    const handleSaveName = () => {
        if (newName.trim()) {
            updateProfile({ name: newName });
        }
        setIsEditing(false);
    };

    const handleAvatarFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfile({ avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
        setShowAvatarModal(false);
    };

    const handleBannerSelect = (url) => {
        updateProfile({ banner: url });
        setShowBannerModal(false);
    };

    const getThemeStyles = () => {
        const remote = getRemoteStyles(activeTheme);
        if (remote) return remote;
        return {
            bg: { background: '#0a0a12', color: 'white' },
            accent: '#8b5cf6',
            border: '1px solid rgba(255,255,255,0.1)',
            cardBg: 'rgba(255,255,255,0.05)'
        };
    };

    const theme = getThemeStyles();

    return (
        <div style={{ ...theme.bg, minHeight: '100vh', paddingBottom: '120px' }}>

            {/* HERO BANNER */}
            <div className="relative h-64 overflow-hidden group">
                <div
                    className="absolute inset-0 bg-cover bg-center blur-sm opacity-50 transition-all duration-700"
                    style={{ backgroundImage: `url('${bannerUrl}')` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${['manga', 'comic'].includes(activeTheme) ? 'from-white via-white/50' : 'from-black via-black/50'} to-transparent`} />

                {/* Edit Banner Button (Visible on Hover) */}
                <button
                    onClick={() => setShowBannerModal(true)}
                    className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition border border-white/20 text-sm font-bold"
                >
                    🖼️ Cambiar Portada
                </button>

                <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6 max-w-5xl mx-auto w-full">
                    {/* Avatar */}
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800 shadow-2xl relative" style={{ border: `4px solid ${theme.accent}` }}>
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <button
                            onClick={() => setShowAvatarModal(true)}
                            className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-500 text-white hover:scale-110 transition z-10"
                        >
                            ✏️
                        </button>
                    </div>

                    {/* Name & Info */}
                    <div className="mb-4 drop-shadow-md flex-1" style={{ color: ['manga', 'comic'].includes(activeTheme) ? 'black' : 'white' }}>
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    autoFocus
                                    className="bg-black/50 border border-white/30 text-white px-3 py-1 rounded text-3xl font-black w-full max-w-md outline-none"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder={displayName}
                                />
                                <button onClick={handleSaveName} className="bg-green-600 px-3 py-1 rounded text-white text-sm font-bold">OK</button>
                                <button onClick={() => setIsEditing(false)} className="bg-red-600 px-3 py-1 rounded text-white text-sm font-bold">X</button>
                            </div>
                        ) : (
                            <h1 onClick={() => { setNewName(displayName); setIsEditing(true); }} className="text-4xl font-black cursor-pointer hover:opacity-80 flex items-center gap-2">
                                {displayName} <span className="opacity-30 text-xl font-normal">✏️</span>
                            </h1>
                        )}
                        <p className="opacity-90 font-bold text-lg">
                            Lector Nvl. {Math.floor(stats.totalNodesVisited / 50) + 1} • {stats.totalNodesVisited} Lecturas
                        </p>
                    </div>

                    <div className="hidden md:flex bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 items-center gap-4" style={{ color: ['manga', 'comic'].includes(activeTheme) ? 'black' : 'white' }}>
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-2xl text-yellow-400">⭐</div>
                        <div>
                            <div className="text-xs uppercase font-bold opacity-80">Puntos</div>
                            <div className="text-2xl font-black">{points.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-8">
                {/* CONTENT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* LEFT COLUMN: ACTIVITY */}
                    <div className="space-y-6">
                        <Section title="Estadísticas" icon="📊" theme={theme}>
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard label="Capítulos Leídos" value={stats.totalNodesVisited} theme={theme} />
                                <StatCard label="Decisiones" value={stats.totalChoicesMade} theme={theme} />
                                {/* Placeholders */}
                                <StatCard label="Finales" value="0" theme={theme} />
                                <StatCard label="Coleccionables" value="0" theme={theme} />
                            </div>
                        </Section>
                    </div>

                    {/* RIGHT COLUMN: PERSONALIZATION (Moved from Settings) */}
                    <div className="space-y-6">
                        <Section title="Personalización Visual" icon="🎨" theme={theme}>

                            <div className="space-y-6">
                                {/* THEME SELECTOR */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold opacity-70">Tema Visual</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['modern', 'comic', 'manga'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setActive('theme', t)}
                                                className={`p-2 rounded border text-xs font-bold capitalize transition ${activeTheme === t ? 'ring-2 ring-offset-2 ring-offset-black' : 'opacity-50 hover:opacity-100'}`}
                                                style={{
                                                    borderColor: theme.accent,
                                                    background: activeTheme === t ? theme.accent : 'transparent',
                                                    color: activeTheme === t ? 'white' : 'inherit'
                                                }}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* FONT SELECTOR */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold opacity-70">Tipografía</label>
                                    <select
                                        value={activeFont}
                                        onChange={(e) => setActive('font', e.target.value)}
                                        className="w-full bg-black/20 border rounded p-2 text-sm outline-none focus:border-current"
                                        style={{ borderColor: theme.border, color: 'inherit' }}
                                    >
                                        <option value="Inter">Moderna (Inter)</option>
                                        <option value="Merriweather">Clásica (Merriweather)</option>
                                        <option value="Bangers">Cómic (Bangers)</option>
                                    </select>
                                </div>

                                {/* SIZE SLIDERS */}
                                <div className="space-y-4 pt-2 border-t" style={{ borderColor: theme.border }}>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span className="opacity-70">Tamaño Texto</span>
                                            <span>{localFontSize}%</span>
                                        </div>
                                        <input
                                            type="range" min="80" max="150"
                                            value={localFontSize}
                                            onChange={(e) => {
                                                setLocalFontSize(e.target.value);
                                                setActive('size', e.target.value);
                                            }}
                                            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                                            style={{ accentColor: theme.accent, background: 'rgba(128,128,128,0.3)' }}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span className="opacity-70">Opacidad Caja</span>
                                            <span>{bgOpacity}%</span>
                                        </div>
                                        <input
                                            type="range" min="50" max="100"
                                            value={bgOpacity}
                                            onChange={(e) => setBgOpacity(e.target.value)}
                                            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                                            style={{ accentColor: theme.accent, background: 'rgba(128,128,128,0.3)' }}
                                        />
                                    </div>
                                </div>

                            </div>

                        </Section>
                    </div>

                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showAvatarModal && (
                    <Modal onClose={() => setShowAvatarModal(false)} theme={theme} title="Cambiar Avatar">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 border-dashed border-2 p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition mb-4 relative overflow-hidden" style={{ borderColor: theme.accent }}>
                                <input type="file" accept="image/*" onChange={handleAvatarFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <span className="text-4xl mb-2">📂</span>
                                <span className="font-bold">Subir desde PC</span>
                            </div>
                            <h3 className="col-span-2 font-bold opacity-50 text-sm uppercase">Predefinidos</h3>
                            {['Felix', 'Aneka', 'Zool', 'Milo'].map(seed => (
                                <img
                                    key={seed}
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                                    className="w-16 h-16 rounded-full border-2 border-transparent hover:border-purple-500 cursor-pointer bg-gray-800"
                                    onClick={() => { updateProfile({ avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` }); setShowAvatarModal(false); }}
                                    alt={seed}
                                />
                            ))}
                        </div>
                    </Modal>
                )}

                {showBannerModal && (
                    <Modal onClose={() => setShowBannerModal(false)} theme={theme} title="Cambiar Portada">
                        <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                            <h3 className="col-span-2 font-bold opacity-50 text-sm uppercase">Historias Leídas</h3>
                            <button
                                onClick={() => handleBannerSelect('/assets/portadas/portada_demo.jpg')}
                                className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition group"
                            >
                                <img src="/assets/portadas/portada_demo.jpg" className="w-full h-full object-cover" alt="Banner 1" />
                                <span className="absolute bottom-0 left-0 bg-black/70 text-white text-xs p-1 w-full text-center">El Despertar</span>
                            </button>
                            <button
                                onClick={() => handleBannerSelect('/assets/portadas/library_bg.jpg')}
                                className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition group"
                            >
                                <img src="/assets/portadas/library_bg.jpg" className="w-full h-full object-cover" alt="Banner 2" />
                                <span className="absolute bottom-0 left-0 bg-black/70 text-white text-xs p-1 w-full text-center">Biblioteca</span>
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

function Section({ title, icon, children, theme }) {
    // Safe check
    const bg = theme?.cardBg || 'rgba(255,255,255,0.05)';
    const border = theme?.border || '1px solid rgba(255,255,255,0.1)';
    const shadow = theme?.shadow || 'none';
    const accent = theme?.accent || 'white';

    return (
        <div className="p-6 rounded-xl h-full" style={{ background: bg, border: border, boxShadow: shadow }}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <span className="text-2xl" style={{ color: accent }}>{icon}</span>
                <h2 className="text-lg font-bold uppercase tracking-wider">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function StatCard({ label, value, theme }) {
    return (
        <div className="p-4 rounded-lg bg-black/20 text-center">
            <div className="text-2xl font-black mb-1" style={{ color: theme?.accent }}>{value}</div>
            <div className="text-xs font-bold opacity-50 uppercase">{label}</div>
        </div>
    );
}

function Modal({ onClose, children, theme, title }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl"
                style={{ border: theme.border, background: theme.cardBg }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: theme.border }}>
                    <h3 className="font-bold text-lg" style={{ color: theme.accent }}>{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold">✕</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}

