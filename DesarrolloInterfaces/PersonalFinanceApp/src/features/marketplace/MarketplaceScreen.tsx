import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';
import { marketplaceService } from '../../services/marketplaceService';
import { MarketplaceItem, UserInventoryItem } from './types';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

export default function MarketplaceScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { profile, refreshProfile } = useUserProfile();

    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'avatar' | 'title' | 'theme'>('all');

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [marketItems, userInv] = await Promise.all([
                marketplaceService.getItems(),
                marketplaceService.getUserInventory(user.id)
            ]);
            setItems(marketItems);
            setInventory(userInv);
        } catch (err) {
            console.error(err);
            setError('Error al cargar el mercado');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (item: MarketplaceItem) => {
        if (!user) return;
        setProcessing(item.id);
        setError(null);

        try {
            const result = await marketplaceService.purchaseItem(user.id, item);
            if (result.success) {
                // Refresh data
                await loadData();
                refreshProfile(); // Update balance display
                alert(result.message);
            } else {
                setError(result.message);
                alert(result.message);
            }
        } catch (err) {
            setError('Error en la transacción');
        } finally {
            setProcessing(null);
        }
    };

    const isOwned = (itemId: string) => {
        return inventory.some(i => i.item_id === itemId);
    };

    const filteredItems = activeTab === 'all'
        ? items
        : items.filter(i => i.type === activeTab);

    return (
        <div className="fantasy-theme min-h-screen pb-24 font-display text-primary/90 bg-[#0c0b06]">
            {/* Header */}
            <div className="bg-[#110f0a] border-b border-primary/20 p-4 sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold tracking-tight text-primary runic-glow uppercase italic">{t('black_market', 'Mercado Negro')}</h1>
                    <div className="flex items-center gap-2 bg-stone-900/50 px-3 py-1 rounded-full border border-primary/20">
                        <Wallet size={16} className="text-primary" />
                        <div className="flex gap-3 text-xs font-mono font-bold">
                            <span className="text-amber-400">{profile?.stats.goldEarned} G</span>
                            <span className="text-cyan-400">{profile?.stats.wealthXP} XP</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'all', label: 'Todo' },
                        { id: 'avatar', label: 'Avatares' },
                        { id: 'title', label: 'Títulos' },
                        { id: 'theme', label: 'Temas' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${activeTab === tab.id
                                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(244,192,37,0.2)]'
                                    : 'bg-stone-900/50 border-stone-800 text-stone-500 hover:border-primary/30 hover:text-primary/70'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-xs text-center uppercase tracking-widest animate-pulse">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-10 text-stone-500 animate-pulse uppercase tracking-widest text-xs">
                        Contrabandeando mercancía...
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-10 text-stone-500 uppercase tracking-widest text-xs">
                        Inventario agotado
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredItems.map((item) => {
                            const owned = isOwned(item.id);
                            const canAfford = storageService.hasFunds(item.price_xp, item.price_gold);

                            return (
                                <div key={item.id} className={`fantasy-card p-3 relative group overflow-hidden ${owned ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                                    {/* Rarity Indicator */}
                                    <div className={`absolute top-0 right-0 w-8 h-8 -mr-4 -mt-4 rotate-45 ${item.rarity === 'legendary' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' :
                                            item.rarity === 'epic' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' :
                                                item.rarity === 'rare' ? 'bg-blue-500' :
                                                    item.rarity === 'uncommon' ? 'bg-green-500' :
                                                        'bg-stone-500'
                                        }`}></div>

                                    <div className="aspect-square bg-stone-900/50 rounded-lg mb-3 flex items-center justify-center border border-stone-800 relative overflow-hidden">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-icons text-4xl text-stone-700">
                                                {item.type === 'avatar' ? 'person' : item.type === 'theme' ? 'palette' : 'military_tech'}
                                            </span>
                                        )}
                                        {owned && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs border border-emerald-400/30 px-2 py-1 rounded bg-emerald-900/20">
                                                    Adquirido
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-sm text-stone-200 truncate">{item.name}</h3>
                                    <p className="text-[0.625rem] text-stone-500 uppercase tracking-wider mb-2">{item.type}</p>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex flex-col">
                                            {item.price_gold > 0 && <span className="text-xs font-mono text-amber-500 font-bold">{item.price_gold} G</span>}
                                            {item.price_xp > 0 && <span className="text-xs font-mono text-cyan-500 font-bold">{item.price_xp} XP</span>}
                                        </div>

                                        {!owned && (
                                            <button
                                                disabled={!canAfford || processing === item.id}
                                                onClick={() => handlePurchase(item)}
                                                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${canAfford
                                                        ? 'bg-primary/20 text-primary hover:bg-primary hover:text-black border border-primary/50'
                                                        : 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700'
                                                    }`}
                                            >
                                                {processing === item.id ? (
                                                    <span className="material-icons text-sm animate-spin">refresh</span>
                                                ) : (
                                                    <span className="material-icons text-sm">shopping_cart</span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
