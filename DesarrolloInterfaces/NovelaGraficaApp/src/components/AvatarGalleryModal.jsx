import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProgress } from '../stores/userProgress';
import { supabase } from '../services/supabaseClient';

export default function AvatarGalleryModal({ isOpen, onClose }) {
    const { userId, points, purchase, isOwned, updateProfile, profile } = useUserProgress();
    const [avatars, setAvatars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null); // ID of item being processed
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAvatars();
        }
    }, [isOpen]);

    const fetchAvatars = async () => {
        setLoading(true);
        try {
            const allAvatars = [];

            // 1. Fetch Common Avatars from Storage (avatars/common/*)
            const { data: commonFiles, error: commonError } = await supabase
                .storage
                .from('avatars')
                .list('common', {
                    limit: 50,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' },
                });

            if (commonFiles) {
                // Construct Public URLs
                const commonAvatars = commonFiles.map(file => {
                    const { data } = supabase.storage.from('avatars').getPublicUrl(`common/${file.name}`);

                    // Generate deterministic price based on filename char codes
                    // range: 5 to 49 gems (to avoid 0 cost for paid feel, but keep < 50)
                    const hash = file.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const randomCost = (hash % 45) + 5;

                    return {
                        id: `common-${file.name}`,
                        name: file.name.split('.')[0].replace(/[-_]/g, ' '), // Clean filename
                        asset_value: data.publicUrl,
                        cost: randomCost,
                        type: 'avatar'
                    };
                });
                allAvatars.push(...commonAvatars);
            } else if (commonError) {
                console.warn("Could not load common avatars:", commonError);
            }

            // 2. Fetch remote Shop Items
            const { data: shopAvatars, error: shopError } = await supabase
                .from('shop_items')
                .select('*')
                .eq('type', 'avatar');

            if (shopAvatars) {
                // De-duplicate if necessary, though IDs should be different
                allAvatars.push(...shopAvatars);
            }

            // 3. Last Resort Fallback
            if (allAvatars.length === 0) {
                allAvatars.push(
                    { id: 'def1', name: 'Default Boy', asset_value: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix', cost: 0, type: 'avatar' },
                    { id: 'def2', name: 'Default Girl', asset_value: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe', cost: 0, type: 'avatar' }
                );
            }

            setAvatars(allAvatars);

        } catch (err) {
            console.error("Error fetching avatars:", err);
            setError("Error cargando galería.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (item) => {
        setProcessing(item.id);
        setError(null);

        // 1. Check Ownership
        // For avatars, if cost is 0, we treat it as always owned/free.
        const owned = item.cost === 0 || isOwned('avatars', item.asset_value);

        try {
            if (owned) {
                // EQUIP
                await updateProfile({ avatar: item.asset_value });
                setSuccessMsg(`¡Avatar equipado!`);
                setTimeout(() => {
                    setSuccessMsg('');
                    onClose();
                }, 1000);
            } else {
                // BUY
                if (points < item.cost) {
                    throw new Error("Puntos insuficientes");
                }
                const result = await purchase('avatars', item.asset_value, item.cost);
                if (result.success) {
                    setSuccessMsg(`¡Avatar comprado!`);
                    // Don't close immediately, let them equate it
                } else {
                    throw new Error(result.error || "Error en la compra");
                }
            }
        } catch (err) {
            console.error(err);
            setError(typeof err === 'string' ? err : err.message);
        } finally {
            setProcessing(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-3xl bg-[#1a1a2e] border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-purple-900/50 flex justify-between items-center bg-[#131321]">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">🖼️</span>
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Galería de Avatars</h2>
                            <p className="text-xs text-purple-300/60">Selecciona o desbloquea nuevas identidades.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-black/40 px-3 py-1 rounded-full border border-yellow-500/30 flex items-center gap-2">
                            <span className="text-yellow-400">💎</span>
                            <span className="text-white font-mono font-bold">{points}</span>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">✕</button>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0f0f1a] relative">
                    {loading && <div className="text-center text-white py-10">Cargando colección...</div>}

                    {error && (
                        <div className="bg-red-500/80 text-white p-3 rounded-lg mb-4 text-center font-bold animate-pulse">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-green-500/80 text-white p-3 rounded-lg mb-4 text-center font-bold">
                            {successMsg}
                        </div>
                    )}

                    <div className="grid grid-cols-2sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {avatars.map(item => {
                            const owned = item.cost === 0 || isOwned('avatars', item.asset_value);
                            const isCurrent = profile.avatar === item.asset_value;

                            return (
                                <div
                                    key={item.id}
                                    className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#1a1a2e] ${isCurrent ? 'border-green-500 ring-2 ring-green-500/30' : 'border-purple-500/20 hover:border-purple-500'}`}
                                    onClick={() => handleAction(item)}
                                >
                                    <div className="aspect-square w-full relative">
                                        <img src={item.asset_value} alt={item.name} className="w-full h-full object-cover" />

                                        {/* Status Badge */}
                                        <div className="absolute top-2 right-2">
                                            {isCurrent ? (
                                                <span className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">EQUIPADO</span>
                                            ) : owned ? (
                                                <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">✓ TUYO</span>
                                            ) : (
                                                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                                                    🔒 {item.cost}
                                                </span>
                                            )}
                                        </div>

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <span className="font-bold text-white transform scale-90 group-hover:scale-100 transition-transform">
                                                {processing === item.id ? '...' : (owned ? (isCurrent ? 'ACTUAL' : 'EQUIPAR') : 'COMPRAR')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 text-center border-t border-white/5">
                                        <h3 className="text-xs font-bold truncate text-white/80">{item.name}</h3>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
