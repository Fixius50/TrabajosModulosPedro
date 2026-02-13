import React, { useEffect, useState } from 'react';
import { supabase } from '../../../ts/supabaseClient';
import { dndService } from '../../../ts/services/dndService';
import type { DndItem } from '../../../ts/services/dndService';
import { DungeonCard } from './DungeonCard';

export const InventoryPage: React.FC = () => {
    const [balance, setBalance] = useState(0);
    const [inventory, setInventory] = useState<{ affordable: DndItem[], nextGoal: DndItem | null } | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchGamifiedState = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // Should handle auth redirect

            // Get Balance (Reused logic from Dashboard - ideally a shared context/hook)
            const { data: accounts } = await supabase.from('bank_accounts').select('balance').eq('user_id', user.id);
            // Default 1500 if no accounts for demo
            const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 1250;

            setBalance(totalBalance);

            // Calculate purchasing power
            const gamifiedData = await dndService.calculatePurchasingPower(totalBalance);
            setInventory(gamifiedData);

        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGamifiedState();
    }, []);

    if (loading || !inventory) {
        return <div className="p-8 text-center font-dungeon-header text-gold-coin animate-pulse">Appraising your hoard...</div>;
    }

    const { affordable, nextGoal } = inventory;

    return (
        <div className="min-h-screen bg-dungeon-bg bg-wood-texture p-4 pb-20 flex flex-col gap-6 text-ink">
            {/* Hero Header */}
            <div className="text-center py-6">
                <div className="font-dungeon-body text-parchment text-sm tracking-widest uppercase mb-1">Current Hoard Value</div>
                <div className="font-dungeon-header text-4xl text-gold-coin drop-shadow-[0_0_10px_rgba(255,204,0,0.5)]">
                    {balance.toLocaleString()} GP
                </div>
            </div>

            {/* Next Goal */}
            {nextGoal && (
                <DungeonCard className="bg-gradient-to-br from-parchment via-[#eaddcf] to-parchment border-gold-coin shadow-coin">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-black/80 text-gold-coin text-[10px] uppercase font-bold px-2 py-1 rounded border border-gold-coin">Next Quest Reward</span>
                        <span className="font-dungeon-technical font-bold text-ruby-expense">
                            Need {nextGoal.cost_gp - balance} GP more
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-black/20 rounded-lg border-2 border-dashed border-ink/30 flex items-center justify-center">
                            <span className="text-3xl opacity-50">🔒</span>
                        </div>
                        <div>
                            <h3 className="font-dungeon-header font-bold text-lg">{nextGoal.name}</h3>
                            <div className="w-full bg-ink/10 h-2 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-gold-coin transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (balance / nextGoal.cost_gp) * 100)}%` }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-bold opacity-60">
                                {Math.floor((balance / nextGoal.cost_gp) * 100)}% Complete
                            </span>
                        </div>
                    </div>
                </DungeonCard>
            )}

            {/* Affordable Items (The "Inventory") */}
            <div>
                <h2 className="font-dungeon-header text-xl text-parchment mb-4">Your Arsenal</h2>
                <div className="grid grid-cols-2 gap-3">
                    {affordable.map((item, idx) => (
                        <div key={idx} className="relative bg-parchment-texture p-3 rounded border border-iron-border flex flex-col items-center text-center shadow-lg group hover:-translate-y-1 transition-transform">
                            <div className="absolute top-1 right-1 text-[10px] font-bold opacity-40">{item.rarity}</div>
                            <div className="w-12 h-12 bg-dungeon-bg rounded-full border-2 border-gold-coin mb-2 flex items-center justify-center text-2xl shadow-inner">
                                ⚔️
                            </div>
                            <h3 className="font-dungeon-header font-bold text-sm leading-tight mb-1">{item.name}</h3>
                            <p className="font-dungeon-body text-[10px] line-clamp-2 opacity-70 leading-none">{item.overview}</p>
                            <span className="mt-2 text-xs font-bold font-dungeon-technical text-emerald-income">{item.cost_gp} GP</span>
                        </div>
                    ))}
                </div>
                {affordable.length === 0 && (
                    <p className="text-center text-parchment opacity-50 italic">You are but a fledgling adventurer with empty pockets.</p>
                )}
            </div>
        </div>
    );
};
