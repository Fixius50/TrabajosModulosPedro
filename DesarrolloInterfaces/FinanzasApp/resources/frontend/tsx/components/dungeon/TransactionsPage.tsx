import React, { useState, useEffect } from 'react';
import { supabase } from '../../../ts/supabaseClient';
import { TransactionList } from './TransactionList';
import { DungeonButton } from './DungeonButton';
import { TransactionModal } from './TransactionModal';

// Interface matching the table structure
interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    category?: string;
    desc: string; // Helper for display
}

export const TransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    const fetchTransactions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let query = supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('type', filter);
            }

            const { data, error } = await query;

            if (error) throw error;

            const formatted: Transaction[] = (data || []).map(tx => ({
                ...tx,
                desc: tx.description,
                date: new Date(tx.date).toLocaleDateString()
            }));

            setTransactions(formatted);
        } catch (err) {
            console.error("Error fetching ledger:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        const subscription = supabase
            .channel('public:transactions_page')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
                fetchTransactions();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [filter]);

    const handleSaveTransaction = async (data: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('transactions').insert({
                user_id: user.id,
                amount: Number(data.amount),
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
        <div className="min-h-screen bg-dungeon-bg p-4 flex flex-col gap-4 bg-wood-texture">
            <div className="flex justify-between items-center border-b-2 border-iron-border pb-2 mb-2">
                <h1 className="font-dungeon-header text-2xl text-gold-coin drop-shadow-md">Ledger</h1>
                <div className="flex gap-2">
                    <button onClick={() => setFilter('all')} className={`text-xs px-2 py-1 rounded ${filter === 'all' ? 'bg-gold-coin text-black' : 'text-parchment border border-parchment/30'}`}>All</button>
                    <button onClick={() => setFilter('income')} className={`text-xs px-2 py-1 rounded ${filter === 'income' ? 'bg-emerald-income/80 text-black' : 'text-parchment border border-parchment/30'}`}>In</button>
                    <button onClick={() => setFilter('expense')} className={`text-xs px-2 py-1 rounded ${filter === 'expense' ? 'bg-ruby-expense/80 text-white' : 'text-parchment border border-parchment/30'}`}>Out</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-full text-gold-coin animate-pulse font-dungeon-header">
                        Loading Ledger...
                    </div>
                ) : (
                    <TransactionList transactions={transactions} />
                )}
            </div>

            <div className="mt-auto pt-4">
                <DungeonButton onClick={() => setIsModalOpen(true)} className="w-full">New Inscription</DungeonButton>
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTransaction}
            />
        </div>
    );
};
