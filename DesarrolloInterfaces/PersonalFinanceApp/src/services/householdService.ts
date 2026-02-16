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
}

export const householdService = new HouseholdService();
