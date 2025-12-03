import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || window.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || window.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn("Supabase credentials missing. Auth will act as Mock.");
}

export { supabase };

export const AuthService = {
    login: async () => {
        if (supabase) {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin // Vite handles routing
                }
            });
            if (error) throw error;
            return data;
        } else {
            // Fallback Mock
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockUser = {
                id: "user-mock",
                email: "demo@ejemplo.com",
                user_metadata: {
                    full_name: "Usuario Demo",
                    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                }
            };
            localStorage.setItem('notion_mock_user', JSON.stringify(mockUser));
            return { user: mockUser };
        }
    },
    logout: async () => {
        if (supabase) {
            await supabase.auth.signOut();
        } else {
            localStorage.removeItem('notion_mock_user');
        }
        return true;
    }
};
