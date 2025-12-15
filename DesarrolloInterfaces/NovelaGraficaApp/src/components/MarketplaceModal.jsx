import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketService } from '../services/MarketService';
import { useUserProgress } from '../stores/userProgress';
import { supabase } from '../services/supabaseClient';

export default function MarketplaceModal({ isOpen, onClose }) {
    const { points, purchase, isOwned } = useUserProgress();
    const [shopItems, setShopItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchShopItems();
        }
    }, [isOpen]);

    const fetchShopItems = async () => {
        setLoading(true);
        // DB Fetch first
        try {
            const items = await MarketService.getShopItems();
            if (items.length > 0) {
                setShopItems(items);
            } else {
                // Fallback / Initial Seed Data if DB empty
                setShopItems([
                    { id: 'font-dyslexic', name: 'Fuente Dislexia', description: 'Tipografía optimizada para lectura.', type: 'font', cost: 100, asset_value: 'OpenDyslexic' },
                    { id: 'font-arial-black', name: 'Fuente Alta Visibilidad', description: 'Arial Black para máximo contraste.', type: 'font', cost: 150, asset_value: 'Arial Black' },
                    { id: 'theme-sepia', name: 'Tema Sepia', description: 'Un tono cálido para tus ojos.', type: 'theme', cost: 200, asset_value: 'sepia' },
                    { id: 'theme-terminal', name: 'Tema Hacker', description: 'Estilo terminal retro verde.', type: 'theme', cost: 300, asset_value: 'terminal' },
                    { id: 'sticker-batman', name: 'Sticker Batman', description: 'Muestra tu lealtad a Gotham.', type: 'sticker', cost: 50, asset_value: 'sticker_batman' },
                ]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item) => {
        if (points < item.cost) {
            setError("No tienes suficientes puntos.");
            return;
        }

        setPurchasing(item.id);
        setError(null);

        // 1. Try DB Purchase
        const result = await MarketService.buyItem(item.id);

        if (result.success) {
            // 2. Update Local Store
            // Map category types manually to store keys if needed
            let category = 'effects';
            if (item.type === 'font') category = 'fonts';
            if (item.type === 'theme') category = 'themes';

            purchase(category, item.asset_value, item.cost);
            setSuccessMsg(`¡Has comprado ${item.name}!`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } else {
            // Special Case: If we are using mock data (ID doesn't exist in DB), just unlock locally
            if (result.message === 'Item not found' && item.id.startsWith('font-')) {
                let category = 'fonts';
                if (item.type === 'theme') category = 'themes';
                purchase(category, item.asset_value, item.cost);
                setSuccessMsg(`¡Has comprado ${item.name}!`);
            } else {
                setError(result.message);
            }
        }
        setPurchasing(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">🏪</span>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-widest uppercase">Mercado Negro</h2>
                            <p className="text-xs text-slate-400">Canjea tus méritos por mejoras ilegales.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-yellow-500/30 flex items-center gap-2">
                            <span className="text-yellow-400 text-xl">💎</span>
                            <span className="text-white font-mono text-xl font-bold">{points}</span>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">✕</button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 relative">
                    {error && (
                        <div className="fixed top-20 right-10 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
                            ⛔ {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="fixed top-20 right-10 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
                            ✅ {successMsg}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shopItems.map(item => {
                                // Determine ownership logic based on local store keys
                                let category = 'effects';
                                if (item.type === 'font') category = 'fonts';
                                if (item.type === 'theme') category = 'themes';
                                const owned = isOwned(category, item.asset_value);

                                return (
                                    <motion.div
                                        key={item.id}
                                        whileHover={{ y: -5 }}
                                        className={`bg-slate-800 border ${owned ? 'border-green-500/50' : 'border-slate-700'} rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden group`}
                                    >
                                        {owned && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded">
                                                ADQUIRIDO
                                            </div>
                                        )}

                                        <div className="h-24 bg-slate-900 rounded-lg flex items-center justify-center text-4xl text-slate-600 group-hover:text-yellow-400 transition-colors">
                                            {item.type === 'font' ? 'Aa' : item.type === 'theme' ? '🎨' : '📦'}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                            <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                                            <span className={`font-mono font-bold text-lg ${owned ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {owned ? '✓ EN POSESIÓN' : `${item.cost} 💎`}
                                            </span>

                                            {!owned && (
                                                <button
                                                    onClick={() => handleBuy(item)}
                                                    disabled={purchasing || points < item.cost}
                                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${points >= item.cost
                                                        ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {purchasing === item.id ? '...' : 'COMPRAR'}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
