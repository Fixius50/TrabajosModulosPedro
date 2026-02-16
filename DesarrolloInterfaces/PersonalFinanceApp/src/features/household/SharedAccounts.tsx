import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Plus, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { householdService, type SharedAccount } from '../../services/householdService';


export default function SharedAccounts() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // State
    const [accounts, setAccounts] = useState<SharedAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [householdId, setHouseholdId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newBalance, setNewBalance] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const households = await householdService.getMyHouseholds();
            if (households.length > 0) {
                const hhId = households[0].id; // MVP: Use first household
                setHouseholdId(hhId);
                const accs = await householdService.getSharedAccounts(hhId);
                setAccounts(accs);
            }
        } catch (error) {
            console.error("Error loading shared accounts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!householdId || !newName) return;

        try {
            const balance = parseFloat(newBalance) || 0;
            await householdService.createSharedAccount(householdId, newName, balance);

            // Reload
            const accs = await householdService.getSharedAccounts(householdId);
            setAccounts(accs);

            // Reset form
            setIsAdding(false);
            setNewName('');
            setNewBalance('');
        } catch (error) {
            console.error("Error creating account:", error);
            alert("Error al crear la cuenta");
        }
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

                {!loading && !householdId && (
                    <div className="text-center py-10 text-stone-600">
                        <Wallet className="mx-auto w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm">No perteneces a ningún hogar.</p>
                        <button
                            onClick={() => navigate('/household')}
                            className="mt-4 text-xs bg-blue-600/20 text-blue-400 px-4 py-2 rounded hover:bg-blue-600/40 transition-colors"
                        >
                            Crear o Unirse a un Hogar
                        </button>
                    </div>
                )}

                {householdId && (
                    <>
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Cuentas Activas</h2>
                            <button
                                onClick={() => setIsAdding(!isAdding)}
                                className="text-xs bg-blue-900/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-900/40 transition-colors flex items-center gap-1"
                            >
                                <Plus size={14} /> Nueva Cuenta
                            </button>
                        </div>

                        {/* Add Form */}
                        {isAdding && (
                            <form onSubmit={handleCreateAccount} className="fantasy-card p-4 animate-in fade-in slide-in-from-top-4 border-blue-500/30">
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Nombre de la cuenta (ej. Fondo Vacaciones)"
                                        className="w-full bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-blue-500 outline-none transition-colors"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Saldo Inicial"
                                            className="w-full bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-blue-500 outline-none transition-colors"
                                            value={newBalance}
                                            onChange={(e) => setNewBalance(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAdding(false)}
                                            className="text-xs text-stone-500 hover:text-stone-300 px-3 py-2"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="text-xs bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                        >
                                            Crear Cuenta
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Accounts List */}
                        <div className="grid gap-4">
                            {accounts.length === 0 ? (
                                <div className="text-center py-8 text-stone-600 text-xs">
                                    No hay cuentas compartidas aún.
                                </div>
                            ) : (
                                accounts.map(acc => (
                                    <div key={acc.id} className="fantasy-card p-4 flex justify-between items-center group hover:border-blue-500/30 transition-all bg-[#1c1917]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded bg-[#0c0a09] flex items-center justify-center border border-stone-800 text-blue-500/80">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-stone-200">{acc.name}</h3>
                                                <p className="text-[10px] text-stone-500 uppercase tracking-widest">
                                                    {acc.currency}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono font-bold text-xl text-stone-200 block">
                                                {acc.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-[10px] text-stone-500 uppercase">Saldo Actual</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

            </main>
        </div>
    );
}
