import { useState, useEffect } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';
import { storageService, type BudgetChest } from '../../services/storageService';
import { gamificationService } from '../../services/gamificationService';

export default function TreasureChests() {
    const navigate = useNavigate();
    const [chests, setChests] = useState<BudgetChest[]>([]);

    useEffect(() => {
        setChests(storageService.getBudgets());
    }, []);

    const toggleChest = (id: string) => {
        setChests(chests.map(chest =>
            chest.id === id ? { ...chest, isOpen: !chest.isOpen } : chest
        ));
    };

    const handleDeposit = (id: string) => {
        const amount = Number(window.prompt("How much gold to deposit?", "100"));
        if (!amount || isNaN(amount)) return;

        const chest = chests.find(c => c.id === id);
        if (chest) {
            const updatedChest = { ...chest, spent: chest.spent + amount };
            storageService.updateBudget(updatedChest);
            setChests(storageService.getBudgets());
            gamificationService.awardXP(10, "Gold Hoarded");
        }
    };

    return (
        <div className="font-display text-primary/90 bg-[#1a0f0a] min-h-screen flex justify-center items-center overflow-hidden relative selection:bg-amber-500/30">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(255,160,50,0.03),transparent_70%)]"></div>
                <div className="absolute bottom-0 right-0 w-full h-[50%] bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent"></div>
            </div>

            <div className="w-full max-w-md h-screen relative bg-[#1a0f0a] sm:h-[53.125rem] sm:rounded-3xl sm:border sm:border-primary/20 sm:shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <header className="p-6 pb-2 relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary/60 hover:text-primary hover:bg-primary/5 transition-all">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-amber-200 to-primary bg-clip-text text-transparent tracking-widest uppercase filter drop-shadow-sm">
                            Royal Treasury
                        </h1>
                        <button className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary/60 hover:text-primary hover:bg-primary/5 transition-all">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                    </div>

                    <div className="text-center relative py-4">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                        <span className="relative bg-[#1a0f0a] px-4 text-xs text-primary/50 uppercase tracking-[0.2em] font-bold">
                            Allocated Hoards
                        </span>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2 space-y-6 relative z-10 pb-24">

                    <div className="grid grid-cols-1 gap-6">
                        {chests.map(chest => {
                            const percent = (chest.spent / chest.limit) * 100;
                            const isNearLimit = percent > 85;
                            const isOverLimit = percent >= 100;

                            return (
                                <div key={chest.id} className={`group relative transition-all duration-300 ${chest.isOpen ? 'mb-4' : ''}`}>
                                    {/* Chest Card */}
                                    <div
                                        onClick={() => toggleChest(chest.id)}
                                        className={`
                                            relative bg-gradient-to-b from-[#2a1f1a] to-[#201510] 
                                            border-2 ${isOverLimit ? 'border-red-500/30' : isNearLimit ? 'border-amber-500/30' : 'border-[#3a2d25]'}
                                            rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all shadow-lg
                                            ${chest.isOpen ? 'shadow-amber-900/20 translate-y-[-0.125rem]' : ''}
                                        `}
                                    >
                                        {/* Lid/Top decoration */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-[#4a3b32] rounded-full border border-[#2a1f1a]"></div>

                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-lg bg-[#150d0a] border border-primary/10 flex items-center justify-center relative overflow-hidden group-hover:bg-[#1a100d] transition-colors`}>
                                                    <img src={chest.icon} alt={chest.name} className="w-8 h-8 opacity-80" />
                                                    {/* Glow effect for icon */}
                                                    <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-primary/90">{chest.name}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-stone-500">
                                                        <span>{isOverLimit ? 'Hoard Depleted!' : isNearLimit ? 'Low Funds Warning' : 'Secure'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xl font-bold font-mono ${isOverLimit ? 'text-red-400' : 'text-primary'}`}>
                                                    {chest.spent} <span className="text-xs text-stone-500 ml-0.5">/ {chest.limit}</span>
                                                </div>
                                                <span className="text-[0.625rem] text-stone-600 uppercase tracking-wider">Gold Pieces</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar Container - Looks like a lock or hinge */}
                                        <div className="relative h-4 bg-[#150d0a] rounded-full border border-[#3a2d25] overflow-hidden shadow-inner">
                                            {/* Bar Texture */}
                                            <div
                                                className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out flex items-center
                                                    ${isOverLimit ? 'bg-red-900/60' : 'bg-amber-900/60'}
                                                `}
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            >
                                                <div className={`w-full h-full opacity-50 ${isOverLimit ? 'bg-red-500' : 'bg-amber-400'} blur-[0.125rem]`}></div>
                                            </div>
                                            {/* Hard Fill */}
                                            <div
                                                className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out border-r border-white/20
                                                    ${isOverLimit ? 'bg-gradient-to-r from-red-800 to-red-600' : 'bg-gradient-to-r from-amber-700 to-primary'}
                                                `}
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Expanded Details - The "Inside" of the chest */}
                                    <div className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${chest.isOpen ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}
                                    `}>
                                        <div className="bg-[#150d0a]/80 border border-[#3a2d25] border-t-0 rounded-b-xl p-4 mx-2">
                                            <div className="flex justify-between items-center text-sm mb-2">
                                                <span className="text-stone-500">Last withdrawal</span>
                                                <span className="text-stone-300">2 days ago</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-stone-500">Remaining</span>
                                                <span className="text-primary font-mono">{chest.limit - chest.spent} GP</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeposit(chest.id)}
                                                className="w-full mt-3 py-2 bg-gradient-to-r from-[#2a1f1a] to-[#201510] hover:from-[#3a2d25] hover:to-[#2a1f1a] border border-primary/20 rounded text-xs text-primary/80 hover:text-primary uppercase tracking-wider transition-all"
                                            >
                                                Add Gold to Hoard
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button className="w-full py-4 rounded-xl border-2 border-dashed border-primary/20 text-primary/40 hover:text-primary/80 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Forge New Chest</span>
                    </button>
                </div>

                {/* Floating Action Button */}
                <div className="absolute bottom-6 right-6 z-20">
                    <button className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center text-[#1a0f0a] shadow-[0_0_1.25rem_rgba(255,193,7,0.4)] hover:shadow-[0_0_1.875rem_rgba(255,193,7,0.6)] hover:scale-105 transition-all border border-amber-200/50">
                        <span className="material-symbols-outlined text-2xl font-bold">add</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
