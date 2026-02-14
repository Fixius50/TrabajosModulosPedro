import React, { useEffect, useState } from 'react';
import { supabase } from '../../../ts/supabaseClient';
import { dndService } from '../../../ts/services/dndService';
import type { DndItem } from '../../../ts/services/dndService';
import { DungeonCard } from './DungeonCard';

export const InventoryPage: React.FC = () => {
    const [balance, setBalance] = useState(0);
    const [inventory, setInventory] = useState<{ affordable: DndItem[], nextGoal: DndItem | null, percentToNext: number, level: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchGamifiedState = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Demo fallback if no user
                const demoBalance = 1500;
                setBalance(demoBalance);
                const gamifiedData = await dndService.calculatePurchasingPower(demoBalance);
                setInventory({ ...gamifiedData, percentToNext: 0, level: 'Novice' }); // Mock extra fields
                setLoading(false);
                return;
            }

            // Get Balance
            const { data: accounts } = await supabase.from('bank_accounts').select('balance').eq('user_id', user.id);
            const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

            setBalance(totalBalance);

            // Calculate purchasing power
            const gamifiedData = await dndService.calculatePurchasingPower(totalBalance);

            // Calculate extra gamification stats safely
            const nextCost = gamifiedData.nextGoal?.cost_gp || 10000;
            const percent = Math.min(100, Math.max(0, (totalBalance / nextCost) * 100));
            const wealthLevel = totalBalance > 5000 ? 'Dragon' : totalBalance > 1000 ? 'Noble' : 'Peasant';

            setInventory({
                ...gamifiedData,
                percentToNext: percent,
                level: wealthLevel
            });

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
        return <div className="p-8 text-center font-dungeon-header text-gold-coin animate-pulse">Tasando tu botín...</div>;
    }

    const { affordable, nextGoal, percentToNext, level } = inventory;

    return (
        <div className="min-h-screen bg-dungeon-bg bg-wood-texture p-4 pb-20 flex flex-col gap-6 text-ink">
            <div className="p-4 bg-wood-texture min-h-[calc(100vh-80px)] rounded-t-xl shadow-inner-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 bg-parchment-texture p-3 rounded border-2 border-iron-border shadow-md">
                    <div>
                        <h1 className="text-2xl font-dungeon-header text-ink uppercase tracking-wider font-bold">
                            Tu Botín
                        </h1>
                        <div className="text-xs text-ink/60 font-bold uppercase tracking-widest">Nivel de Riqueza: {level}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-dungeon-header text-yellow-700 drop-shadow-sm font-bold">
                            {balance.toLocaleString()} <span className="text-sm">GP</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar (Experience) */}
                <div className="mb-8 relative pt-2">
                    <div className="flex justify-between text-xs text-parchment-light mb-1 font-bold uppercase tracking-wider px-1">
                        <span>Siguiente Item: {nextGoal?.name || 'Maxed Out'}</span>
                        <span>{nextGoal ? `${nextGoal.cost_gp - balance} GP Restantes` : ''}</span>
                    </div>
                    {/* XP Bar Background */}
                    <div className="h-6 w-full bg-black/60 rounded-full border-2 border-iron-border relative overflow-hidden shadow-inner">
                        {/* XP Bar Fill */}
                        <div
                            className="h-full bg-gradient-to-r from-red-900 via-red-600 to-gold-coin transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                            style={{ width: `${percentToNext}%` }}
                        >
                            <div className="h-full w-full absolute top-0 left-0 bg-[url('/images/shine.png')] opacity-20 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Inventory Grid */}
                <h2 className="font-dungeon-header text-xl text-parchment-light mb-4 flex items-center gap-2 drop-shadow-md">
                    <span className="material-symbols-outlined text-gold-coin">backpack</span>
                    Mochila
                </h2>

                <div className="grid grid-cols-3 gap-3">
                    {affordable.map((item, index) => (
                        <div
                            key={index}
                            className="aspect-square rounded border-4 transition-all duration-300 relative group bg-paper-texture border-gold-coin shadow-gold hover:scale-105 cursor-pointer"
                        >
                            {/* Item Icon */}
                            <div className="flex flex-col items-center justify-center h-full text-center p-1">
                                <span className="material-symbols-outlined text-3xl mb-1 text-ink">
                                    {/* Icon placeholder logic could go here */}
                                    token
                                </span>
                                <div className="text-[10px] leading-tight font-bold text-ink font-dungeon-body">
                                    {item.name}
                                </div>
                            </div>

                            {/* Tooltip on Hover */}
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs p-2 rounded w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-gold-coin">
                                <div className="text-gold-coin font-bold mt-1">{item.cost_gp} GP</div>
                            </div>
                        </div>
                    ))}

                    {/* Empty Slots Filler */}
                    {[...Array(Math.max(0, 9 - affordable.length))].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square rounded border-4 border-dashed border-white/5 bg-black/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white/5">lock</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
