import { useState, useEffect } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';
import { storageService, type Debt } from '../../services/storageService';
import { gamificationService } from '../../services/gamificationService';
import { ArrowLeft } from 'lucide-react';

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
        <div className="fantasy-theme min-h-screen pb-24">
            <div className="fantasy-container dungeon-bg w-full min-h-screen">

                {/* Header */}
                <header className="fantasy-header flex items-center justify-between p-4 sticky top-0 z-10 bg-stone-900/90 backdrop-blur-md border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="text-primary" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-primary uppercase tracking-widest">Debt Tracker</h1>
                            <p className="text-[0.625rem] text-muted uppercase tracking-wider">Tribute & Burden</p>
                        </div>
                    </div>
                </header>

                <main className="p-4 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="fantasy-card p-4 text-center border-emerald-900/30 bg-stone-900/80">
                            <span className="text-xs uppercase font-bold text-stone-500 block tracking-wider mb-1">Tribute</span>
                            <span className="text-emerald-400 text-2xl font-bold glow-green">+{totalTribute.toLocaleString()} <span className="text-xs text-stone-500">GP</span></span>
                        </div>
                        <div className="fantasy-card p-4 text-center border-red-900/30 bg-stone-900/80">
                            <span className="text-xs uppercase font-bold text-stone-500 block tracking-wider mb-1">Burden</span>
                            <span className="text-red-500 text-2xl font-bold glow-red">-{totalBurden.toLocaleString()} <span className="text-xs text-stone-500">GP</span></span>
                        </div>
                    </div>

                    {/* Contact List */}
                    <div className="space-y-4">
                        <h2 className="text-xs uppercase tracking-widest text-primary/70 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            Active Contracts
                        </h2>

                        {debts.length === 0 ? (
                            <div className="text-center py-12 text-stone-500 italic">
                                No active debts found in the archives.
                            </div>
                        ) : (
                            debts.map(debt => (
                                <div key={debt.id} className="fantasy-card p-4 flex items-center gap-4 group hover:border-primary/50 transition-all">
                                    <div className="w-12 h-12 rounded-full border-2 border-stone-700 overflow-hidden bg-stone-800 shadow-sm shrink-0">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${debt.name}&background=random&color=fff`}
                                            alt={debt.name}
                                            className="w-full h-full object-cover opacity-80"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-stone-200 truncate leading-tight">{debt.name}</h3>
                                        <p className="text-xs text-stone-500 uppercase tracking-wide">{debt.role || 'Unknown'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`font-mono font-bold block text-lg ${debt.type === 'owed_to_me' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {debt.type === 'owed_to_me' ? '+' : '-'}{debt.amount}
                                        </span>
                                        <button
                                            onClick={() => handleSettleDebt(debt.id, debt.amount, debt.type)}
                                            className="text-[0.625rem] uppercase font-bold text-stone-500 hover:text-primary transition-colors mt-2"
                                        >
                                            Settle Contract
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Debt Floating Button */}
                    <button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-stone-900 shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-20">
                        <span className="material-icons text-2xl">edit</span>
                    </button>
                </main>
            </div>
        </div>
    );
}
