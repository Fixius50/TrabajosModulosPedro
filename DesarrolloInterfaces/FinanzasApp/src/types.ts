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
    avatar_url: string;
    website: string;
}
