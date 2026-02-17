
import React, { useEffect, useState } from 'react';
import { gamificationService, Mission, UserMission } from '../../services/gamificationService';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Lock, Star, Clock, Trophy } from 'lucide-react';

const QuestBoard: React.FC = () => {
    const { user } = useAuth();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [userMissions, setUserMissions] = useState<UserMission[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'daily' | 'achievement'>('daily');

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        // Initialize dailies first
        await gamificationService.initializeDailyMissions(user.id);

        // Fetch all data
        const [allMissions, myMissions] = await Promise.all([
            gamificationService.getMissions(),
            gamificationService.getUserMissions(user.id)
        ]);

        setMissions(allMissions);
        setUserMissions(myMissions);
        setLoading(false);
    };

    const handleClaim = async (missionId: string) => {
        if (!user) return;
        const success = await gamificationService.claimReward(user.id, missionId);
        if (success) {
            loadData(); // Refresh to show completed/claimed status
        }
    };

    // Manual completion for demo/testing
    const handleComplete = async (missionId: string) => {
        if (!user) return;
        await gamificationService.completeMission(user.id, missionId);
        loadData();
    };

    const filteredMissions = missions.filter(m => m.type === activeTab);

    if (loading) return <div className="text-center p-10 text-primary/50 animate-pulse">Consultando el Tablón de Misiones...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 font-display">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between border-b border-primary/20 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary tracking-wider uppercase flex items-center gap-3">
                        <Trophy className="text-primary/60" />
                        Tablón de Misiones
                    </h2>
                    <p className="text-primary/50 text-sm mt-1">Completa contratos para ganar prestigio y fortuna.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('daily')}
                        className={`px-4 py-1 text-xs uppercase tracking-widest rounded border transition-all ${activeTab === 'daily' ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-transparent text-primary/40 hover:text-primary/70'}`}
                    >
                        Diarias
                    </button>
                    <button
                        onClick={() => setActiveTab('achievement')}
                        className={`px-4 py-1 text-xs uppercase tracking-widest rounded border transition-all ${activeTab === 'achievement' ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-transparent text-primary/40 hover:text-primary/70'}`}
                    >
                        Logros
                    </button>
                </div>
            </div>

            {/* Mission Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMissions.map(mission => {
                    const userMission = userMissions.find(um => um.mission_id === mission.id);
                    const status = userMission?.status || 'locked'; // locked if not started/initialized
                    const isCompleted = status === 'completed';
                    const isClaimed = status === 'claimed';
                    const isActive = status === 'active';

                    return (
                        <div key={mission.id} className={`relative p-5 rounded-lg border bg-[#16140d] transition-all duration-300 group
                            ${isClaimed ? 'border-primary/10 opacity-60' : 'border-primary/30 hover:border-primary/60'}
                        `}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full border ${isClaimed ? 'border-primary/10 text-primary/20' : 'border-primary/30 text-primary/80 bg-primary/5'}`}>
                                        {mission.icon === 'footsteps' && <CheckCircle size={18} />}
                                        {mission.icon === 'savings' && <Lock size={18} />}
                                        {mission.icon === 'receipt_long' && <Star size={18} />}
                                        {mission.icon === 'lock' && <Lock size={18} />}
                                        {!['footsteps', 'savings', 'receipt_long', 'lock'].includes(mission.icon) && <Star size={18} />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${isClaimed ? 'text-primary/40' : 'text-primary'}`}>{mission.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-primary/50">
                                            <span className="flex items-center gap-1 text-amber-500/80">
                                                <Star size={10} /> +{mission.reward_points} XP
                                            </span>
                                            {mission.type === 'daily' && (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} /> 24h
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isClaimed && <span className="px-2 py-0.5 rounded border border-primary/20 text-[0.625rem] text-primary/30 uppercase tracking-widest">Reclamado</span>}
                            </div>

                            <p className="text-sm text-primary/60 mb-4 pl-12">
                                {mission.description}
                            </p>

                            {/* Actions */}
                            <div className="pl-12 flex justify-end">
                                {isCompleted && (
                                    <button
                                        onClick={() => handleClaim(mission.id)}
                                        className="px-4 py-1.5 bg-primary text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-amber-400 shadow-[0_0_10px_rgba(244,192,37,0.3)] animate-pulse"
                                    >
                                        Reclamar Recompensa
                                    </button>
                                )}
                                {isActive && (
                                    <button
                                        onClick={() => handleComplete(mission.id)} // DEV ONLY for now
                                        className="px-3 py-1 border border-primary/30 text-primary/40 text-[0.625rem] uppercase hover:text-primary hover:border-primary/60 transition-colors"
                                    >
                                        (Dev: Simular Completar)
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredMissions.length === 0 && (
                <div className="border border-dashed border-primary/20 rounded-xl p-12 text-center text-primary/30">
                    No hay misiones disponibles en esta categoría.
                </div>
            )}
        </div>
    );
};

export default QuestBoard;
