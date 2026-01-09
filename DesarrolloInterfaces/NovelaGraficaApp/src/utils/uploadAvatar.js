import { supabase } from '../services/supabaseClient';

/**
 * Uploads an avatar file to Supabase Storage and returns the public URL.
 * @param {File} file - The file object from input.
 * @param {string} userId - The current user's ID.
 * @returns {Promise<string>} - The public URL of the uploaded avatar.
 */
export async function uploadAvatar(file, userId) {
    try {
        if (!file || !userId) throw new Error("File and UserId are required.");

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. Upload to 'avatars' bucket
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false // unique names
            });

        if (uploadError) {
            // Check if bucket exists error? For now just throw
            console.error('Upload Error:', uploadError);
            throw uploadError;
        }

        // 2. Get Public URL
        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;

    } catch (error) {
        console.error("Avatar Upload Failed:", error);
        throw error;
    }
}
