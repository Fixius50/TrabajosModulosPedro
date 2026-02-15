import initialData from '../data/initialData.json';

// Types derived from the JSON structure
export interface Debt {
    id: string;
    name: string;
    role: string;
    amount: number;
    type: 'owed_to_me' | 'i_owe';
    dueDate: string;
}

export interface Contract {
    id: string;
    name: string;
    description: string;
    cost: number;
    cycle: string;
    nextReaping: string;
    status: 'Active' | 'Paused';
    icon: string;
}

export interface GuildMember {
    id: string;
    name: string;
    role: 'Leader' | 'Member';
    avatar: string;
}

export interface Tithe {
    id: string;
    memberId: string;
    amount: number;
    date: string;
    note: string;
}

export interface GuildData {
    balance: number;
    members: GuildMember[];
    tithes: Tithe[];
}

export interface FinancialScoreData {
    currentScore: number;
    tier: string;
    maxXP: number;
    currentXP: number;
    insights: { text: string; recommendation: string }[];
}

export interface BudgetChest {
    id: string;
    name: string;
    limit: number;
    spent: number;
    icon: string;
    isOpen: boolean;
}

export interface UserProfile {
    name: string;
    title: string;
    avatar: string;
    stats: {
        wealthXP: number;
        maxXP: number;
        goldEarned: number;
        questsCompleted: number;
        netWorth: number; // Added for Data Sync
    };
}

// Storage Key
const STORAGE_KEY = 'grimoire_data_v1';

class StorageService {
    private data: typeof initialData;

    constructor() {
        // Initialize from LocalStorage or fall back to initialData.json
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            this.data = JSON.parse(stored);
            // Migration: Ensure netWorth exists
            if (this.data.userProfile && this.data.userProfile.stats && typeof this.data.userProfile.stats.netWorth === 'undefined') {
                this.data.userProfile.stats.netWorth = 0;
            }
            // Migration: Ensure budgets exists
            if (!this.data.budgets) {
                this.data.budgets = JSON.parse(JSON.stringify(initialData.budgets || []));
            }
        } else {
            this.data = JSON.parse(JSON.stringify(initialData)); // Deep copy to avoid reference issues
            this.save();
        }
    }

    private save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

    // --- Debts ---
    getDebts(): Debt[] {
        return this.data.debts as Debt[];
    }

    addDebt(debt: Debt) {
        this.data.debts.push(debt);
        this.save();
    }

    updateDebt(updatedDebt: Debt) {
        this.data.debts = this.data.debts.map(d => d.id === updatedDebt.id ? updatedDebt : d);
        this.save();
    }

    removeDebt(id: string) {
        this.data.debts = this.data.debts.filter(d => d.id !== id);
        this.save();
    }

    // --- Contracts ---
    getContracts(): Contract[] {
        return this.data.contracts as Contract[];
    }

    updateContract(updatedContract: Contract) {
        this.data.contracts = this.data.contracts.map(c => c.id === updatedContract.id ? updatedContract : c);
        this.save();
    }

    // --- Guild ---
    getGuildData(): GuildData {
        return this.data.guild as GuildData;
    }

    // --- Score ---
    getFinancialScore(): FinancialScoreData {
        return this.data.financialScore;
    }

    // --- Budgets ---
    getBudgets(): BudgetChest[] {
        return this.data.budgets;
    }

    updateBudget(updatedChest: BudgetChest) {
        this.data.budgets = this.data.budgets.map(b => b.id === updatedChest.id ? updatedChest : b);
        this.save();
    }

    // --- Profile ---
    getUserProfile(): UserProfile {
        return this.data.userProfile;
    }

    updateUserProfile(profile: UserProfile) {
        this.data.userProfile = profile;
        this.save();
    }

    updateNetWorth(amount: number) {
        if (this.data.userProfile && this.data.userProfile.stats) {
            this.data.userProfile.stats.netWorth = amount;
            this.save();
        }
    }

    // --- Marketplace Helpers ---
    hasFunds(xpCost: number, goldCost: number): boolean {
        const stats = this.data.userProfile.stats;
        return stats.wealthXP >= xpCost && stats.goldEarned >= goldCost;
    }

    deductFunds(xpCost: number, goldCost: number): boolean {
        if (!this.hasFunds(xpCost, goldCost)) return false;

        this.data.userProfile.stats.wealthXP -= xpCost;
        this.data.userProfile.stats.goldEarned -= goldCost;
        this.save();
        return true;
    }
}

export const storageService = new StorageService();
