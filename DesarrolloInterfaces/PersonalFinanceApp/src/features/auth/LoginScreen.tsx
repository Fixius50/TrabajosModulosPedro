import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the login link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-[1rem] relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[31.25rem] h-[31.25rem] rounded-full bg-primary/30 blur-[6.25rem]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[31.25rem] h-[31.25rem] rounded-full bg-secondary/20 blur-[6.25rem]" />

            <div className="glass-panel w-full max-w-[28rem] p-[2rem] relative z-10 animate-fade-in">
                <div className="flex justify-center mb-[1.5rem]">
                    <div className="bg-white/10 p-[1rem] rounded-full">
                        <Sparkles className="text-primary w-[2rem] h-[2rem]" />
                    </div>
                </div>

                <h2 className="text-[1.875rem] font-bold text-center mb-[0.5rem]">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-muted text-center mb-[2rem]">
                    Manage your finances with clarity and style.
                </p>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-[0.75rem] rounded-lg mb-[1.5rem] text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-[1.25rem]">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-[0.25rem]">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-[1rem] py-[0.75rem] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-[0.25rem]">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-[1rem] py-[0.75rem] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary mt-[1rem] group"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                {isSignUp ? 'Sign Up' : 'Sign In'}
                                <ArrowRight className="w-[1.125rem] h-[1.125rem] group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-[1.5rem] text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-muted hover:text-white transition-colors"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
