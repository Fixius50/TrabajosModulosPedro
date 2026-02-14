import React, { useState, useEffect } from 'react';
import { DungeonCard } from './DungeonCard';
import { DungeonButton } from './DungeonButton';
import { TransactionList } from './TransactionList';
import { TransactionModal } from './TransactionModal';
import { supabase } from '../../../ts/supabaseClient';

// Interface matching the table structure
interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    category?: string;
    // Helper for display
    desc: string;
}

interface DungeonDashboardProps {
    onUnlock?: () => void;
}

export const DungeonDashboard: React.FC<DungeonDashboardProps> = ({ onUnlock }) => {
    const [balance, setBalance] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // MOCK DATA for Demo if no user
            if (!user) {
                const mockTxs: Transaction[] = [
                    { id: 1, description: 'Loot from Goblin Cave', amount: 150, date: new Date().toISOString(), type: 'income', category: 'Loot', desc: 'Loot from Goblin Cave' },
                    { id: 2, description: 'Tavern Tab', amount: -25, date: new Date(Date.now() - 86400000).toISOString(), type: 'expense', category: 'Food', desc: 'Tavern Tab' },
                    { id: 3, description: 'Sold Rusty Sword', amount: 15, date: new Date(Date.now() - 172800000).toISOString(), type: 'income', category: 'Trade', desc: 'Sold Rusty Sword' },
                ];
                setTransactions(mockTxs);
                setBalance(1500); // Mock Balance
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(10);

            if (error) throw error;

            const formatted: Transaction[] = (data || []).map(tx => ({
                ...tx,
                desc: tx.description,
                date: new Date(tx.date).toLocaleDateString()
            }));

            setTransactions(formatted);

            const { data: accounts } = await supabase.from('bank_accounts').select('balance').eq('user_id', user.id);
            const total = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
            setBalance(total);

        } catch (err) {
            console.error("Error fetching ledger:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();

        const subscription = supabase
            .channel('public:transactions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
                fetchTransactions();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSaveTransaction = async (data: any) => {
        // Mock save if no user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const newTx: Transaction = {
                id: Math.random(),
                description: data.description,
                amount: Number(data.amount),
                date: new Date().toISOString(),
                type: Number(data.amount) >= 0 ? 'income' : 'expense',
                category: data.category || 'General',
                desc: data.description
            };
            setTransactions([newTx, ...transactions]);
            setBalance(prev => prev + Number(data.amount));
            setIsModalOpen(false);
            return;
        }

        try {
            const { error } = await supabase.from('transactions').insert({
                user_id: user.id,
                amount: Number(data.amount), // Ensure number
                description: data.description,
                type: Number(data.amount) >= 0 ? 'income' : 'expense',
                date: new Date().toISOString(),
                category: data.category || 'General'
            });

            if (error) throw error;
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving transaction:", err);
        }
    };

    return (
        <div className="min-h-screen bg-dungeon-bg bg-wood-texture p-4 pb-20 flex flex-col gap-6 text-ink">
            {/* Header */}
            <header className="flex justify-between items-center mb-2 bg-paper-texture/20 p-2 rounded relative">
                <h1 className="font-dungeon-header text-3xl text-gold-coin drop-shadow-md uppercase tracking-wider">Treasury</h1>
                <div className="flex items-center gap-2">
                    <span className="font-dungeon-technical text-xs text-parchment opacity-70">LVL {Math.floor(balance / 1000) + 1}</span>
                    <div className="w-8 h-8 bg-parchment rounded-full border-2 border-gold-coin flex items-center justify-center shadow-coin">
                        <span className="material-symbols-outlined text-ink text-sm">account_balance</span>
                    </div>
                </div>
                {/* Bolts */}
                <div className="absolute -bottom-1 left-4 w-2 h-2 rounded-full bg-iron-border shadow-inner"></div>
                <div className="absolute -bottom-1 right-4 w-2 h-2 rounded-full bg-iron-border shadow-inner"></div>
            </header>

            {/* Balance Card */}
            <div className="relative">
                {/* Decorative Chains hanging the board */}
                <div className="absolute -top-4 left-8 w-1 h-8 bg-iron-border z-0"></div>
                <div className="absolute -top-4 right-8 w-1 h-8 bg-iron-border z-0"></div>

                <DungeonCard className="bg-parchment-texture relative z-10 border-4 border-iron-border shadow-2xl">
                    <div className="flex flex-col items-center">
                        <span className="font-dungeon-body text-xs text-ink/60 uppercase tracking-[0.2em] mb-1">— Total Hoard —</span>
                        <span className="text-5xl font-dungeon-header text-ink font-bold drop-shadow-sm">{loading ? '...' : `${balance.toLocaleString()} GP`}</span>

                        <div className="w-full h-[1px] bg-ink/10 my-4"></div>

                        <div className="flex gap-8 w-full justify-center">
                            <div className="flex flex-col items-center group cursor-pointer hover:scale-105 transition-transform">
                                <span className="text-emerald-income font-bold text-xl font-dungeon-technical">+ {transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0).toLocaleString()}</span>
                                <span className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Tribute</span>
                            </div>
                            <div className="w-[1px] h-10 bg-iron-border/20"></div>
                            <div className="flex flex-col items-center group cursor-pointer hover:scale-105 transition-transform">
                                <span className="text-ruby-expense font-bold text-xl font-dungeon-technical">{transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0).toLocaleString()}</span>
                                <span className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Upkeep</span>
                            </div>
                        </div>
                    </div>
                </DungeonCard>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
                <DungeonButton className="flex-1 shadow-lg shadow-emerald-income/20 border-emerald-income/50" onClick={() => setIsModalOpen(true)}>
                    <span className="material-symbols-outlined mr-2">add_circle</span>
                    Add Tribute
                </DungeonButton>
                <DungeonButton variant="danger" className="flex-1 shadow-lg shadow-ruby-expense/20 border-ruby-expense/50" onClick={() => setIsModalOpen(true)}>
                    <span className="material-symbols-outlined mr-2">remove_circle</span>
                    Pay Upkeep
                </DungeonButton>
            </div>

            {/* Recent Transactions (Scroll) */}
            <div className="flex-1 bg-paper-texture rounded-lg border border-ink/20 p-4 shadow-inner overflow-hidden relative">
                <h2 className="font-dungeon-header text-xl text-ink mb-4 flex items-center gap-2 opacity-80 border-b border-ink/10 pb-2">
                    <span className="material-symbols-outlined">history_edu</span>
                    Ledger Entries
                </h2>
                <div className="overflow-y-auto max-h-[40vh] pr-2 space-y-2 scrollbar-thin scrollbar-thumb-iron-border scrollbar-track-transparent">
                    <TransactionList transactions={transactions} />
                </div>
                {/* Scroll fade effect */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-parchment to-transparent pointer-events-none rounded-b-lg"></div>
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTransaction}
            />
        </div>
    );
};
