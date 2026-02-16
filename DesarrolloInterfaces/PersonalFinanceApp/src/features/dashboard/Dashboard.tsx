import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../../services/transactionService';
import { storageService } from '../../services/storageService';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { Plus } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [netWorth, setNetWorth] = useState(0);

    // Queries
    const { data: transactions } = useQuery({
        queryKey: ['transactions'],
        queryFn: transactionService.getTransactions,
    });

    const { data: profile } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: () => user ? profileService.getProfile(user.id) : null,
        enabled: !!user
    });

    // Local Data for Chart
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        calculateFinancials();
    }, [transactions]);

    const calculateFinancials = () => {
        // 1. Calculate Transaction Balance (Cash on Hand)
        const cashBalance = transactions?.reduce((acc: number, curr: any) => {
            const isExpense = curr.categories?.type === 'expense';
            return acc + (isExpense ? -curr.amount : curr.amount);
        }, 0) || 0;

        // 2. Budgets (Treasury) - Money allocated in chests
        const budgets = storageService.getBudgets();
        const totalBudgeted = budgets.reduce((acc, b) => acc + (b.limit - b.spent), 0); // Remaining in chests

        // 3. Debts (Burden) - What I owe
        const debts = storageService.getDebts();
        const totalDebt = debts.filter(d => d.type === 'i_owe').reduce((acc, d) => acc + d.amount, 0);
        const totalOwedToMe = debts.filter(d => d.type === 'owed_to_me').reduce((acc, d) => acc + d.amount, 0);

        // 4. Household (Shared) - Mocking for now if service doesn't support sync
        const householdBalance = 0;

        // Total Net Worth = Cash + Budgeted + OwedToMe - Debt
        const calculatedNetWorth = cashBalance + totalBudgeted + totalOwedToMe - totalDebt;
        setNetWorth(calculatedNetWorth);

        // Chart Data
        const data = [
            { name: 'Budgets', value: totalBudgeted, color: '#f59e0b', path: '/treasure-chests' }, // Amber
            { name: 'Household', value: householdBalance, color: '#3b82f6', path: '/household' }, // Blue
            { name: 'Debts', value: totalDebt, color: '#ef4444', path: '/debts' },     // Red
            { name: 'Cash', value: Math.max(0, cashBalance), color: '#10b981', path: '/transactions' }, // Green
        ].filter(d => d.value > 0);

        setChartData(data);
    };

    const onPieClick = (data: any) => {
        if (data && data.path) {
            navigate(data.path);
        }
    };

    return (
        <div className="space-y-8 pt-10 pb-24 animate-fade-in max-w-lg mx-auto px-4">

            {/* Centered Profile Section */}
            <div className="flex flex-col items-center text-center space-y-4">
                <div onClick={() => navigate('/grimoire')} className="relative group cursor-pointer">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-amber-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative w-28 h-28 rounded-full p-1 bg-[#1c1917]">
                        <img
                            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=1c1917&color=f59e0b`}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover border-2 border-[#292524] group-hover:border-primary/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-stone-200">{profile?.full_name || user?.email?.split('@')[0]}</h2>
                    <p className="text-sm font-medium text-stone-500 uppercase tracking-widest">{profile?.title || 'Novice Adventurer'}</p>
                </div>

                <div className="bg-[#1c1917] border border-[#292524] px-6 py-3 rounded-2xl shadow-xl">
                    <span className="text-xs text-stone-500 uppercase font-bold tracking-wider block mb-1">Net Worth</span>
                    <span className={`text-3xl font-mono font-bold ${netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${netWorth.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Navigation Wheel (Donut Chart) */}
            <div className="relative h-64 w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                onClick={(data) => onPieClick(data.payload)}
                                cursor="pointer"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '8px' }}
                                itemStyle={{ color: '#e7e5e4' }}
                                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-600">
                        <p>No assets tracked yet.</p>
                    </div>
                )}

                {/* Center Label for Chart */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-xs text-stone-500 font-bold uppercase">Assets</span>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Clickable cards acting as navigation too */}
                <div onClick={() => navigate('/treasure-chests')} className="fantasy-card p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border border-amber-900/20">
                    <span className="material-symbols-outlined text-amber-500 mb-2">savings</span>
                    <span className="text-xs font-bold text-stone-400 uppercase">Budgets</span>
                </div>
                <div onClick={() => navigate('/household')} className="fantasy-card p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border border-blue-900/20">
                    <span className="material-symbols-outlined text-blue-500 mb-2">home_work</span>
                    <span className="text-xs font-bold text-stone-400 uppercase">Household</span>
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => navigate('/add-transaction')}
                className="fixed bottom-24 right-6 bg-primary text-[#1c1917] p-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-110 active:scale-95 transition-all z-40 border border-amber-200/20"
            >
                <Plus size={28} />
            </button>
        </div>
    );
}
