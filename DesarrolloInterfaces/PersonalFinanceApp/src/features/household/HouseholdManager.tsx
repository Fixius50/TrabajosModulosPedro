import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { householdService, Household, HouseholdMember } from '../../services/householdService';
import { Users, Plus, LogIn, Crown, Shield, Copy, Check, ArrowLeft } from 'lucide-react';

export default function HouseholdManager() {
    const { t } = useTranslation();
    const [households, setHouseholds] = useState<Household[]>([]);
    const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
    const [members, setMembers] = useState<HouseholdMember[]>([]);
    const [loading, setLoading] = useState(true);

    // Forms
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [newHouseholdName, setNewHouseholdName] = useState('');
    const [joinHouseholdId, setJoinHouseholdId] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadHouseholds();
    }, []);

    useEffect(() => {
        if (selectedHousehold) {
            loadMembers(selectedHousehold.id);
        }
    }, [selectedHousehold]);

    const loadHouseholds = async () => {
        try {
            setLoading(true);
            const data = await householdService.getMyHouseholds();
            setHouseholds(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async (householdId: string) => {
        try {
            const members = await householdService.getHouseholdMembers(householdId);
            setMembers(members);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await householdService.createHousehold(newHouseholdName);
            setIsCreating(false);
            setNewHouseholdName('');
            loadHouseholds();
        } catch (error) {
            console.error(error);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await householdService.joinHousehold(joinHouseholdId);
            setIsJoining(false);
            setJoinHouseholdId('');
            loadHouseholds();
        } catch (error) {
            console.error(error);
            alert("Error al unirse. Verifica el ID.");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading && households.length === 0) return <div className="p-4 text-center text-stone-500 animate-pulse">Cargando datos del hogar...</div>;

    // DETAIL VIEW
    if (selectedHousehold) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                <header className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedHousehold(null)}
                        className="p-2 rounded-full hover:bg-white/5 text-stone-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-primary">{selectedHousehold.name}</h2>
                        <p className="text-xs text-stone-500 font-mono">ID: {selectedHousehold.id}</p>
                    </div>
                    <div className="ml-auto">
                        <div className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                            {selectedHousehold.currency}
                        </div>
                    </div>
                </header>

                {/* Stats / Overview Mockup */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="fantasy-card p-4 bg-[#1c1917]">
                        <span className="text-xs uppercase font-bold text-stone-500 block mb-1">Total Balance</span>
                        <span className="text-xl font-bold text-emerald-400">Todo: $0</span>
                    </div>
                    <div className="fantasy-card p-4 bg-[#1c1917]">
                        <span className="text-xs uppercase font-bold text-stone-500 block mb-1">Members</span>
                        <span className="text-xl font-bold text-stone-300">{members.length}</span>
                    </div>
                </div>

                {/* Members List */}
                <div className="fantasy-card p-0 overflow-hidden">
                    <div className="bg-stone-900/50 p-3 border-b border-white/5">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Squad Members</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {members.map((member) => (
                            <div key={member.id} className="p-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center overflow-hidden">
                                    {member.profile?.avatar_url ? (
                                        <img src={member.profile.avatar_url} alt={member.profile.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <Users size={14} className="text-stone-500" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <div className="text-sm font-bold text-stone-200">
                                        {member.profile?.username || 'Usuario desconocido'}
                                    </div>
                                    <div className="text-[10px] text-stone-500 uppercase flex items-center gap-1">
                                        {member.role === 'admin' ? (
                                            <span className="text-gold flex items-center gap-0.5"><Crown size={10} /> Admin</span>
                                        ) : (
                                            <span className="text-stone-500 flex items-center gap-0.5"><Shield size={10} /> Member</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Copy ID Section */}
                    <div className="p-3 bg-stone-900/30 border-t border-white/5">
                        <div className="flex items-center justify-between gap-2 p-2 rounded border border-dashed border-stone-700 bg-black/20">
                            <span className="text-xs font-mono text-stone-500 truncate max-w-[200px]">
                                {selectedHousehold.id}
                            </span>
                            <button
                                onClick={() => copyToClipboard(selectedHousehold.id)}
                                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // MAIN LIST WIDGET
    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Users size={24} />
                    {t('my_households', 'Mis Hogares')}
                </h2>
            </header>

            {/* List of Cards */}
            <div className="grid grid-cols-1 gap-4">
                {households.map(h => (
                    <div
                        key={h.id}
                        onClick={() => setSelectedHousehold(h)}
                        className="fantasy-card p-4 hover:bg-white/5 cursor-pointer flex justify-between items-center group transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 border border-white/10 flex items-center justify-center text-stone-500 group-hover:text-primary transition-colors">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-200 group-hover:text-primary transition-colors">{h.name}</h3>
                                <p className="text-xs text-stone-500">ID: ...{h.id.slice(-4)}</p>
                            </div>
                        </div>
                        <div className="text-stone-600 group-hover:text-primary/50">
                            <ArrowLeft className="rotate-180" size={20} />
                        </div>
                    </div>
                ))}

                {/* Create/Join Actions */}
                {!isCreating && !isJoining && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="p-4 rounded-xl border border-dashed border-stone-700 text-stone-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
                        >
                            <Plus size={24} />
                            <span className="text-xs font-bold uppercase">Crear Nuevo</span>
                        </button>
                        <button
                            onClick={() => setIsJoining(true)}
                            className="p-4 rounded-xl border border-dashed border-stone-700 text-stone-500 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-2"
                        >
                            <LogIn size={24} />
                            <span className="text-xs font-bold uppercase">Unirse con ID</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Create Form */}
            {isCreating && (
                <form onSubmit={handleCreate} className="fantasy-card p-4 animate-in fade-in slide-in-from-top-4 mt-4">
                    <h3 className="text-sm font-bold text-stone-300 mb-3">Crear Nuevo Hogar</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newHouseholdName}
                            onChange={(e) => setNewHouseholdName(e.target.value)}
                            placeholder="Nombre (ej. Casa Madrid)"
                            className="bg-stone-900 border border-stone-700 text-white rounded p-2 flex-grow focus:border-primary outline-none"
                            autoFocus
                        />
                        <button type="submit" className="bg-primary text-black font-bold px-4 rounded hover:bg-primary/90">
                            Crear
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="text-xs text-stone-500 mt-2 hover:text-stone-300 underline"
                    >
                        Cancelar
                    </button>
                </form>
            )}

            {/* Join Form */}
            {isJoining && (
                <form onSubmit={handleJoin} className="fantasy-card p-4 animate-in fade-in slide-in-from-top-4 border-l-4 border-blue-500 mt-4">
                    <h3 className="text-sm font-bold text-stone-300 mb-3">Unirse a Hogar existente</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={joinHouseholdId}
                            onChange={(e) => setJoinHouseholdId(e.target.value)}
                            placeholder="ID del Hogar"
                            className="bg-stone-900 border border-stone-700 text-white rounded p-2 flex-grow focus:border-blue-500 outline-none font-mono text-sm"
                            autoFocus
                        />
                        <button type="submit" className="bg-blue-600 text-white font-bold px-4 rounded hover:bg-blue-700">
                            Unirse
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsJoining(false)}
                        className="text-xs text-stone-500 mt-2 hover:text-stone-300 underline"
                    >
                        Cancelar
                    </button>
                </form>
            )}
        </div>
    );
}
