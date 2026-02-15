import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../../services/transactionService';
import { Plus, Trash2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: transactionService.getTransactions,
    });

    const deleteMutation = useMutation({
        mutationFn: transactionService.deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });

    const totalBalance = transactions?.reduce((acc, curr) => {
        // Determine sign based on category type (requires fetching category detail properly or assuming logic)
        // For simplicity locally, assuming all amount is positive and type dictates sign
        // But transactionService returns joined category.
        const isExpense = curr.categories?.type === 'expense';
        return acc + (isExpense ? -curr.amount : curr.amount);
    }, 0) || 0;

    return (
        <div className="space-y-6 pt-6 animate-fade-in">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold">Dashboard</h2>
                    <p className="text-muted">Your financial overview</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`}
                        alt="Profile"
                        className="w-full h-full rounded-full bg-slate-900"
                    />
                </div>
            </header>

            {/* Balance Card */}
            <div className="glass-panel p-6 relative overflow-hidden group hover:bg-white/5 transition-colors">
                <h3 className="text-muted text-sm font-medium uppercase tracking-wider mb-2">Total Balance</h3>
                <p className="text-4xl font-bold font-mono">
                    {isLoading ? '...' : `$${totalBalance.toFixed(2)}`}
                </p>
            </div>

            {/* Recent Transactions */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-white/90">Recent Transactions</h3>
                <div className="space-y-3 pb-20">
                    {isLoading ? (
                        <div className="text-center text-muted py-10">Loading transactions...</div>
                    ) : transactions?.length === 0 ? (
                        <div className="text-center text-muted py-10">No transactions yet. Add one!</div>
                    ) : (
                        transactions?.map((t: any) => (
                            <div key={t.id} className="glass-panel p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                                        {t.categories?.icon || '📦'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{t.description}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-muted">{t.categories?.name || 'Uncategorized'}</p>
                                            {t.file_path && <FileText size={12} className="text-primary" />}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className={`font-mono font-medium ${t.categories?.type === 'expense' ? 'text-white' : 'text-green-400'}`}>
                                        {t.categories?.type === 'expense' ? '-' : '+'} ${t.amount}
                                    </p>
                                    <button
                                        onClick={() => deleteMutation.mutate(t.id)}
                                        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => navigate('/add-transaction')}
                className="fixed bottom-24 right-6 bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/40 hover:scale-110 active:scale-95 transition-all z-40"
            >
                <Plus size={28} />
            </button>
        </div>
    );
}
