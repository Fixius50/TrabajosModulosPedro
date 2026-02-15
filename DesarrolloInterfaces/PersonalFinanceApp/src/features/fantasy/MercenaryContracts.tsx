import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scroll, Plus, Trash2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// storageService removed

// Type for Contract (Subscription)
interface Contract {
    id: string;
    name: string;
    amount: number;
    cycle: 'monthly' | 'yearly';
    nextPayment: string; // ISO date
    icon?: string;
}

export default function MercenaryContracts() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCycle, setNewCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Load from storage
    useEffect(() => {
        const loadContracts = async () => {
            // We use storageService generic 'user_settings' or a new store?
            // Since we don't have a backend table for this yet, we simulate persistence
            // via a specific localStorage key managed by storageService if extended, 
            // or just direct localStorage for this prototype phase.
            // Ideally, we'd add 'subscriptions' to the DB schema.
            // For now: use localStorage 'mercenary_contracts'
            const saved = localStorage.getItem('mercenary_contracts');
            if (saved) {
                setContracts(JSON.parse(saved));
            }
        };
        loadContracts();
    }, []);

    const saveContracts = (newContracts: Contract[]) => {
        setContracts(newContracts);
        localStorage.setItem('mercenary_contracts', JSON.stringify(newContracts));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newAmount) return;

        const newContract: Contract = {
            id: crypto.randomUUID(),
            name: newName,
            amount: parseFloat(newAmount),
            cycle: newCycle,
            nextPayment: new Date().toISOString(), // Mock next payment
        };

        saveContracts([...contracts, newContract]);
        setIsAdding(false);
        setNewName('');
        setNewAmount('');
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Romper este contrato?')) {
            saveContracts(contracts.filter(c => c.id !== id));
        }
    };

    const totalMonthly = contracts.reduce((acc, c) => {
        if (c.cycle === 'monthly') return acc + c.amount;
        return acc + (c.amount / 12);
    }, 0);

    return (
        <div className="min-h-screen bg-[#0c0a09] text-stone-200 font-sans selection:bg-red-900/30 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-[#0c0a09]/95 backdrop-blur-md border-b border-[#292524] px-4 py-3 flex items-center gap-3 shadow-lg">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1917] hover:bg-[#292524] text-stone-400 transition-colors active:scale-95"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-bold bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent">
                    {t('mercenary_contracts', 'Contratos Mercenarios')}
                </h1>
            </header>

            <main className="p-4 space-y-6 max-w-md mx-auto w-full">

                {/* Visual Summary */}
                <div className="fantasy-card bg-gradient-to-br from-[#1c1917] to-[#0c0a09] border-red-900/30 p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-xs uppercase tracking-widest text-red-400 font-bold mb-1 block">Tributo Mensual Total</span>
                        <div className="text-3xl font-black text-stone-200">
                            {totalMonthly.toFixed(2)} <span className="text-sm text-stone-500 font-normal">/ mes</span>
                        </div>
                    </div>
                    <Scroll className="absolute -right-4 -bottom-4 text-red-900/20 w-32 h-32" />
                </div>

                {/* List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Contratos Activos</h2>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="text-xs bg-red-900/20 text-red-400 px-3 py-1 rounded hover:bg-red-900/40 transition-colors flex items-center gap-1"
                        >
                            <Plus size={14} /> Nuevo Pacto
                        </button>
                    </div>

                    {isAdding && (
                        <form onSubmit={handleAdd} className="fantasy-card p-4 animate-in fade-in slide-in-from-top-4 border-red-500/30">
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nombre del Mercenario (ej. Netflix)"
                                    className="w-full bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-red-500 outline-none transition-colors"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Coste"
                                        className="w-full bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-red-500 outline-none transition-colors"
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(e.target.value)}
                                    />
                                    <select
                                        className="bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-red-500 outline-none"
                                        value={newCycle}
                                        onChange={(e) => setNewCycle(e.target.value as any)}
                                    >
                                        <option value="monthly">Mensual</option>
                                        <option value="yearly">Anual</option>
                                    </select>
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
                                        className="text-xs bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors shadow-[0_0_10px_rgba(220,38,38,0.4)]"
                                    >
                                        Firmar Contrato
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {contracts.length === 0 ? (
                        <div className="text-center py-10 text-stone-600">
                            <Scroll className="mx-auto w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm">No tienes contratos activos.</p>
                            <p className="text-xs">¡Eres libre!</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {contracts.map(contract => (
                                <div key={contract.id} className="fantasy-card p-4 flex justify-between items-center group hover:border-red-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-[#1c1917] flex items-center justify-center border border-stone-800 text-stone-400">
                                            {contract.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-200">{contract.name}</h3>
                                            <p className="text-[10px] text-stone-500 uppercase tracking-wider flex items-center gap-1">
                                                <Calendar size={10} /> {contract.cycle === 'monthly' ? 'Cada Luna' : 'Cada Año'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-red-400">-{contract.amount}</span>
                                        <button
                                            onClick={() => handleDelete(contract.id)}
                                            className="text-stone-600 hover:text-red-500 transition-colors p-2"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
