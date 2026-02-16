import { supabase } from '../lib/supabase';

export interface Household {
    id: string;
    name: string;
    currency: string;
    created_by: string;
    created_at: string;
}

export interface HouseholdMember {
    id: string;
    household_id: string;
    user_id: string;
    role: 'admin' | 'member';
    joined_at: string;
    profile?: any; // Joined profile data
}

export interface SharedAccount {
    id: string;
    household_id: string;
    name: string;
    balance: number;
    currency: string;
    created_at: string;
}

export interface SharedTransaction {
    id: string;
    shared_account_id: string;
    created_by: string;
    amount: number;
    description: string;
    category: string;
    created_at: string;
    created_by_user?: {
        email: string;
    };
}

class HouseholdService {

    /**
     * Creates a new household and automatically adds the creator as admin.
     */
    async createHousehold(name: string, currency: string = 'EUR'): Promise<Household | null> {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("User not authenticated");

        // 1. Create Household
        const { data: household, error } = await supabase
            .from('households')
            .insert({
                name,
                currency,
                created_by: user.id
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating household:', error);
            throw error;
        }

        // 2. Add creator as admin
        const { error: memberError } = await supabase
            .from('household_members')
            .insert({
                household_id: household.id,
                user_id: user.id,
                role: 'admin'
            });

        if (memberError) {
            console.error('Error adding admin to household:', memberError);
            // Cleanup? Ideally this should be a transaction or function
        }

        return household;
    }

    /**
     * Gets the household(s) the current user belongs to.
     * For MVP we might just assume 1 household per user, but return array for flexibility.
     */
    async getMyHouseholds(): Promise<Household[]> {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return [];

        const { data, error } = await supabase
            .from('household_members')
            .select(`
                household_id,
                households (
                    *
                )
            `)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching households:', error);
            return [];
        }

        // Flatten structure
        return data.map((item: any) => item.households).filter(Boolean);
    }

    /**
     * Get members of a specific household
     */
    async getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
        const { data, error } = await supabase
            .from('household_members')
            .select(`
                *,
                profiles:user_id (
                    username,
                    avatar_url
                )
            `)
            .eq('household_id', householdId);

        if (error) {
            console.error('Error fetching members:', error);
            return [];
        }

        return data.map((m: any) => ({
            ...m,
            profile: m.profiles
        }));
    }

    /**
     * Get shared accounts for a household
     */
    async getSharedAccounts(householdId: string): Promise<SharedAccount[]> {
        const { data, error } = await supabase
            .from('shared_accounts')
            .select('*')
            .eq('household_id', householdId);

        if (error) {
            console.error('Error fetching shared accounts:', error);
            return [];
        }

        return data;
    }

    /**
     * Create a new shared account
     */
    async createSharedAccount(householdId: string, name: string, initialBalance: number = 0): Promise<SharedAccount | null> {
        const { data, error } = await supabase
            .from('shared_accounts')
            .insert({
                household_id: householdId,
                name,
                balance: initialBalance
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating shared account:', error);
            throw error;
        }

        return data;
    }

    /**
     * Join an existing household by ID
     */
    async joinHousehold(householdId: string): Promise<void> {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
            .from('household_members')
            .insert({
                household_id: householdId,
                user_id: user.id,
                role: 'member'
            });

        if (error) {
            console.error('Error joining household:', error);
            throw error;
        }
    }

    /**
     * Get transactions for a shared account
     */
    async getSharedAccountTransactions(accountId: string): Promise<SharedTransaction[]> {
        const { data, error } = await supabase
            .from('shared_account_transactions')
            .select(`
                *,
                created_by_user:created_by (
                    id,
                    email
                )
            `) // Join with auth.users if possible, or just fetch ID
            .eq('shared_account_id', accountId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }

        return data;
    }

    /**
     * Add a transaction to a shared account
     */
    async addSharedTransaction(
        accountId: string,
        amount: number,
        description: string,
        category: string
    ): Promise<SharedTransaction | null> {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('shared_account_transactions')
            .insert({
                shared_account_id: accountId,
                created_by: user.id,
                amount,
                description,
                category
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }

        // Update account balance
        await this.updateAccountBalance(accountId, amount);

        return data;
    }

    /**
     * Helper to update account balance
     */
    private async updateAccountBalance(accountId: string, amount: number) {
        // This is a simple client-side calculation. 
        // In a real app, this should be a database trigger or RPC function for atomicity.
        const { data: account } = await supabase
            .from('shared_accounts')
            .select('balance')
            .eq('id', accountId)
            .single();

        if (account) {
            const newBalance = account.balance + amount;
            await supabase
                .from('shared_accounts')
                .update({ balance: newBalance })
                .eq('id', accountId);
        }
    }
}

export const householdService = new HouseholdService();
