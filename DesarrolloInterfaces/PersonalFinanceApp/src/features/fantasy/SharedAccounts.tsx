import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { storageService, type SharedTransaction, type SharedMember } from '../../services/storageService';

export default function SharedAccounts() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // State
    const [members, setMembers] = useState<SharedMember[]>([]);
    const [transactions, setTransactions] = useState<SharedTransaction[]>([]);

    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [payer, setPayer] = useState('1');

    // Load
    useEffect(() => {
        setMembers(storageService.getSharedMembers());
        setTransactions(storageService.getSharedTransactions());
    }, []);

    const updateBalances = (txs: SharedTransaction[], mems: SharedMember[]) => {
        // Recalculate all balances
        const newMembers = mems.map(m => ({ ...m, balance: 0 }));
        const totalSpent = txs.reduce((sum, t) => sum + t.amount, 0);
        const sharePerPerson = newMembers.length > 0 ? totalSpent / newMembers.length : 0;

        txs.forEach(t => {
            const payerMember = newMembers.find(m => m.id === t.who);
            if (payerMember) {
                payerMember.balance += t.amount;
            }
        });

        // Subtract fair share
        newMembers.forEach(m => {
            m.balance -= sharePerPerson;
        });

        setMembers(newMembers);
        storageService.saveSharedMembers(newMembers);
    };

    const handleAddTx = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !desc) return;

        const val = parseFloat(amount);
        const newTx: SharedTransaction = {
            id: crypto.randomUUID(),
            who: payer,
            amount: val,
            description: desc,
            date: new Date().toISOString()
        };

        const newTxs = [newTx, ...transactions];
        setTransactions(newTxs);
        storageService.saveSharedTransactions(newTxs);

        updateBalances(newTxs, members);

        setAmount('');
        setDesc('');
    };

    return (
        <div className="min-h-screen bg-[#0c0a09] text-stone-200 font-sans selection:bg-blue-900/30 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-[#0c0a09]/95 backdrop-blur-md border-b border-[#292524] px-4 py-3 flex items-center gap-3 shadow-lg">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1917] hover:bg-[#292524] text-stone-400 transition-colors active:scale-95"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    {t('shared_accounts', 'Cuentas Conjuntas')}
                </h1>
            </header>

            <main className="p-4 space-y-6 max-w-md mx-auto w-full">

                {/* Balances */}
                <div className="grid grid-cols-2 gap-4">
                    {members.map(m => (
                        <div key={m.id} className="fantasy-card p-4 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-stone-800 mb-2 flex items-center justify-center font-bold text-stone-400 border border-stone-700">
                                {m.name.charAt(0)}
                            </div>
                            <span className="font-bold text-sm text-stone-200">{m.name}</span>
                            <span className={`text-xs font-mono mt-1 ${m.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {m.balance >= 0 ? '+' : ''}{m.balance.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-stone-500 uppercase">
                                {m.balance >= 0 ? 'Se le debe' : 'Debe'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Add Transaction */}
                <form onSubmit={handleAddTx} className="fantasy-card p-4 border-blue-500/20">
                    <h3 className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-3 flex items-center gap-2">
                        <Coins size={14} /> Añadir Gasto
                    </h3>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <select
                                className="bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-blue-500 outline-none w-1/3"
                                value={payer}
                                onChange={(e) => setPayer(e.target.value)}
                            >
                                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Descripción"
                                className="w-2/3 bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Monto"
                                className="w-full bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-blue-700 transition relative overflow-hidden"
                            >
                                Añadir
                            </button>
                        </div>
                    </div>
                </form>

                {/* History */}
                <div className="space-y-2">
                    <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-2 pl-1 flex items-center gap-2">
                        <History size={14} /> Historial
                    </h3>
                    {transactions.length === 0 ? (
                        <div className="text-center py-6 text-stone-600 text-xs">
                            Sin movimientos recientes.
                        </div>
                    ) : (
                        transactions.map(tx => (
                            <div key={tx.id} className="p-3 rounded bg-[#1c1917] border border-stone-800 flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-bold text-stone-300 block">{tx.description}</span>
                                    <span className="text-[10px] text-stone-500">
                                        Pagado por {members.find(m => m.id === tx.who)?.name}
                                    </span>
                                </div>
                                <span className="font-mono text-stone-200">{tx.amount.toFixed(2)}</span>
                            </div>
                        ))
                    )}
                </div>

            </main>
        </div>
    );
}
