import { supabase } from '../supabaseClient';

/**
 * Service to manage user files (JSON exports, receipts) in Supabase Buckets.
 */
export const storageService = {
    /**
     * Uploads a JSON object as a file to the user's private bucket.
     */
    async uploadUserData(userId: string, fileName: string, data: any) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const filePath = `${userId}/${fileName}.json`;

        const { error } = await supabase.storage
            .from('user_data')
            .upload(filePath, blob, {
                upsert: true
            });

        if (error) throw error;
        return filePath;
    },

    /**
     * Downloads a JSON file from the user's private bucket.
     */
    async downloadUserData(userId: string, fileName: string) {
        const filePath = `${userId}/${fileName}.json`;

        const { data, error } = await supabase.storage
            .from('user_data')
            .download(filePath);

        if (error) throw error;

        const text = await data.text();
        return JSON.parse(text);
    },

    /**
     * Lists all files for a user.
     */
    async listUserFiles(userId: string) {
        const { data, error } = await supabase.storage
            .from('user_data')
            .list(userId);

        if (error) throw error;
        return data;
    }
};
