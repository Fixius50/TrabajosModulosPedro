
import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    title: string; // Added title
    points: number;
    gold: number; // Added for gold currency
    website?: string | null;
    updated_at?: string;
}

export const profileService = {
    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    },

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
        // Ensure gold is handled if passed
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...updates })
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
        return data;
    },

    async addGold(userId: string, amount: number): Promise<number | null> {
        // 1. Get current gold
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('gold')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            console.error('Error fetching gold:', fetchError);
            return null;
        }

        const newGold = (profile.gold || 0) + amount;

        // 2. Update gold
        const { data, error: updateError } = await supabase
            .from('profiles')
            .update({ gold: newGold })
            .eq('id', userId)
            .select('gold')
            .single();

        if (updateError) {
            console.error('Error updating gold:', updateError);
            return null;
        }

        return data.gold;
    },

    async addPoints(userId: string, amount: number): Promise<number | null> {
        // 1. Get current points
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            console.error('Error fetching points:', fetchError);
            return null;
        }

        const newPoints = (profile.points || 0) + amount;

        // 2. Update points
        const { data, error: updateError } = await supabase
            .from('profiles')
            .update({ points: newPoints })
            .eq('id', userId)
            .select('points')
            .single();

        if (updateError) {
            console.error('Error updating points:', updateError);
            return null;
        }

        return data.points;
    },

    async uploadAvatar(userId: string, file: File): Promise<string | null> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload to Supabase Storage (assuming 'avatars' bucket exists, if not need to create or handle error)
        // For now we might just return null or handle if bucket missing.
        // Ideally we should check if bucket exists or use a public URL if user provides one.
        // Let's assume standard storage 'avatars' bucket.

        // Check if bucket exists first? Or just try upload.
        // Note: Creating buckets via SQL is possible but usually done via dashboard or 'storage.buckets' API.

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            // Fallback: If bucket doesn't exist, we can't upload. 
            // User can provide URL text directly in the meantime.
            return null;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        return data.publicUrl;
    }
};
