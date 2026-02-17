import { useState } from 'react';
import './fantasy.css';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { transactionService, TransactionWithCategory } from '../../services/transactionService';
import { useStealth } from '../../context/StealthContext';
import { storageService } from '../../services/storageService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import QuestBoard from './QuestBoard';
import { Eye, EyeOff } from 'lucide-react';

export default function GrimoireDashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isStealth, toggleStealth, formatAmount } = useStealth();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'quests'>('dashboard');

    // Data Fetching
    const { data: transactions } = useQuery<TransactionWithCategory[]>({
        queryKey: ['transactions'],
        queryFn: async () => {
            const data = await transactionService.getTransactions();
            return (data || []) as TransactionWithCategory[];
        },
    });

    const { data: budgets } = useQuery({
        queryKey: ['budgets'],
        queryFn: () => storageService.getBudgets(),
    });

    const { data: debts } = useQuery({
        queryKey: ['debts'],
        queryFn: () => storageService.getDebts(),
    });

    const { data: profile, isLoading: loadingProfile } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: () => user ? profileService.getProfile(user.id) : null,
        enabled: !!user,
    });

    // Calculations
    const totalBalance = transactions?.reduce((acc: number, curr: TransactionWithCategory) => {
        const categories = curr.categories as { type?: string } | null;
        const isExpense = categories?.type === 'expense';
        return acc + (isExpense ? -curr.amount : curr.amount);
    }, 0) || 0;

    const totalDebtsOwedToMe = debts?.filter(d => d.type === 'owed_to_me').reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const totalDebtsIOwe = debts?.filter(d => d.type === 'i_owe').reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const totalBudgetSpent = budgets?.reduce((acc, curr) => acc + curr.spent, 0) || 0;

    // Net Worth = Cash + Owed To Me - I Owe
    const netWorth = totalBalance + totalDebtsOwedToMe - totalDebtsIOwe;

    // Chart Data
    const data = [
        { name: 'Balance', value: Math.max(0, totalBalance), color: '#10b981', path: '/transactions' }, // Emerald
        { name: 'Deudas (Cobrar)', value: totalDebtsOwedToMe, color: '#f4c025', path: '/debt-tracker' }, // Gold
        { name: 'Deudas (Pagar)', value: totalDebtsIOwe, color: '#ef4444', path: '/debt-tracker' }, // Red
        { name: 'Presupuestos', value: totalBudgetSpent, color: '#3b82f6', path: '/treasure-chests' }, // Blue
    ].filter(item => item.value > 0);

    // Fallback if no data
    if (data.length === 0) {
        data.push({ name: 'Vacio', value: 100, color: '#292524', path: '#' });
    }

    const onPieClick = (data: { path?: string }) => {
        if (data && data.path && data.path !== '#') {
            navigate(data.path);
        }
    };

    const level = profile ? Math.floor((profile.points || 0) / 1000) + 1 : 1;

    return (
        <div className="fantasy-theme">
            <div className="fantasy-container leather-texture w-full flex flex-col min-h-[calc(100vh-6rem)] pb-24">

                {/* Header: Centered Title only */}
                <header className="pt-4 pb-2 px-6 flex justify-center border-b border-primary/10 bg-[#0c0b06]/95 backdrop-blur-sm sticky top-0 z-50">
                    <h1 className="text-2xl font-bold tracking-tight text-primary runic-glow uppercase italic">{t('dashboard', 'Grimorio')}</h1>
                </header>

                {/* Navigation Tabs */}
                <div className="flex justify-center gap-8 mt-4 border-b border-white/5 pb-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`text-xs uppercase tracking-[0.2em] transition-all pb-2 ${activeTab === 'dashboard' ? 'text-primary font-bold border-b-2 border-primary' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        {t('summary', 'Resumen')}
                    </button>
                    <button
                        onClick={() => setActiveTab('quests')}
                        className={`text-xs uppercase tracking-[0.2em] transition-all pb-2 ${activeTab === 'quests' ? 'text-primary font-bold border-b-2 border-primary' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        {t('quests', 'Misiones')}
                    </button>
                    <Link to="/marketplace" className="text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-amber-400 transition-all pb-2 flex items-center gap-1">
                        {t('marketplace', 'Mercado')}
                    </Link>
                </div>

                <main className="flex-1 px-6 py-6 space-y-8">
                    {activeTab === 'quests' ? <QuestBoard /> : (
                        <>
                            {/* CENTERED PROFILE & NET WORTH */}
                            <section className="flex flex-col items-center justify-center text-center relative">
                                {/* Stealth Toggle (Discrete) */}
                                <button
                                    onClick={toggleStealth}
                                    className="absolute top-0 right-0 p-2 text-stone-600 hover:text-primary transition-colors"
                                    title={isStealth ? t('stealth_off') : t('stealth_on')}
                                >
                                    {isStealth ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>

                                {/* Avatar */}
                                <Link to="/adventurer-license" className="relative group cursor-pointer mb-4">
                                    <div className="w-24 h-24 rounded-full border-2 border-primary/30 p-1 bg-[#16140d] shadow-[0_0_20px_rgba(244,192,37,0.15)] group-hover:border-primary transition-all group-hover:shadow-[0_0_30px_rgba(244,192,37,0.30)]">
                                        <div className="w-full h-full rounded-full overflow-hidden relative">
                                            {loadingProfile ? (
                                                <div className="w-full h-full bg-stone-800 animate-pulse" />
                                            ) : (
                                                <img
                                                    src={profile?.avatar_url || "https://ui-avatars.com/api/?name=Adventurer&background=1c1917&color=f4c025"}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover filter sepia-[0.2] group-hover:sepia-0 transition-all"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#221e10] rounded-full border border-primary/30 flex items-center justify-center shadow-lg">
                                        <span className="text-xs font-bold text-primary">{level}</span>
                                    </div>
                                </Link>

                                {/* Name & Net Worth */}
                                <h2 className="text-lg font-bold text-stone-200 tracking-wide">{profile?.username || t('welcome')}</h2>
                                <p className="text-[0.625rem] text-stone-500 uppercase tracking-widest mb-2">{t('net_worth_label', 'Valor Neto Actual')}</p>
                                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-200 to-primary animate-pulse-slow">
                                    {formatAmount(netWorth)}
                                </div>
                            </section>

                            {/* INTERACTIVE DONUT CHART */}
                            <section className="h-64 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: t('balance', 'Balance'), value: Math.max(0, totalBalance), color: '#10b981', path: '/transactions' },
                                                { name: t('debts_to_collect', 'Deudas (Cobrar)'), value: totalDebtsOwedToMe, color: '#f4c025', path: '/debt-tracker' },
                                                { name: t('debts_to_pay', 'Deudas (Pagar)'), value: totalDebtsIOwe, color: '#ef4444', path: '/debt-tracker' },
                                                { name: t('budgets', 'Cofres'), value: totalBudgetSpent, color: '#3b82f6', path: '/treasure-chests' },
                                            ].filter(item => item.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                            onClick={(data: { payload: { path?: string } }) => onPieClick(data.payload)}
                                            cursor="pointer"
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity outline-none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number | string | undefined) => formatAmount(Number(value || 0))}
                                            contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '0.5rem', color: '#e7e5e4' }}
                                            itemStyle={{ color: '#f4c025' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Center Label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[0.625rem] uppercase text-stone-600 font-bold tracking-widest">{t('finances', 'Finanzas')}</span>
                                </div>
                            </section>

                            {/* QUICK ACTIONS */}
                            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link to="/household" className="fantasy-card p-4 flex items-center gap-3 group hover:border-primary/50 transition-all active:scale-95 bg-stone-900/40 border-stone-800">
                                    <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <span className="material-icons text-primary/80 group-hover:text-primary">home</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-stone-200">{t('my_household', 'Mi Hogar')}</h3>
                                        <p className="text-[0.625rem] text-stone-500 uppercase tracking-wider">{t('management', 'Gestión')}</p>
                                    </div>
                                </Link>

                                <Link to="/debt-tracker" className="fantasy-card p-4 flex items-center gap-3 group hover:border-red-500/50 transition-all active:scale-95 bg-stone-900/40 border-stone-800">
                                    <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-red-900/50 flex items-center justify-center group-hover:bg-red-900/20 transition-colors">
                                        <span className="material-icons text-red-500/80 group-hover:text-red-400">receipt_long</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-stone-200">{t('debts', 'Deudas')}</h3>
                                        <p className="text-[0.625rem] text-stone-500 uppercase tracking-wider">{t('pacts', 'Pactos')}</p>
                                    </div>
                                </Link>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
