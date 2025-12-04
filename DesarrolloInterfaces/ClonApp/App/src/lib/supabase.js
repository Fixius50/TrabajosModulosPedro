import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || window.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || window.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
    // If the key is the invalid Google one, force mock mode
    if (supabaseAnonKey.startsWith('GOCSPX')) {
        console.warn("Invalid Supabase key detected (looks like Google secret). Forcing Mock Mode.");
        supabase = null;
    } else {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
} else {
    console.warn("Supabase credentials missing. Auth will act as Mock.");
}

export { supabase };

export const AuthService = {
    signInWithGoogle: async () => {
        if (supabase) {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
            return data;
        } else {
            // Fallback Mock for Google
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockUser = {
                id: "user-mock-google",
                email: "google-user@ejemplo.com",
                user_metadata: {
                    full_name: "Usuario Google Mock",
                    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                }
            };
            localStorage.setItem('notion_mock_user', JSON.stringify(mockUser));
            return { user: mockUser };
        }
    },
    signInWithPassword: async (email, password) => {
        // 1. Check Hardcoded Demo User
        if (email === "demo@ejemplo.com" && password === "demo") {
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockUser = {
                id: "user-mock-demo",
                email: "demo@ejemplo.com",
                user_metadata: { full_name: "Usuario Demo" }
            };
            localStorage.setItem('notion_mock_user', JSON.stringify(mockUser));
            return { user: mockUser };
        }

        // 2. Check "Mock Database" (localStorage)
        const mockUsers = JSON.parse(localStorage.getItem('notion_mock_db_users') || '[]');
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const sessionUser = {
                id: foundUser.id,
                email: foundUser.email,
                user_metadata: { full_name: foundUser.email.split('@')[0] }
            };
            localStorage.setItem('notion_mock_user', JSON.stringify(sessionUser));
            return { user: sessionUser };
        }

        // 3. Try Real Supabase (if configured)
        if (supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return data;
        }

        throw new Error("Credenciales inválidas (Mock: usa demo@ejemplo.com / demo o regístrate)");
    },
    signUp: async (email, password) => {
        if (supabase) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            if (error) throw error;
            return data;
        } else {
            // Mock Registration
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockUsers = JSON.parse(localStorage.getItem('notion_mock_db_users') || '[]');

            if (mockUsers.find(u => u.email === email)) {
                throw new Error("El usuario ya existe (Mock DB)");
            }

            const newUser = {
                id: `user-mock-${Date.now()}`,
                email,
                password // In a real app, never store passwords plain text!
            };

            mockUsers.push(newUser);
            localStorage.setItem('notion_mock_db_users', JSON.stringify(mockUsers));

            // Auto-login after sign up
            const sessionUser = {
                id: newUser.id,
                email: newUser.email,
                user_metadata: { full_name: email.split('@')[0] }
            };
            localStorage.setItem('notion_mock_user', JSON.stringify(sessionUser));

            return { user: sessionUser };
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
