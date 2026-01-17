import { supabase } from '../supabaseClient';
import type { Transaction } from '../types';

export const getTransactions = async () => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
};

export const createTransaction = async (transaction: Transaction) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select();

    if (error) throw error;
    return data;
};

export const deleteTransaction = async (id: number) => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const updateTransaction = async (id: number, transaction: Partial<Transaction>) => {
    const { error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', id);

    if (error) throw error;
};

export const uploadReceipt = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

    return data.publicUrl;
};
