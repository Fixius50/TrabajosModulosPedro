import { useState, useEffect } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';
import { storageService, type Debt } from '../../services/storageService';

import { gamificationService } from '../../services/gamificationService';

export default function DebtTracker() {
    const navigate = useNavigate();
    const [debts, setDebts] = useState<Debt[]>([]);

    useEffect(() => {
        setDebts(storageService.getDebts());
    }, []);

    const handleSettleDebt = (id: string, amount: number, type: 'owed_to_me' | 'i_owe') => {
        if (!window.confirm("Are you sure this debt is settled?")) return;

        storageService.removeDebt(id);
        setDebts(storageService.getDebts());

        if (type === 'owed_to_me') {
            gamificationService.awardXP(50, "Tribute Received");
            gamificationService.awardGold(amount, "Tribute Collected");
        } else {
            gamificationService.awardXP(100, "Burden Lifted");
        }
    };

    const totalTribute = debts
        .filter(d => d.type === 'owed_to_me')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalBurden = debts
        .filter(d => d.type === 'i_owe')
        .reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="font-display text-stone-900 bg-background-dark min-h-screen flex justify-center items-center overflow-hidden dungeon-bg p-4">
            {/* Phone Container equivalent */}
            <div className="relative w-full max-w-[24.375rem] h-[52.75rem] bg-background-dark overflow-hidden shadow-2xl border-4 border-[#2d1a1a] flex flex-col items-center rounded-3xl">

                {/* Status Bar Mockup */}
                <div className="w-full px-8 pt-4 flex justify-between items-center text-xs opacity-50 z-20 text-stone-300">
                    <span>9:41</span>
                    <div className="flex gap-1.5">
                        <span className="material-icons text-xs">signal_cellular_alt</span>
                        <span className="material-icons text-xs">wifi</span>
                        <span className="material-icons text-xs">battery_full</span>
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-12 left-4 z-50 text-stone-800 bg-parchment/80 p-2 rounded-full shadow-lg hover:bg-parchment transition-colors"
                >
                    <span className="material-icons">arrow_back</span>
                </button>

                {/* Scroll Content Area */}
                <div className="mt-4 mb-20 w-[92%] h-full relative z-10 overflow-visible flex flex-col">
                    {/* Top Scroll Roll */}
                    <div className="absolute -top-4 left-0 right-0 h-10 bg-[#5c4033] rounded-full shadow-lg z-20 border-b-2 border-[#3d2b22] overflow-hidden shrink-0">
                        <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                    </div>

                    {/* Main Scroll Body */}
                    <div className="parchment-texture burnt-edge bg-[#e8d5b5] flex-grow w-full py-12 px-6 flex flex-col overflow-y-auto no-scrollbar relative">

                        {/* Header */}
                        <header className="text-center mb-8 border-b border-[#5c4033]/20 pb-4 shrink-0">
                            <h1 className="text-4xl font-bold text-[#3d2b22] italic tracking-tight uppercase drop-shadow-sm">Debt Tracker</h1>
                            <p className="text-[#5c4033] text-sm italic font-medium mt-1">"A Soul's Balance of Tribute & Burden"</p>
                        </header>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-3 mb-8 shrink-0">
                            <div className="bg-stone-800/5 p-3 rounded border border-[#5c4033]/30 text-center shadow-inner">
                                <span className="text-[0.625rem] uppercase font-bold text-[#5c4033] block tracking-wider">Tribute</span>
                                <span className="text-emerald-600 text-xl font-bold glow-green">+{totalTribute.toLocaleString()} <span className="text-xs">GP</span></span>
                            </div>
                            <div className="bg-stone-800/5 p-3 rounded border border-[#5c4033]/30 text-center shadow-inner">
                                <span className="text-[0.625rem] uppercase font-bold text-[#5c4033] block tracking-wider">Burden</span>
                                <span className="text-red-700 text-xl font-bold glow-red">-{totalBurden.toLocaleString()} <span className="text-xs">GP</span></span>
                            </div>
                        </div>

                        {/* Contact List */}
                        <div className="space-y-4 flex-grow">
                            {debts.map(debt => (
                                <div key={debt.id} className="flex items-center gap-3 border-b border-[#5c4033]/10 pb-3 group relative">
                                    <div className="w-12 h-12 rounded-full border-2 border-[#5c4033] overflow-hidden bg-stone-300 shadow-sm shrink-0">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${debt.name}&background=random&color=fff`}
                                            alt={debt.name}
                                            className="w-full h-full object-cover sepia-[.5]"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-[#3d2b22] truncate leading-tight">{debt.name}</h3>
                                        <p className="text-xs text-[#5c4033]/80 italic truncate">{debt.role}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`font-bold block text-lg ${debt.type === 'owed_to_me' ? 'text-emerald-700 glow-green' : 'text-red-800 glow-red'}`}>
                                            {debt.type === 'owed_to_me' ? '+' : '-'}{debt.amount}
                                        </span>
                                        <button
                                            onClick={() => handleSettleDebt(debt.id, debt.amount, debt.type)}
                                            className="text-[0.625rem] uppercase font-bold text-[#5c4033] hover:text-emerald-600 underline mt-1"
                                        >
                                            Settle
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Debt Button (Wax Seal) */}
                        <button className="mt-8 mx-auto w-16 h-16 rounded-full wax-seal flex items-center justify-center transform hover:scale-105 transition-transform active:scale-95 shadow-xl shrink-0">
                            <span className="material-icons text-white/90 text-3xl drop-shadow-md">edit_square</span>
                        </button>

                    </div>

                    {/* Bottom Scroll Roll */}
                    <div className="absolute -bottom-4 left-0 right-0 h-10 bg-[#5c4033] rounded-full shadow-lg z-20 border-t-2 border-[#3d2b22] overflow-hidden shrink-0">
                        <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
