export interface Transaction {
    id?: number;
    user_id?: string;
    amount: number;
    description: string;
    date: string;
    type: 'income' | 'expense';
    category?: string;
    image_url?: string;
    created_at?: string;
}

export interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
    website: string | null;
}

export interface RecurringTransaction {
    id?: number;
    user_id?: string;
    amount: number;
    description: string;
    type: 'income' | 'expense';
    category?: string;
    interval_unit: 'day' | 'week' | 'month' | 'year';
    interval_value: number;
    start_date: string;
    next_run_date: string;
    active: boolean;
    created_at?: string;
}
