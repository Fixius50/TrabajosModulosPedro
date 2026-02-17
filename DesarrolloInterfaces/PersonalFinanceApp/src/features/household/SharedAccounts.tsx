import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Plus, ArrowUpRight, ArrowDownLeft, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { householdService, type SharedAccount, type SharedTransaction } from '../../services/householdService';
import { supabase } from '../../lib/supabase'; // Import supabase for auth check

export default function SharedAccounts() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // State
    const [accounts, setAccounts] = useState<SharedAccount[]>([]);
    const [transactions, setTransactions] = useState<SharedTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [householdId, setHouseholdId] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<SharedAccount | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

    // Form State
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [isAddingTx, setIsAddingTx] = useState(false);

    // Account Form
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountBalance, setNewAccountBalance] = useState('');

    // Transaction Form
    const [txAmount, setTxAmount] = useState('');
    const [txDesc, setTxDesc] = useState('');
    const [txCategory] = useState('General');

    useEffect(() => {
        loadUser();
        loadData();
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            loadTransactions(selectedAccount.id);
        } else {
            setTransactions([]);
        }
    }, [selectedAccount]);

    const loadUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user?.email) setCurrentUserEmail(data.user.email);
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const households = await householdService.getMyHouseholds();
            if (households.length > 0) {
                const hhId = households[0].id;
                setHouseholdId(hhId);
                const accs = await householdService.getSharedAccounts(hhId);
                setAccounts(accs);
                if (accs.length > 0) setSelectedAccount(accs[0]);
            }
        } catch (error) {
            console.error("Error loading shared accounts:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async (accountId: string) => {
        try {
            const txs = await householdService.getSharedAccountTransactions(accountId);
            setTransactions(txs);
        } catch (error) {
            console.error("Error loading transactions:", error);
        }
    };

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!householdId || !newAccountName) return;

        try {
            const balance = parseFloat(newAccountBalance) || 0;
            await householdService.createSharedAccount(householdId, newAccountName, balance);

            // Reload accounts
            const accs = await householdService.getSharedAccounts(householdId);
            setAccounts(accs);

            setIsAddingAccount(false);
            setNewAccountName('');
            setNewAccountBalance('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAccount || !txAmount || !txDesc) return;

        try {
            const amount = parseFloat(txAmount);
            await householdService.addSharedTransaction(selectedAccount.id, amount, txDesc, txCategory);

            // Reload transactions and accounts (balance update)
            loadTransactions(selectedAccount.id);
            const accs = await householdService.getSharedAccounts(householdId!);
            setAccounts(accs);

            // Update selected account balance locally 
            const updatedAccount = accs.find(a => a.id === selectedAccount.id);
            if (updatedAccount) setSelectedAccount(updatedAccount);

            setIsAddingTx(false);
            setTxAmount('');
            setTxDesc('');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center text-stone-500">Cargando finanzas compartidas...</div>;

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
                <div className="flex-grow">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        {t('shared_accounts', 'Cuentas Conjuntas')}
                    </h1>
                </div>
                <button
                    onClick={() => setIsAddingAccount(true)}
                    className="p-2 text-stone-400 hover:text-white transition-colors"
                >
                    <Plus size={20} />
                </button>
            </header>

            <main className="p-4 space-y-6 max-w-md mx-auto w-full">

                {/* Account Tabs */}
                {accounts.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {accounts.map(acc => (
                            <button
                                key={acc.id}
                                onClick={() => setSelectedAccount(acc)}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-all ${selectedAccount?.id === acc.id
                                    ? 'bg-blue-900/20 border-blue-500/50 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                    : 'bg-[#1c1917] border-[#292524] text-stone-500 hover:text-stone-300'
                                    }`}
                            >
                                <div className="text-xs font-bold truncate max-w-[6.25rem]">{acc.name}</div>
                                <div className="text-[0.625rem] opacity-70">{acc.currency} {acc.balance.toFixed(2)}</div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Selected Account Detail */}
                {selectedAccount ? (
                    <div className="space-y-4">
                        {/* Balance Card */}
                        <div className="fantasy-card p-6 bg-gradient-to-br from-[#1c1917] to-[#0c0a09] border-[#292524] shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Wallet size={100} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-stone-500 text-xs uppercase tracking-widest mb-1">Saldo Disponible</p>
                                <h2 className="text-3xl font-bold text-white font-mono tracking-tighter">
                                    {selectedAccount.balance.toLocaleString('es-ES', { style: 'currency', currency: selectedAccount.currency })}
                                </h2>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => setIsAddingTx(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <Plus size={14} /> Nueva Transacción
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* User Shared Message */}
                        <div className="p-3 rounded bg-blue-900/10 border border-blue-500/20 flex items-start gap-3">
                            <Users className="text-blue-400 mt-0.5" size={16} />
                            <div className="text-xs text-blue-200">
                                <span className="font-bold text-blue-300">{currentUserEmail || 'Tu usuario'}</span> está compartiendo esta cuenta con el hogar.
                                <br />
                                <span className="opacity-60 text-[0.625rem]">Todas las transacciones son visibles para los miembros del grupo.</span>
                            </div>
                        </div>

                        {/* Transactions List */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest pl-1">Movimientos Recientes</h3>

                            {transactions.length === 0 ? (
                                <div className="text-center py-8 text-stone-600 text-xs border border-dashed border-stone-800 rounded-lg">
                                    No hay movimientos registrados.
                                </div>
                            ) : (
                                <div className="divide-y divide-stone-800/50">
                                    {transactions.map(tx => (
                                        <div key={tx.id} className="py-3 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                    }`}>
                                                    {tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-stone-200">{tx.description}</p>
                                                    <p className="text-[0.625rem] text-stone-500">
                                                        {new Date(tx.created_at).toLocaleDateString()} • {tx.created_by_user?.email || 'Miembro'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`font-mono font-medium text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-stone-200'
                                                }`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-stone-500">
                        <p>No tienes cuentas compartidas.</p>
                        <button onClick={() => setIsAddingAccount(true)} className="text-blue-400 underline text-sm mt-2">Crear una cuenta</button>
                    </div>
                )}
            </main>

            {/* Create Account Modal */}
            {isAddingAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1c1917] w-full max-w-sm rounded-xl border border-stone-800 p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-stone-200 mb-4">Nueva Cuenta Conjunta</h3>
                        <form onSubmit={handleCreateAccount} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nombre (ej. Supermercado)"
                                className="w-full bg-[#0c0a09] border border-stone-700 rounded p-3 text-stone-200 focus:border-blue-500 outline-none"
                                value={newAccountName}
                                onChange={e => setNewAccountName(e.target.value)}
                                autoFocus
                            />
                            <input
                                type="number"
                                placeholder="Saldo Inicial"
                                className="w-full bg-[#0c0a09] border border-stone-700 rounded p-3 text-stone-200 focus:border-blue-500 outline-none"
                                value={newAccountBalance}
                                onChange={e => setNewAccountBalance(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsAddingAccount(false)} className="px-4 py-2 text-stone-500 hover:text-stone-300">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Transaction Modal */}
            {isAddingTx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1c1917] w-full max-w-sm rounded-xl border border-stone-800 p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-stone-200 mb-4">Añadir Transacción</h3>
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-[#0c0a09] border border-stone-700 rounded p-3 text-xl font-mono text-stone-200 focus:border-blue-500 outline-none"
                                    value={txAmount}
                                    onChange={e => setTxAmount(e.target.value)}
                                    autoFocus
                                    step="0.01"
                                />
                                <span className="absolute right-3 top-4 text-xs text-stone-500">Usa negativo para gastos</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Concepto (ej. Compra semanal)"
                                className="w-full bg-[#0c0a09] border border-stone-700 rounded p-3 text-stone-200 focus:border-blue-500 outline-none"
                                value={txDesc}
                                onChange={e => setTxDesc(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsAddingTx(false)} className="px-4 py-2 text-stone-500 hover:text-stone-300">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">Añadir</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
