
import React, { useEffect, useState } from 'react';
import { MarketService } from '../services/MarketService';
// import { useAuth } from '../hooks/useAuth'; // Removed: Hook does not exist
import { supabase } from '../services/supabaseClient'; // Direct auth check if hook missing

export default function Marketplace() {
    const [items, setItems] = useState([]);
    const [points, setPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [notification, setNotification] = useState("");

    useEffect(() => {
        // Auth Check
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                loadMarketData(user.id);
            }
        };
        getUser();
    }, []);

    const loadMarketData = async (userId) => {
        setLoading(true);
        try {
            const profile = await MarketService.getUserProfile(userId);
            setPoints(profile?.points || 0);

            const shopItems = await MarketService.getShopItems(userId);
            setItems(shopItems);
        } catch (error) {
            console.error("Error loading market:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item) => {
        if (points < item.cost) {
            setNotification("Not enough points!");
            return;
        }

        try {
            const result = await MarketService.buyItem(item.id);
            if (result.success) {
                setNotification(`Successfully purchased: ${item.name}!`);
                // Reload data to update points and UI
                loadMarketData(user.id);
            } else {
                setNotification(result.message || "Purchase failed.");
            }
        } catch (error) {
            setNotification("Error processing transaction.");
        }
    };

    // Clear notification after 3s
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (loading) return <div className="p-10 text-center text-white">Loading Market...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <header className="flex justify-between items-center mb-10 border-b border-gray-700 pb-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Marketplace
                    </h1>
                    <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-full border border-yellow-500/50">
                        <span className="text-yellow-400 text-xl">🪙</span>
                        <span className="text-xl font-bold">{points}</span>
                    </div>
                </header>

                {/* Notification Toast */}
                {notification && (
                    <div className="fixed top-5 right-5 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-xl animate-bounce">
                        {notification}
                    </div>
                )}

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`relative bg-gray-800 rounded-xl overflow-hidden border transition-all hover:scale-105 ${item.owned ? 'border-green-500/50' : 'border-gray-700 hover:border-purple-500'}`}
                        >
                            {/* Preview Image/Placeholder */}
                            <div className="h-40 bg-gray-700 flex items-center justify-center">
                                {item.preview_url ? (
                                    <img src={item.preview_url} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl">🎁</span>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold">{item.name}</h3>
                                    <span className="text-xs uppercase px-2 py-1 bg-gray-900 rounded text-gray-400">{item.type}</span>
                                </div>

                                <p className="text-gray-400 text-sm mb-4 h-10 line-clamp-2">
                                    {item.description || "Unlock this cool item for your collection."}
                                </p>

                                {item.owned ? (
                                    <button disabled className="w-full py-2 bg-green-600/20 text-green-400 font-bold rounded cursor-default border border-green-500/30">
                                        OWNED
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleBuy(item)}
                                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={points < item.cost}
                                    >
                                        <span>Buy for</span>
                                        <span className="text-yellow-200">{item.cost} 🪙</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
