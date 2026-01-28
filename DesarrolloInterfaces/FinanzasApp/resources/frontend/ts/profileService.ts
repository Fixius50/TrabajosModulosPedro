import { supabase } from './supabaseClient';
import type { Profile } from './types';

export const getProfile = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'Row not found'
        throw error;
    }

    return data as Profile | null;
};

export const updateProfile = async (profile: Partial<Profile>) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user logged in');

    const updates = {
        ...profile,
        id: user.id,
        updated_at: new Date(),
    };

    const { error } = await supabase
        .from('profiles')
        .upsert(updates);

    if (error) throw error;
};

export const uploadAvatar = async (file: File) => {
    const fileName = `avatar_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
        .from('avatars') // Ensure 'avatars' bucket exists or reuse 'receipts' if you want simplicity, but better separate.
        .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

    return publicUrl;
};
