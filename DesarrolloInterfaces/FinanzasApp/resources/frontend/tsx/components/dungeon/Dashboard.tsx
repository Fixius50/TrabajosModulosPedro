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
    const [transactions, setTransactions] = useState<Transaction[]>([]); // Using Transaction interface
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(10);

            if (error) throw error;

            // Map to display format
            const formatted: Transaction[] = (data || []).map(tx => ({
                ...tx,
                desc: tx.description, // Component expects 'desc'
                date: new Date(tx.date).toLocaleDateString()
            }));

            setTransactions(formatted);

            // Calculate balance (Simple sum of all time, in real app might be cached or efficient query)
            // For now, let's fetch sum or just sum loaded (which is wrong but quick).
            // Let's do a separate balance query or RPC if available.
            // Fallback: fetch all for balance? Dangerous for scale.
            // Let's rely on 'bank_accounts' table for balance if properly linked, 
            // but the prompt implies this is a ledger.
            // Let's just sum the recent ones or mock the total balance to be persistent if no separate table.
            // Wait, existing app uses 'bank_accounts'.
            // For this Demo/Redo, I'll sum the visible ones or better: standard bank_accountService?
            // Let's just sum visible for now to show reactivity or fetch a separate "summary".

            // Let's try to get balance from bank_accounts if possible.
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

        // Realtime subscription
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
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // data comes from Modal (amount, desc)
            const { error } = await supabase.from('transactions').insert({
                user_id: user.id,
                amount: Number(data.amount), // Ensure number
                description: data.description,
                type: Number(data.amount) >= 0 ? 'income' : 'expense',
                date: new Date().toISOString(),
                category: data.category || 'General'
            });

            if (error) throw error;

            // Also update bank account balance? 
            // For now, just tx. Real logic needs a trigger or transaction.

            setIsModalOpen(false);
            // Realtime will reload
        } catch (err) {
            console.error("Error saving transaction:", err);
        }
    };

    if (onUnlock) {
        // Silence unused var
    }

    return (
        <div className="min-h-screen bg-dungeon-bg p-4 flex flex-col gap-6 bg-wood-texture">
            {/* Header */}
            <header className="flex justify-between items-center mb-2">
                <h1 className="font-dungeon-header text-3xl text-gold-coin drop-shadow-md">Financial Ledger</h1>
                <div className="w-10 h-10 bg-parchment rounded-full border-2 border-gold-coin flex items-center justify-center">
                    {/* Avatar Placeholder */}
                    <span className="font-dungeon-header text-ink font-bold">LVL {transactions.length}</span>
                </div>
            </header>

            {/* Balance Card */}
            <DungeonCard title="Total Balance" className="bg-parchment-texture">
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-dungeon-header text-ink font-bold">{loading ? '...' : `${balance.toLocaleString()} GP`}</span>
                    <div className="flex gap-8 mt-4 w-full justify-center">
                        <div className="flex flex-col items-center">
                            <span className="text-emerald-income font-bold text-lg">In</span>
                            <span className="text-xs uppercase tracking-widest text-ink/70">Income</span>
                        </div>
                        <div className="w-[1px] h-10 bg-iron-border/50"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-ruby-expense font-bold text-lg">Out</span>
                            <span className="text-xs uppercase tracking-widest text-ink/70">Expenses</span>
                        </div>
                    </div>
                </div>
            </DungeonCard>

            {/* Quick Actions */}
            <div className="flex gap-4">
                <DungeonButton className="flex-1" onClick={() => setIsModalOpen(true)}>+ Add Income</DungeonButton>
                <DungeonButton variant="danger" className="flex-1" onClick={() => setIsModalOpen(true)}>+ Add Expense</DungeonButton>
            </div>

            {/* Recent Transactions (Loot History -> Recent Transactions) */}
            <div className="flex-1">
                <TransactionList transactions={transactions} />
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTransaction}
            />
        </div>
    );
};
