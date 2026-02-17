import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, TrendingUp, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function FinancialScore() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { profile } = useUserProfile();
    // We calculate score based on profile stats + mock logic that we will replace with real transaction analysis

    const [score, setScore] = useState(0);
    const [rank, setRank] = useState('Novice');

    // Calculate Score based on Net Worth and XP
    useEffect(() => {
        if (profile) {
            // Algorithm: 
            // Base score 300
            // + 1 point per 10 Gold (capped at 200)
            // + 1 point per 5 WealthXP (capped at 300)
            // + Bonus for quests completed

            const goldScore = Math.min((profile.stats.goldEarned || 0) / 10, 200);
            const xpScore = Math.min((profile.stats.wealthXP || 0) / 5, 350);
            const questScore = (profile.stats.questsCompleted || 0) * 10;

            const totalScore = Math.min(Math.round(300 + goldScore + xpScore + questScore), 850);
            setScore(totalScore);

            if (totalScore >= 800) setRank('Legend');
            else if (totalScore >= 700) setRank('Epic');
            else if (totalScore >= 600) setRank('Rare');
            else if (totalScore >= 500) setRank('Uncommon');
            else setRank('Common');
        }
    }, [profile]);

    const getScoreColor = (s: number) => {
        if (s >= 800) return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
        if (s >= 700) return 'text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]';
        if (s >= 600) return 'text-blue-400';
        if (s >= 500) return 'text-green-400';
        return 'text-stone-400';
    };

    return (
        <div className="min-h-screen bg-[#0c0a09] text-stone-200 font-sans selection:bg-primary/30 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-[#0c0a09]/95 backdrop-blur-md border-b border-[#292524] px-4 py-3 flex items-center gap-3 shadow-lg">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1917] hover:bg-[#292524] text-stone-400 transition-colors active:scale-95"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t('hero_score', 'Puntuación de Héroe')}
                </h1>
            </header>

            <main className="p-4 space-y-6 max-w-md mx-auto w-full">

                {/* Score Circle */}
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {/* Background Ring */}
                        <div className="absolute inset-0 rounded-full border-8 border-[#1c1917]"></div>
                        {/* Progress Ring (Pseudo-calculated visual) */}
                        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                            <circle
                                cx="50%" cy="50%" r="88"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray="552"
                                strokeDashoffset={552 - (552 * score) / 850}
                                className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
                                strokeLinecap="round"
                            />
                        </svg>

                        <div className="text-center z-10">
                            <span className={`block text-5xl font-black tracking-tighter ${getScoreColor(score)}`}>
                                {score}
                            </span>
                            <span className="text-xs uppercase tracking-widest text-stone-500 font-bold mt-1">
                                {rank}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="fantasy-card p-4 flex flex-col items-center text-center gap-2">
                        <TrendingUp size={24} className="text-green-400" />
                        <div>
                            <span className="text-sm font-bold text-stone-200 block">Ingresos Constantes</span>
                            <span className="text-[0.625rem] text-stone-500">Basado en tus registros</span>
                        </div>
                    </div>
                    <div className="fantasy-card p-4 flex flex-col items-center text-center gap-2">
                        <Shield size={24} className="text-blue-400" />
                        <div>
                            <span className="text-sm font-bold text-stone-200 block">Baja Deuda</span>
                            <span className="text-[0.625rem] text-stone-500">Control de gastos</span>
                        </div>
                    </div>
                </div>

                {/* Insights / Recommendations */}
                <section className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest text-primary/70 font-bold flex items-center gap-2">
                        <Award size={14} />
                        Misiones para Mejorar
                    </h3>

                    <div className="fantasy-card p-4 border-l-4 border-l-primary flex gap-3">
                        <div className="mt-1">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-stone-200">Aumenta tu Ahorro</h4>
                            <p className="text-xs text-stone-400 mt-1">
                                Guarda 50 monedas más este mes para subir al rango {rank === 'Legend' ? 'Divine' : 'Superior'}.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
