import { useState, useEffect } from 'react';
import './fantasy.css';
import { useNavigate } from 'react-router-dom';
import { storageService, type FinancialScoreData } from '../../services/storageService';

export default function FinancialScore() {
    const navigate = useNavigate();
    const [data, setData] = useState<FinancialScoreData | null>(null);
    const [netWorth, setNetWorth] = useState(0);
    const [currentAnimatedScore, setCurrentAnimatedScore] = useState(0);

    useEffect(() => {
        const scoreData = storageService.getFinancialScore();
        const profile = storageService.getUserProfile();
        setData(scoreData);
        setNetWorth(profile.stats.netWorth || 0);

        // Animate score
        const targetScore = scoreData.currentScore;
        const duration = 1500;
        const interval = 10;
        const step = targetScore / (duration / interval);

        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= targetScore) {
                setCurrentAnimatedScore(targetScore);
                clearInterval(timer);
            } else {
                setCurrentAnimatedScore(Math.floor(current));
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    // Calculate stroke dashoffset for the circle
    // r=45, circumference = 2 * pi * 45 ≈ 283
    const circumference = 283;
    const progress = currentAnimatedScore / 1000;
    const dashoffset = circumference - (progress * circumference);

    return (
        <div className="font-display text-primary/90 bg-background-dark min-h-screen flex justify-center items-center overflow-hidden dungeon-bg p-4 selection:bg-primary/30">
            {/* Main Mobile Container */}
            <div className="relative w-full max-w-[24.375rem] h-[52.75rem] bg-background-dark overflow-hidden shadow-2xl border-4 border-[#2d1a1a] flex flex-col items-center rounded-3xl">

                {/* Background Texture: Dungeon Wall */}
                <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
                    <img alt="Dark stone dungeon wall texture" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcvUB_g3vHBe31MHu07hSeReXKY-z4IT4LZjVl901ZYku6j7yygbBtkMY8ufDTesLUqPJ0KASI01BQ41FJB8OHds7ISTHwM4l5zFN-5MQp1IMQlirni7pgmFIni0cLHmCr6yNGdv_mJEaNgTBeYRRAJC1F0TRQIHxpTdISea5Nn00urT2pJ9cX1BcyTJWvkD9ggTiV_ArnxtkR1VbDgp0zHwDLqc2VMxLD-Uyk29Ol3vGfQU9jLfEs37n-66N92XHN_ISEBPzIF9uU" />
                </div>

                {/* Flickering Torchlight Overlay */}
                <div className="absolute inset-0 z-0 bg-gradient-to-tr from-black via-transparent to-primary/10 pointer-events-none"></div>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-12 left-6 z-50 w-10 h-10 rounded-lg border border-primary/20 bg-background-dark/50 flex items-center justify-center text-primary backdrop-blur-sm hover:bg-primary/10 transition-colors"
                >
                    <span className="material-icons">arrow_back</span>
                </button>

                {/* Header Section */}
                <header className="relative z-10 pt-12 px-6 pb-4 flex justify-between items-center w-full mt-8">
                    <div className="flex flex-col">
                        <span className="text-[0.625rem] uppercase tracking-[0.3em] text-primary/60 font-medium">Arcane Financial Log</span>
                        <h1 className="text-2xl font-bold tracking-tight text-primary drop-shadow-[0_0_0.625rem_rgba(244,192,37,0.4)]">HERO SCORE</h1>
                    </div>
                </header>

                {/* Main Score Gauge Section */}
                <main className="relative z-10 px-6 pt-2 flex flex-col items-center w-full">
                    {/* The Ornate Gauge */}
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        {/* Blackened Iron Outer Ring */}
                        <div className="absolute inset-0 rounded-full border-[0.625rem] border-[#221e10] shadow-[inset_0_0_1.25rem_rgba(0,0,0,0.8)]"></div>

                        {/* Arc Progress (SVG) */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            {/* Background Circle */}
                            <circle className="text-primary/10" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="4"></circle>
                            {/* Progress Circle */}
                            <circle
                                className="text-primary transition-all duration-1000 ease-out"
                                cx="50" cy="50"
                                fill="transparent"
                                r="45"
                                stroke="currentColor"
                                strokeDasharray="283"
                                strokeDashoffset={dashoffset}
                                strokeLinecap="round"
                                strokeWidth="4"
                            ></circle>
                        </svg>

                        {/* Rune Markers */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="absolute top-2 text-[0.625rem] text-primary opacity-50">᚛</span>
                            <span className="absolute right-2 text-[0.625rem] text-primary opacity-50">ᚦ</span>
                            <span className="absolute bottom-2 text-[0.625rem] text-primary opacity-50">ᚼ</span>
                            <span className="absolute left-2 text-[0.625rem] text-primary opacity-50">ᚱ</span>
                        </div>

                        {/* Central Magical Flame / Core */}
                        <div className="relative z-20 w-48 h-48 rounded-full bg-gradient-to-b from-primary/20 via-primary/5 to-transparent border border-primary/30 flex flex-col items-center justify-center shadow-[0_0_2.5rem_rgba(244,192,37,0.2)] backdrop-blur-sm">
                            <div className="animate-pulse bg-primary/40 w-16 h-16 blur-2xl absolute rounded-full"></div>
                            <span className="text-5xl font-black text-primary tracking-tighter drop-shadow-lg">{currentAnimatedScore}</span>
                            <span className="text-[10px] uppercase tracking-widest text-primary/60 font-bold mt-1">Excellent Standing</span>

                            {/* Floating Ember Particles */}
                            <div className="absolute top-1/4 w-1 h-1 bg-primary rounded-full blur-[1px] animate-pulse"></div>
                            <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-primary rounded-full blur-[1px] animate-bounce"></div>
                        </div>
                    </div>

                    {/* Net Worth Display */}
                    <div className="w-full mt-6 flex flex-col items-center">
                        <span className="text-[10px] text-primary/60 uppercase font-bold tracking-widest mb-1">Total Net Worth</span>
                        <span className="text-2xl font-black text-primary drop-shadow-[0_0_0.3125rem_rgba(244,192,37,0.5)]">
                            ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-primary/40 italic">(Updated Live)</span>
                    </div>

                    {/* Level Up Experience Bar */}
                    <div className="w-full mt-6 px-4">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-primary/60 uppercase font-bold tracking-widest">Current Tier</span>
                                <span className="text-sm font-bold text-primary">{data?.tier || 'Novice'}</span>
                            </div>
                            <span className="text-[10px] text-primary/60">{data?.currentXP} / {data?.maxXP} XP</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full border border-primary/20 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary/60 to-primary w-[74%] shadow-[0_0_0.625rem_rgba(244,192,37,0.5)]"></div>
                        </div>
                    </div>

                    {/* Sage's Analysis (Scroll) */}
                    <div className="mt-8 w-full bg-[#1c1810]/80 border border-primary/10 rounded-xl p-4 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
                        <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                            <span className="material-icons text-sm">auto_stories</span>
                            Sage's Analysis
                        </h3>
                        <div className="space-y-3">
                            {data?.insights.map((insight, index) => (
                                <div key={index}>
                                    <p className="text-xs text-stone-300 leading-relaxed italic">
                                        "{insight.text}"
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] uppercase tracking-wider text-primary/50">Recommendation:</span>
                                        <span className="text-xs text-white bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{insight.recommendation}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
