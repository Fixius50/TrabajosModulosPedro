import { useState, useEffect } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import type { Contract } from '../../services/storageService';
import { gamificationService } from '../../services/gamificationService';

export default function MercenaryContracts() {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState<Contract[]>([]);

    useEffect(() => {
        setContracts(storageService.getContracts());
    }, []);

    const handleTerminate = (id: string) => {
        if (!window.confirm("Terminate this contract? The mercenary will leave.")) return;
        const contract = contracts.find(c => c.id === id);
        if (contract) {
            const updated = { ...contract, status: 'Paused' as const };
            storageService.updateContract(updated);
            setContracts(storageService.getContracts());
            gamificationService.awardXP(10, "Contract Terminated");
        }
    };

    const handlePayContract = (_id: string, cost: number) => {
        if (!window.confirm(`Pay ${cost} GP to renew this contract?`)) return;
        gamificationService.awardXP(25, "Mercenary Paid");
        // In a real app, this would deduct gold. For now, it just awards XP.
    };

    return (
        <div className="font-display text-slate-200 bg-[#101622] min-h-screen flex justify-center items-center overflow-hidden relative selection:bg-blue-500/30">
            {/* Background Stone Layer */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#101622] via-[#0b0f19] to-[#101622]"></div>
                {/* Subtle Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[6.25rem] rounded-full"></div>
            </div>

            {/* Mobile Container */}
            <div className="relative w-full max-w-[24.375rem] h-[52.75rem] bg-[#101622] overflow-hidden shadow-2xl border-4 border-[#1a1a1a] flex flex-col items-center rounded-3xl">

                {/* Header Section */}
                <header className="relative z-10 w-full px-6 pt-12 pb-6 text-center border-b border-white/5 bg-[#101622]/90 backdrop-blur-sm">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-12 left-6 w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-colors"
                    >
                        <span className="material-icons">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-blue-500 mb-1 drop-shadow-[0_0_0.5rem_rgba(19,91,236,0.6)]">Grimorio Oscuro</h1>
                    <h2 className="text-sm italic text-slate-400">Mercenary Contracts</h2>
                </header>

                {/* The Parchment Scroll */}
                <main className="relative z-10 flex-1 w-full overflow-y-auto no-scrollbar px-4 pb-20 pt-4">
                    <div className="bg-[#dcd3bc] rounded-t-sm shadow-[0_0.625rem_1.875rem_rgba(0,0,0,0.5),inset_0_0_6.25rem_rgba(139,69,19,0.15)] relative min-h-full px-5 py-8 text-stone-900 clip-path-jagged-bottom">
                        {/* Top Shadow Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#101622] to-transparent z-10 opacity-40 pointer-events-none"></div>

                        <div className="space-y-10 relative z-20">
                            {contracts.map(contract => (
                                <div key={contract.id} className="relative border-b border-stone-800/20 pb-6 last:border-0">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-stone-900/10 rounded-full flex items-center justify-center border border-stone-800/20">
                                                <span className="material-icons text-stone-800 text-xl opacity-80">{contract.icon}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-stone-900 text-lg font-bold leading-none">{contract.name}</h3>
                                                <p className="text-stone-700 text-xs italic mt-0.5">{contract.description}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase tracking-wider border ${contract.status === 'Active'
                                            ? 'bg-blue-600/10 text-blue-800 border-blue-600/20'
                                            : 'bg-stone-600/10 text-stone-600 border-stone-600/20'
                                            }`}>
                                            {contract.status}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end pl-14">
                                        <div>
                                            <p className="text-[0.625rem] uppercase text-stone-500 font-bold tracking-wider">Tribute</p>
                                            <p className="text-xl font-black text-stone-900">{contract.cost} <span className="text-xs font-normal text-stone-600">GP / {contract.cycle}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[0.625rem] uppercase text-stone-500 font-bold tracking-wider">Next Reaping</p>
                                            <p className="text-sm font-bold text-red-900/80">{contract.nextReaping}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 flex justify-end gap-2">
                                        {contract.status === 'Active' ? (
                                            <>
                                                <button
                                                    onClick={() => handlePayContract(contract.id, contract.cost)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 text-white rounded-sm shadow-md hover:bg-blue-700 transition-colors"
                                                >
                                                    <span className="material-icons text-xs">payments</span>
                                                    <span className="text-[0.625rem] font-bold uppercase tracking-widest">Pay</span>
                                                </button>
                                                <button
                                                    onClick={() => handleTerminate(contract.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8b0000] text-white rounded-sm shadow-md hover:bg-[#6b0000] transition-colors group"
                                                >
                                                    <span className="material-icons text-xs opacity-70 group-hover:rotate-12 transition-transform">broken_image</span>
                                                    <span className="text-[0.625rem] font-bold uppercase tracking-widest">Terminate</span>
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-500 text-white rounded-sm opacity-50 cursor-not-allowed"
                                                disabled
                                            >
                                                <span className="text-[0.625rem] font-bold uppercase tracking-widest">Paused</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* New Contract Button */}
                <div className="absolute bottom-6 right-6 z-30">
                    <button className="w-14 h-14 rounded-full bg-blue-700 text-white shadow-[0_0_1.25rem_rgba(19,91,236,0.5)] flex items-center justify-center hover:bg-blue-600 hover:scale-105 transition-all border border-blue-400/30">
                        <span className="material-icons text-2xl">add</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
