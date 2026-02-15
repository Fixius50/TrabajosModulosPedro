import { supabase } from '../lib/supabase';

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    category_id: string;
    user_id: string;
    file_path?: string;
    created_at: string;
}

export class TransactionService {
    async getTransactions() {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
        *,
        categories (name, icon, color)
      `)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    }

    async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transaction)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteTransaction(id: string) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async uploadAttachment(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
            .from('attachments')
            .upload(filePath, file);

        if (error) throw error;
        return filePath;
    }

    getAttachmentUrl(path: string) {
        return supabase.storage.from('attachments').getPublicUrl(path).data.publicUrl;
    }
}

export const transactionService = new TransactionService();
