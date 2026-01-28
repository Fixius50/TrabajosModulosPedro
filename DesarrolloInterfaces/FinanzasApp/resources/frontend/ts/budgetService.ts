import { supabase } from './supabaseClient';

export interface Budget {
    id?: string;
    category: string;
    amount: number;
    user_id?: string;
}

export const getBudgets = async (): Promise<Budget[]> => {
    const { data, error } = await supabase
        .from('budgets')
        .select('*');

    if (error) throw error;
    return data || [];
};

export const upsertBudget = async (budget: Budget) => {
    // We use the unique constraint on (user_id, category) to upsert
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data, error } = await supabase
        .from('budgets')
        .upsert({
            category: budget.category,
            amount: budget.amount,
            user_id: user.id
        }, { onConflict: 'user_id, category' })
        .select();

    if (error) throw error;
    return data;
};

export const deleteBudget = async (id: string) => {
    const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
