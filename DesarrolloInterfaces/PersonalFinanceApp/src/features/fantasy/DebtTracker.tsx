import React, { useState, useEffect } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';
import { storageService, type Debt } from '../../services/storageService';
import { gamificationService } from '../../services/gamificationService';
import { ArrowLeft, Plus, Trash2, Skull, HandCoins, ScrollText, Search, User, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DebtTracker() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'owed_to_me' | 'i_owe'>('all');

    // Form State
    const [newName, setNewName] = useState('');
    const [partnerId, setPartnerId] = useState(''); // New field for User ID
    const [newAmount, setNewAmount] = useState('');
    const [newType, setNewType] = useState<'owed_to_me' | 'i_owe'>('i_owe');

    useEffect(() => {
        setDebts(storageService.getDebts());
    }, []);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newAmount) return;

        const newDebt: Debt = {
            id: crypto.randomUUID(),
            name: newName,
            role: partnerId || 'Unknown',
            amount: parseFloat(newAmount),
            type: newType,
            dueDate: new Date().toISOString()
        };

        storageService.addDebt(newDebt);
        setDebts(storageService.getDebts());
        setIsAdding(false);
        setNewName('');
        setPartnerId('');
        setNewAmount('');

        if (newType === 'i_owe') {
            gamificationService.awardXP(10, "Debt Recorded");
        }
    };

    const handleSettleDebt = (id: string, amount: number, type: 'owed_to_me' | 'i_owe') => {
        if (!confirm(t('confirm_settle', '¿Sellar este pacto para siempre?'))) return;

        storageService.removeDebt(id);
        setDebts(storageService.getDebts());

        if (type === 'owed_to_me') {
            gamificationService.awardXP(50, "Tribute Received");
            gamificationService.awardGold(amount, "Tribute Collected");
        } else {
            gamificationService.awardXP(100, "Burden Lifted");
        }
    };

    const filteredDebts = debts.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.role && d.role.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || d.type === filterType;
        return matchesSearch && matchesType;
    });

    const totalTribute = debts
        .filter(d => d.type === 'owed_to_me')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const totalBurden = debts
        .filter(d => d.type === 'i_owe')
        .reduce((acc, curr) => acc + curr.amount, 0);

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
                    {t('debt_tracker', 'Rastreador de Deudas')}
                </h1>
            </header>

            <main className="p-4 space-y-6 max-w-md mx-auto w-full">

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="fantasy-card p-4 text-center border-emerald-900/30 bg-[#1c1917]">
                        <span className="text-xs uppercase font-bold text-stone-500 block tracking-wider mb-1">Tributos</span>
                        <span className="text-emerald-400 text-xl font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.3)] truncate block">
                            +{totalTribute.toLocaleString()}
                        </span>
                    </div>
                    <div className="fantasy-card p-4 text-center border-red-900/30 bg-[#1c1917]">
                        <span className="text-xs uppercase font-bold text-stone-500 block tracking-wider mb-1">Cargas</span>
                        <span className="text-red-500 text-xl font-bold drop-shadow-[0_0_5px_rgba(239,68,68,0.3)] truncate block">
                            -{totalBurden.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Controls & List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                            <ScrollText size={14} /> Contratos
                        </h2>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="text-xs bg-red-900/20 text-red-400 px-3 py-1 rounded hover:bg-red-900/40 transition-colors flex items-center gap-1"
                        >
                            <Plus size={14} /> Nuevo Pacto
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar deuda..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1c1917] border border-stone-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-red-500/50 outline-none text-stone-300 placeholder:text-stone-600"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-400"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-[#1c1917] p-1 rounded-lg border border-stone-800">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-all ${filterType === 'all' ? 'bg-stone-700 text-stone-200 shadow' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilterType('owed_to_me')}
                        className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-all ${filterType === 'owed_to_me' ? 'bg-emerald-900/30 text-emerald-400 shadow border border-emerald-900/50' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        Tributos
                    </button>
                    <button
                        onClick={() => setFilterType('i_owe')}
                        className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-all ${filterType === 'i_owe' ? 'bg-red-900/30 text-red-400 shadow border border-red-900/50' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        Cargas
                    </button>
                </div>

                {/* Add Form */}
                {isAdding && (
                    <form onSubmit={handleAdd} className="fantasy-card p-4 animate-in fade-in slide-in-from-top-4 border-red-500/30">
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Nombre de la entidad"
                                className="w-full bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-red-500 outline-none transition-colors"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                autoFocus
                            />
                            <div className="relative">
                                <User className="absolute left-2 top-2 text-stone-600" size={14} />
                                <input
                                    type="text"
                                    placeholder="Nombre de la Persona (o ID)"
                                    className="w-full bg-[#0c0a09] border border-stone-800 rounded p-2 pl-7 text-xs focus:border-red-500 outline-none transition-colors"
                                    value={partnerId}
                                    onChange={(e) => setPartnerId(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    className="w-full bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-red-500 outline-none transition-colors"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                />
                                <select
                                    className="bg-[#0c0a09] border border-stone-800 rounded p-2 text-sm focus:border-red-500 outline-none"
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value as any)}
                                >
                                    <option value="i_owe">Debo</option>
                                    <option value="owed_to_me">Me deben</option>
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
                                    Firmar
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Debt List */}
                <div className="space-y-3">
                    {filteredDebts.length === 0 ? (
                        <div className="text-center py-10 text-stone-600">
                            <HandCoins className="mx-auto w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm">No se encontraron deudas.</p>
                        </div>
                    ) : (
                        filteredDebts.map(debt => (
                            <div key={debt.id} className="fantasy-card p-4 flex justify-between items-center group hover:border-red-500/30 transition-all bg-[#1c1917]">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${debt.type === 'owed_to_me' ? 'border-emerald-900 bg-emerald-900/20 text-emerald-400' : 'border-red-900 bg-red-900/20 text-red-400'}`}>
                                        {debt.type === 'owed_to_me' ? <HandCoins size={18} /> : <Skull size={18} />}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-stone-200 truncate">{debt.name}</h3>
                                        <p className="text-[10px] text-stone-500 uppercase tracking-widest truncate">
                                            {debt.role && debt.role !== 'Unknown' ? debt.role : (debt.type === 'owed_to_me' ? 'Tributo' : 'Carga')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                    <span className={`font-mono font-bold block truncate max-w-[100px] ${debt.type === 'owed_to_me' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {debt.type === 'owed_to_me' ? '+' : '-'}{debt.amount}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSettleDebt(debt.id, debt.amount, debt.type);
                                        }}
                                        className="text-[10px] uppercase font-bold text-stone-500 hover:text-red-400 transition-colors mt-1 flex items-center gap-1 justify-end ml-auto"
                                    >
                                        <Trash2 size={12} /> Saldar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </main>
        </div>
    );
}
