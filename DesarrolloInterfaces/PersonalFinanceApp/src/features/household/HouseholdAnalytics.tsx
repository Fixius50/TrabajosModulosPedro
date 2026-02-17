
import { useState, useEffect } from 'react';
import { householdService } from '../../services/householdService';
import { BarChart3, Filter, Calendar, User as UserIcon, TrendingUp, PieChart } from 'lucide-react';

interface Props {
    householdId: string;
}

export default function HouseholdAnalytics({ householdId }: Props) {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: 'all'
    });

    useEffect(() => {
        loadStats();
    }, [householdId, filters]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const data = await householdService.getMemberStats(householdId, filters);
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Filters Section */}
            <div className="fantasy-card p-4 bg-stone-900/40 border-primary/20">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-stone-400">
                        <Filter size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Filtros</span>
                    </div>

                    <div className="flex items-center gap-2 bg-black/30 p-1 rounded-lg border border-white/5">
                        <Calendar size={14} className="text-primary/60 ml-2" />
                        <input
                            type="date"
                            className="bg-transparent text-xs text-stone-300 outline-none p-1"
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                        <span className="text-stone-600">to</span>
                        <input
                            type="date"
                            className="bg-transparent text-xs text-stone-300 outline-none p-1"
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>

                    <select
                        className="bg-black/30 border border-white/5 rounded-lg text-xs text-stone-300 p-2 outline-none focus:border-primary/50"
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                        <option value="all">Todas las Categorías</option>
                        <option value="comida">Comida</option>
                        <option value="transporte">Transporte</option>
                        <option value="hogar">Hogar</option>
                        <option value="ocio">Ocio</option>
                        <option value="marketplace">Marketplace</option>
                    </select>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full h-40 flex items-center justify-center text-stone-500 animate-pulse">
                        Calculando registros del gremio...
                    </div>
                ) : stats.length === 0 ? (
                    <div className="col-span-full h-40 flex flex-col items-center justify-center text-stone-500 border border-dashed border-stone-800 rounded-xl">
                        <PieChart size={40} className="mb-2 opacity-20" />
                        <p>No hay registros para este periodo</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Chart (Simplified) */}
                        <div className="fantasy-card p-6 flex flex-col items-center justify-center text-center">
                            <TrendingUp size={32} className="text-emerald-400 mb-2" />
                            <h4 className="text-sm font-bold text-stone-400 uppercase tracking-tighter">Total Gasto del Grupo</h4>
                            <span className="text-4xl font-bold text-white mt-1">
                                {stats.reduce((acc, s) => acc + s.total, 0).toLocaleString()} <span className="text-primary text-sm">G</span>
                            </span>
                        </div>

                        {/* Leaderboard Chart (Simplified as List) */}
                        <div className="fantasy-card p-0 overflow-hidden">
                            <div className="bg-stone-900/50 p-3 border-b border-white/5 flex items-center gap-2">
                                <BarChart3 size={16} className="text-primary" />
                                <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Contribución por Aventurero</span>
                            </div>
                            <div className="p-4 space-y-4">
                                {stats.map((s, i) => (
                                    <div key={s.userId} className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/20 bg-stone-800">
                                                    {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" /> : <UserIcon size={12} className="text-stone-500 m-1.5" />}
                                                </div>
                                                <span className="font-bold text-stone-200">{s.username}</span>
                                            </div>
                                            <span className="font-mono text-primary">{s.total.toLocaleString()} G</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${i === 0 ? 'bg-primary shadow-[0_0_8px_rgba(244,192,37,0.4)]' : 'bg-stone-600'}`}
                                                style={{ width: `${(s.total / stats[0].total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Category breakdown for the household (General) */}
                        <div className="fantasy-card col-span-full p-4">
                            <h4 className="text-xs font-bold text-stone-500 uppercase mb-4 pl-1">Desglose por Categoría</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Array.from(new Set(stats.flatMap(s => Object.keys(s.categories)))).map(cat => {
                                    const totalCat = stats.reduce((acc, s) => acc + (s.categories[cat] || 0), 0);
                                    return (
                                        <div key={cat} className="bg-black/20 p-3 rounded-lg border border-white/5 text-center">
                                            <span className="text-[0.625rem] uppercase text-stone-500 block">{cat}</span>
                                            <span className="text-sm font-bold text-stone-200">{totalCat.toLocaleString()} G</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
