
import { supabase } from './supabaseClient';
import type { Transaction } from './types';

export interface DndFinancialState {
    currentGold: number; // Balance
    totalLoot: number;   // Income
    totalDamage: number; // Expenses
    level: number;       // Derived from balance
    vaultTier: 'Wood' | 'Iron' | 'Gold' | 'Diamond' | 'Ethereal';
}

export const dndService = {
    /**
     * Fetches all transactions and calculates the D&D financial state.
     */
    async getFinancialState(): Promise<DndFinancialState> {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*');

            if (error) {
                throw error;
            }

            const transactions = (data as Transaction[]) || [];
            return this.calculateState(transactions);
        } catch (error) {
            console.error('Error fetching financial state:', error);
            // Return a default empty state on error
            return {
                currentGold: 0,
                totalLoot: 0,
                totalDamage: 0,
                level: 1,
                vaultTier: 'Wood'
            };
        }
    },

    /**
     * Calculates state from a list of transactions.
     */
    calculateState(transactions: Transaction[]): DndFinancialState {
        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            const amount = Number(t.amount);
            if (t.type === 'income') {
                income += amount;
            } else if (t.type === 'expense') {
                expense += amount;
            }
        });

        const balance = income - expense;

        return {
            currentGold: balance,
            totalLoot: income,
            totalDamage: expense,
            level: this.calculateLevel(balance),
            vaultTier: this.calculateVaultTier(balance)
        };
    },

    /**
     * Calculates Level based on balance (logarithmic scale preferred, but linear for now).
     */
    calculateLevel(balance: number): number {
        if (balance <= 0) return 1;
        // Simple progression: Level corresponds to orders of magnitude roughly
        return Math.floor(Math.log10(balance + 1)) + 1;
    },

    /**
     * Determines the visual tier of the Vault based on balance.
     */
    calculateVaultTier(balance: number): 'Wood' | 'Iron' | 'Gold' | 'Diamond' | 'Ethereal' {
        if (balance < 100) return 'Wood';
        if (balance < 1000) return 'Iron';
        if (balance < 10000) return 'Gold';
        if (balance < 100000) return 'Diamond';
        return 'Ethereal';
    }
};
