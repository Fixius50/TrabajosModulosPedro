import React from 'react';
import { DungeonCard } from './DungeonCard';

interface Transaction {
    id: number;
    desc: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
}

interface TransactionListProps {
    transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    return (
        <div className="bg-dungeon-bg min-h-full bg-wood-texture text-ink">
            <DungeonCard className="min-h-[300px] relative p-0 bg-parchment-texture border-0 shadow-none">
                {/* Scroll top effect */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-parchment-texture to-transparent z-10 border-b border-ink/10"></div>

                <div className="p-4 pt-8 pb-8 space-y-3">
                    {transactions.length === 0 && (
                        <div className="text-center font-dungeon-body italic opacity-50 py-10">
                            No inscriptions yet...
                        </div>
                    )}
                    {transactions.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center border-b border-ink/20 pb-2 last:border-0">
                            <div className="flex flex-col">
                                <span className="font-dungeon-header font-bold text-ink text-sm">{tx.desc}</span>
                                <span className="font-dungeon-body text-[10px] text-ink/60 uppercase tracking-wider">{tx.date}</span>
                            </div>
                            <span className={`font-dungeon-technical font-bold text-lg ${tx.amount > 0 ? 'text-emerald-income' : 'text-ruby-expense'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Scroll bottom effect */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-parchment to-transparent z-10 rounded-b-lg"></div>
            </DungeonCard>
        </div>
    );
};

