
import { useState } from 'react';
import './fantasy.css';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { transactionService } from '../../services/transactionService';

import { useStealth } from '../../context/StealthContext';
import { storageService } from '../../services/storageService';


import QuestBoard from './QuestBoard';

export default function GrimoireDashboard() {
    const { t } = useTranslation();

    const { formatAmount } = useStealth();

    // Tabs: 'dashboard' | 'quests'
    const [activeTab, setActiveTab] = useState<'dashboard' | 'quests'>('dashboard');

    const { data: transactions } = useQuery({
        queryKey: ['transactions'],
        queryFn: transactionService.getTransactions,
    });

    const { data: budgets } = useQuery({
        queryKey: ['budgets'],
        queryFn: () => storageService.getBudgets(),
    });



    const totalBalance = transactions?.reduce((acc: number, curr: any) => {
        const isExpense = curr.categories?.type === 'expense';
        return acc + (isExpense ? -curr.amount : curr.amount);
    }, 0) || 0;



    return (
        <div className="fantasy-theme">
            {/* Mobile Container */}
            <div className="fantasy-container leather-texture w-full flex flex-col min-h-[calc(100vh-6rem)]">

                {/* Header */}
                <header className="fantasy-header pt-4 pb-2 px-6 relative z-50 bg-[#0c0b06]/95 backdrop-blur-sm border-b border-primary/10">
                    {/* Corner Decors */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-sm opacity-50"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-sm opacity-50"></div>

                    <div className="relative flex items-center justify-center">
                        <div className="flex flex-col items-center z-10">
                            <h1 className="text-3xl font-bold tracking-tight text-primary runic-glow uppercase italic">{t('dashboard', 'Grimorio')}</h1>

                            {/* Navigation Tabs (Mini) */}
                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`text-[10px] uppercase tracking-[0.2em] transition-colors ${activeTab === 'dashboard' ? 'text-primary font-bold border-b border-primary' : 'text-stone-500 hover:text-stone-300'}`}
                                >
                                    Balance
                                </button>
                                <button
                                    onClick={() => setActiveTab('quests')}
                                    className={`text-[10px] uppercase tracking-[0.2em] transition-colors ${activeTab === 'quests' ? 'text-primary font-bold border-b border-primary' : 'text-stone-500 hover:text-stone-300'}`}
                                >
                                    Misiones
                                </button>
                            </div>

                            {/* Marketplace Link (Replaces Dropdown) */}
                            <Link
                                to="/marketplace"
                                className="mt-2 flex items-center gap-1 text-stone-500 hover:text-primary transition-colors active:scale-95"
                                title={t('marketplace', 'Mercado')}
                            >
                                <span className="material-icons text-base">storefront</span>
                                <span className="text-[10px] uppercase tracking-widest font-bold">Mercado</span>
                            </Link>
                        </div>

                        {/* Profile Button (Absolute Right) */}
                        <Link to="/adventurer-license" className="absolute right-0 top-2 w-10 h-10 rounded-lg bg-stone-800/80 border border-primary/20 flex items-center justify-center hover:bg-stone-700 transition-colors shadow-lg">
                            <span className="material-icons text-primary/80 text-xl">account_circle</span>
                        </Link>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 px-6 py-4 space-y-8">

                    {activeTab === 'quests' ? (
                        <QuestBoard />
                    ) : (
                        <>
                            {/* DASHBOARD CONTENT */}

                            {/* Net Worth */}
                            <section>
                                <h2 className="text-xs uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    {t('net_worth')}
                                </h2>
                                <div className="relative fantasy-card h-48 overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-full h-full opacity-60" viewBox="0 0 200 100">
                                            <path className="opacity-80" d="M 0 20 Q 50 20 100 50" fill="none" stroke="#ecb613" strokeWidth="3"></path>
                                            <path className="opacity-40" d="M 0 35 Q 50 35 100 50" fill="none" stroke="#ecb613" strokeWidth="1.5"></path>
                                            <path className="opacity-80" d="M 200 20 Q 150 20 100 50" fill="none" stroke="#7b1d1d" strokeWidth="3"></path>
                                            <path className="opacity-40" d="M 200 35 Q 150 35 100 50" fill="none" stroke="#7b1d1d" strokeWidth="1.5"></path>
                                            <circle className="animate-pulse" cx="100" cy="50" fill="#ecb613" r="12"></circle>
                                        </svg>
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                        <span className="text-stone-500 text-xs uppercase tracking-tighter">{t('current_net_worth')}</span>
                                        <div className="text-4xl font-bold text-white tracking-widest my-1">
                                            {formatAmount(totalBalance)}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Budgets */}
                            <section>
                                <h2 className="text-xs uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    {t('budgets')}
                                </h2>
                                {budgets && budgets.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-4">
                                        {budgets.slice(0, 3).map((budget) => {
                                            const fillPercent = Math.min((budget.spent / budget.limit) * 100, 100);
                                            const isWarning = fillPercent > 80;
                                            const colorClass = isWarning ? 'bg-orange-500' : 'bg-mana-blue';

                                            return (
                                                <div key={budget.id} className="flex flex-col items-center gap-2">
                                                    <div className="w-16 h-16 rounded-full border-2 border-stone-600 bg-stone-900/80 relative overflow-hidden shadow-inner">
                                                        <div
                                                            className={`absolute bottom-0 left-0 right-0 ${colorClass} opacity-80 transition-all duration-1000 vial-gradient`}
                                                            style={{ height: `${fillPercent}%` }}
                                                        ></div>
                                                        <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                                                    </div>
                                                    <span className="text-[0.625rem] uppercase font-bold tracking-wider opacity-60 truncate w-full text-center">{budget.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="fantasy-card p-4 text-center bg-stone-900/50 border-stone-800">
                                        <div className="w-10 h-10 rounded-full bg-stone-800 mx-auto mb-2 flex items-center justify-center opacity-50">
                                            <span className="material-icons text-stone-600 text-xl">savings</span>
                                        </div>
                                        <p className="text-[0.625rem] text-stone-500 uppercase tracking-widest">Sin presupuestos activos</p>
                                    </div>
                                )}
                            </section>

                            {/* Quick Access */}
                            <section>
                                <h2 className="text-xs uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    {t('household_management', 'Gestión del Hogar')}
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <Link to="/household" className="fantasy-card p-4 flex items-center gap-3 group hover:border-primary/50 transition-all active:scale-95 bg-primary/5 border-primary/20">
                                        <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <span className="material-icons text-primary/80 group-hover:text-primary">home</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-stone-200">Mi Hogar</h3>
                                            <p className="text-[0.625rem] text-stone-500 uppercase tracking-wider">Gestionar Grupo</p>
                                        </div>
                                    </Link>

                                    <Link to="/debt-tracker" className="fantasy-card p-4 flex items-center gap-3 group hover:border-primary/50 transition-all active:scale-95">
                                        <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-[#5c4033] flex items-center justify-center group-hover:bg-[#5c4033] transition-colors">
                                            <span className="material-icons text-primary/80 group-hover:text-white">receipt_long</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-stone-200">Deudas</h3>
                                            <p className="text-[0.625rem] text-stone-500 uppercase tracking-wider">Splitwise</p>
                                        </div>
                                    </Link>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xs uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    {t('recent_scrolls')}
                                </h2>
                                <div className="space-y-3">
                                    {transactions?.slice(0, 5).map((t: any) => (
                                        <div key={t.id} className="fantasy-card flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center text-lg border border-white/5">
                                                    {t.categories?.icon || '📄'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-white/90">{t.description}</h4>
                                                    <p className="text-[0.625rem] uppercase text-stone-500">{t.categories?.name}</p>
                                                </div>
                                            </div>
                                            <span className={`font-mono font-bold text-sm ${t.categories?.type === 'expense' ? 'text-stone-300' : 'text-primary'}`}>
                                                {formatAmount(t.amount, '')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div >
        </div >
    );
}
