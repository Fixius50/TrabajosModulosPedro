import React, { useEffect, useState } from 'react';
import { dndService } from '../../../ts/services/dndService';
import type { DndItem } from '../../../ts/services/dndService';

export const InventoryPage: React.FC = () => {
    const [balance, setBalance] = useState(0);
    const [items, setItems] = useState<DndItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock Level Logic
    const level = 5;
    const levelTitle = "Lord of the Realm";
    const nextLevelTitle = "Dragon Hoarder";
    const percentToNext = 72;

    useEffect(() => {
        const loadInventory = async () => {
            try {
                // In a real app, strict mode might double invoke, so we clear first or handle it
                // For now, simple fetch
                const dndItems = await dndService.getInventory();
                setItems(dndItems); // Just take first 8 for the grid
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadInventory();
        setBalance(1250000); // Mock Balance matching the design
    }, []);

    // STITCH DESIGN: "Hero's Hoard" (Mahogany & Gold Theme)
    // - Background: Mahogany Wood Texture #221e10
    // - Accents: Liquid Gold #f2b90d
    // - Font: Serif

    return (
        <div className="min-h-screen bg-[#221e10] text-white font-serif pb-20 relative overflow-hidden flex flex-col">
            {/* Background Texture (Mahogany) */}
            <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=2070&auto=format&fit=crop)', backgroundSize: 'cover' }}>
            </div>

            {/* Border Frame */}
            <div className="absolute inset-2 border-2 border-[#3d2b1f] pointer-events-none z-20"></div>

            {/* SECTION 1: Wealth Level */}
            <header className="relative z-10 px-6 pt-12 pb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#f2b90d]/70 font-bold">Current Tier</span>
                    <span className="text-sm text-[#f2b90d] font-bold italic drop-shadow-md text-right">{levelTitle}</span>
                </div>
                {/* Progress Bar Container */}
                <div className="h-6 w-full bg-black/40 rounded-full p-1 border border-[#f2b90d]/20 relative shadow-inner">
                    {/* Liquid Gold Bar */}
                    <div className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out" style={{ width: `${percentToNext}%`, background: 'linear-gradient(90deg, #b8860b 0%, #f2b90d 50%, #ffd700 100%)', boxShadow: '0 0 10px rgba(242, 185, 13, 0.4)' }}>
                        <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
                    </div>
                    {/* Marks */}
                    <div className="absolute inset-0 flex justify-between px-4 items-center">
                        <span className="text-[8px] text-white/50 font-bold uppercase z-10">{level}</span>
                        <span className="text-[8px] text-[#f2b90d] font-bold uppercase drop-shadow-md z-10">{nextLevelTitle}</span>
                    </div>
                </div>
            </header>

            {/* SECTION 2: Net Worth Stats (Ornate Box) */}
            <section className="relative z-10 px-6 py-2 flex flex-col items-center">
                <div className="relative w-full py-8 text-center bg-black/30 rounded-xl border border-[#f2b90d]/10 backdrop-blur-sm">
                    {/* Ornate Corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#f2b90d]/40 rounded-tl-xl p-1"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#f2b90d]/40 rounded-tr-xl p-1"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#f2b90d]/40 rounded-bl-xl p-1"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#f2b90d]/40 rounded-br-xl p-1"></div>

                    <h2 className="text-[#f2b90d]/60 text-xs uppercase tracking-[0.2em] mb-2 font-bold">Total Net Worth</h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-bold text-[#f2b90d] tracking-tight drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">
                            {balance.toLocaleString()}
                        </span>
                        <span className="text-xl text-[#f2b90d]/80 font-bold italic">GP</span>
                    </div>

                    {/* Decorative Particles */}
                    <div className="mt-4 flex justify-center gap-2">
                        <div className="w-1 h-1 bg-[#f2b90d] rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-[#f2b90d]/40 rounded-full"></div>
                        <div className="w-1 h-1 bg-[#f2b90d]/70 rounded-full animate-pulse delay-75"></div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: Backpack (Grid) */}
            <section className="relative z-10 flex-1 px-6 py-6 pb-24 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[#f2b90d] text-lg">🎒</span>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#f2b90d]/80">Backpack Slots</h3>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-square bg-black/20 rounded border border-[#3d2b1f] animate-pulse"></div>
                        ))
                    ) : (
                        items.map((item, index) => (
                            <div key={index} className="aspect-square bg-[#1a1609] rounded-lg border-2 border-[#3d2b1f] shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-1 group relative cursor-pointer hover:border-[#f2b90d]/60 transition-colors">
                                <div className="text-2xl drop-shadow-md mb-1 group-hover:scale-110 transition-transform">
                                    {/* Simple mapping based on name or default */}
                                    {item.name.includes('Potion') ? '🧪' : item.name.includes('Sword') ? '⚔️' : item.name.includes('Map') ? '🗺️' : '📦'}
                                </div>
                                <span className="text-[8px] text-[#f2b90d]/60 font-bold uppercase text-center leading-none truncate w-full px-1">
                                    {item.name}
                                </span>

                                {/* Info Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2a2721] border border-[#f2b90d] text-[#e3d5b8] text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                                    {item.cost_gp} GP
                                </div>
                            </div>
                        ))
                    )}
                    {/* Empty Slots Filler */}
                    {[...Array(Math.max(0, 12 - items.length))].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-[#0f0c05] rounded-lg border border-[#2a1e16] shadow-inner opacity-50 flex items-center justify-center">
                            <span className="text-[#3d2b1f] text-xs">+</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
