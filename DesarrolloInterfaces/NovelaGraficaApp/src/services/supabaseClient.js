import { createClient } from '@supabase/supabase-js';

// Retrieve env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase keys missing! Check .env file.");
}

// Create client with explicit configuration
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false, // Keep disabled for stability during debug
            autoRefreshToken: true,
        },
        db: {
            schema: 'public',
        },
    })
    : null;
