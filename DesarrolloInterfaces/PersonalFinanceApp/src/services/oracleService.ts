import { transactionService } from './transactionService';

export interface OracleVision {
    timeframe: string;
    projectedBalance: number;
    trend: 'rising' | 'falling' | 'stable';
    insight: string;
}

class OracleService {
    async getVisions(): Promise<OracleVision[]> {
        const transactions = await transactionService.getTransactions();

        // Simple linear projection based on average monthly cashflow
        const monthlyFlow = this.calculateMonthlyCashflow(transactions);
        const currentBalance = this.calculateCurrentBalance(transactions);

        return [
            this.createVision('3 Moons', currentBalance, monthlyFlow, 3),
            this.createVision('6 Moons', currentBalance, monthlyFlow, 6),
            this.createVision('1 Cycle', currentBalance, monthlyFlow, 12),
        ];
    }

    private calculateMonthlyCashflow(transactions: any[]): number {
        if (!transactions || transactions.length === 0) return 0;

        const totalFlow = transactions.reduce((acc, curr) => {
            const isExpense = curr.categories?.type === 'expense';
            return acc + (isExpense ? -curr.amount : curr.amount);
        }, 0);

        // Assume transactions cover roughly 1 month if sample is small, 
        // otherwise we would divide by actual time span
        return totalFlow;
    }

    private calculateCurrentBalance(transactions: any[]): number {
        return transactions.reduce((acc, curr) => {
            const isExpense = curr.categories?.type === 'expense';
            return acc + (isExpense ? -curr.amount : curr.amount);
        }, 0);
    }

    private createVision(timeframe: string, current: number, monthly: number, multiplier: number): OracleVision {
        const projected = current + (monthly * multiplier);
        const trend = monthly > 0 ? 'rising' : monthly < 0 ? 'falling' : 'stable';

        let insight = "";
        if (trend === 'rising') {
            insight = "Your coffers grow steadily. A golden era awaits.";
        } else if (trend === 'falling') {
            insight = "Mana is leaking. Tighten your belt or face the abyss.";
        } else {
            insight = "The stars remain calm. Your hoard is stable.";
        }

        return { timeframe, projectedBalance: projected, trend, insight };
    }
}

export const oracleService = new OracleService();
