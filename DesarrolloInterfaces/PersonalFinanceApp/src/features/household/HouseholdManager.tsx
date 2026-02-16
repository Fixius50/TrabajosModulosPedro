import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { householdService, Household, HouseholdMember } from '../../services/householdService';
import { Users, Plus, LogIn, Crown, Shield, Copy, Check } from 'lucide-react';

export default function HouseholdManager() {
    const { t } = useTranslation();
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
            const households = await householdService.getMyHouseholds();
            if (households.length > 0) {
                setSelectedHousehold(households[0]);
            }
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

    if (loading) return <div className="p-4 text-center text-stone-500 animate-pulse">Cargando datos del hogar...</div>;

    return (
        <div className="space-y-6">

            {/* Header / Selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Users size={24} />
                    {selectedHousehold ? selectedHousehold.name : t('my_households', 'Mis Hogares')}
                </h2>

                {!isCreating && !isJoining && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsJoining(true)}
                            className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white transition-colors"
                            title="Unirse a un hogar"
                        >
                            <LogIn size={20} />
                        </button>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            title="Crear nuevo hogar"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Create Form */}
            {isCreating && (
                <form onSubmit={handleCreate} className="fantasy-card p-4 animate-in fade-in slide-in-from-top-4">
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
                <form onSubmit={handleJoin} className="fantasy-card p-4 animate-in fade-in slide-in-from-top-4 border-l-4 border-blue-500">
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

            {/* Empty State */}
            {!selectedHousehold && !isCreating && !isJoining && (
                <div className="text-center py-8 text-stone-500 border border-dashed border-stone-800 rounded-xl">
                    <p className="mb-4">No perteneces a ningún hogar aún.</p>
                    <p className="text-xs">Crea uno para compartir gastos o únete con un ID.</p>
                </div>
            )}

            {/* Members List */}
            {selectedHousehold && (
                <div className="fantasy-card p-0 overflow-hidden">
                    <div className="bg-stone-900/50 p-3 border-b border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Miembros ({members.length})</span>
                        <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                            MONEDA: {selectedHousehold.currency}
                        </div>
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
                                            <span className="text-stone-500 flex items-center gap-0.5"><Shield size={10} /> Miembro</span>
                                        )}
                                        <span>• Unido: {new Date(member.joined_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Copy ID Section */}
                    <div className="p-3 bg-stone-900/30 border-t border-white/5">
                        <div className="flex items-center justify-between gap-2 p-2 rounded border border-dashed border-stone-700 bg-black/20">
                            <span className="text-xs font-mono text-stone-500 truncate max-w-[200px]">
                                ID: {selectedHousehold.id}
                            </span>
                            <button
                                onClick={() => copyToClipboard(selectedHousehold.id)}
                                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copiado' : 'Copiar ID'}
                            </button>
                        </div>
                        <p className="text-[10px] text-stone-600 mt-2 text-center">
                            Comparte este ID para invitar a otros miembros.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
