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
    currency: string;
    stats: {
        wealthXP: number;
        maxXP: number;
        goldEarned: number;
        questsCompleted: number;
        netWorth: number; // Added for Data Sync
    };
}

// Storage Key Prefix
const STORAGE_KEY_PREFIX = 'grimoire_data_';

// Shared Accounts Types
export interface SharedTransaction {
    id: string;
    who: string;
    amount: number;
    description: string;
    date: string;
}

export interface SharedMember {
    id: string;
    name: string;
    balance: number;
}

// Full Storage Interface
interface StorageData {
    userProfile: UserProfile;
    debts: Debt[];
    contracts: Contract[];
    guild: GuildData;
    financialScore: FinancialScoreData;
    budgets: BudgetChest[];
    sharedMembers: SharedMember[];
    sharedTransactions: SharedTransaction[];
}

class StorageService {
    private data: StorageData;
    private currentUserId: string = 'guest';

    constructor() {
        // Default init
        this.data = JSON.parse(JSON.stringify(initialData)) as StorageData;
        this.tryLoadFromDefault();
    }

    private tryLoadFromDefault() {
        const stored = localStorage.getItem('grimoire_data_v1');
        if (stored) {
            this.data = JSON.parse(stored);
            this.performMigrations();
        }
    }

    init(userId: string) {
        this.currentUserId = userId;
        this.loadData();
    }

    private getStorageKey(): string {
        // If guest, maybe stick to 'v1' for backward compat? 
        // Or migrate guest to 'grimoire_data_guest'?
        // Let's use standard pattern:
        return `${STORAGE_KEY_PREFIX}${this.currentUserId}`;
    }

    private loadData() {
        const key = this.getStorageKey();
        const stored = localStorage.getItem(key);

        if (stored) {
            this.data = JSON.parse(stored);
            this.performMigrations();
        } else {
            // Check if we have legacy data to migrate (only for first user or guest?)
            // For now, new users get fresh data
            this.initializeNewData();
        }
    }

    private performMigrations() {
        // Migration: Ensure netWorth exists
        if (this.data.userProfile && this.data.userProfile.stats && typeof this.data.userProfile.stats.netWorth === 'undefined') {
            this.data.userProfile.stats.netWorth = 0;
        }
        // Migration: Ensure currency exists
        if (this.data.userProfile && !this.data.userProfile.currency) {
            this.data.userProfile.currency = 'EUR';
        }
        if (!this.data.budgets) {
            this.data.budgets = JSON.parse(JSON.stringify(initialData.budgets || []));
        }
        // Migration: Ensure Shared Accounts exist
        if (!this.data.sharedMembers) this.data.sharedMembers = [
            { id: '1', name: 'Tú', balance: 0 },
            { id: '2', name: 'Aliado', balance: 0 }
        ];
        if (!this.data.sharedTransactions) this.data.sharedTransactions = [];
    }

    private initializeNewData() {
        this.data = JSON.parse(JSON.stringify(initialData)) as StorageData; // Deep copy

        // Initialize missing fields for new installs
        if (!this.data.userProfile.currency) {
            this.data.userProfile.currency = 'EUR';
        }
        this.data.sharedMembers = [
            { id: '1', name: 'Tú', balance: 0 },
            { id: '2', name: 'Aliado', balance: 0 }
        ];
        this.data.sharedTransactions = [];

        this.save();
    }

    private save() {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(this.data));
    }

    // --- Account Management ---
    deleteAccount() {
        localStorage.removeItem(this.getStorageKey());
        // Reset to initial state
        this.data = JSON.parse(JSON.stringify(initialData)) as StorageData;
        window.location.reload();
    }

    // --- Debts ---
    getDebts(): Debt[] {
        return this.data.debts || [];
    }

    addDebt(debt: Debt) {
        if (!this.data.debts) this.data.debts = [];
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
        return this.data.contracts || [];
    }

    saveContracts(contracts: Contract[]) {
        this.data.contracts = contracts;
        this.save();
    }

    updateContract(updatedContract: Contract) {
        this.data.contracts = this.data.contracts.map(c => c.id === updatedContract.id ? updatedContract : c);
        this.save();
    }

    // --- Shared Accounts ---
    getSharedMembers(): SharedMember[] {
        return this.data.sharedMembers || [];
    }

    saveSharedMembers(members: SharedMember[]) {
        this.data.sharedMembers = members;
        this.save();
    }

    getSharedTransactions(): SharedTransaction[] {
        return this.data.sharedTransactions || [];
    }

    saveSharedTransactions(txs: SharedTransaction[]) {
        this.data.sharedTransactions = txs;
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

    // --- Data Management ---
    exportData(): string {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData: string): boolean {
        try {
            const parsed = JSON.parse(jsonData);
            // Basic validation: check if userProfile exists
            if (!parsed.userProfile) return false;

            this.data = parsed;
            this.save();
            return true;
        } catch (e) {
            console.error("Failed to import data", e);
            return false;
        }
    }

    resetData() {
        localStorage.removeItem(this.getStorageKey());
        this.data = JSON.parse(JSON.stringify(initialData)) as StorageData;

        // Initialize missing fields for new installs
        if (!this.data.userProfile.currency) {
            this.data.userProfile.currency = 'EUR';
        }

        this.save();
        window.location.reload(); // Force reload to reflect changes
    }
}

export const storageService = new StorageService();
