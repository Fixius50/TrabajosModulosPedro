import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
    const { t } = useTranslation();
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
                    options: {
                        emailRedirectTo: window.location.origin
                    }
                });
                if (error) throw error;
                // Redirect directly to dashboard assuming user followed the Supabase config instruction
                navigate('/');
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

    const handleOAuth = async (provider: 'google') => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
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
                    {isSignUp ? t('sign_up') : t('login_welcome')}
                </h2>
                <p className="text-muted text-center mb-[2rem]">
                    {t('login_subtitle')}
                </p>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-[0.75rem] rounded-lg mb-[1.5rem] text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-[1.25rem]">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-[0.25rem]">{t('email')}</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-[1rem] py-[0.75rem] text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20"
                            placeholder="tu@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-[0.25rem]">{t('password')}</label>
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
                        {loading ? t('processing') : (
                            <>
                                {isSignUp ? t('sign_up') : t('sign_in')}
                                <ArrowRight className="w-[1.125rem] h-[1.125rem] group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative my-8 text-center text-sm">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <span className="relative px-4 bg-[#0f172a] text-stone-500 uppercase tracking-widest text-[0.625rem]">O accede con</span>
                </div>

                <div className="mt-8">
                    <button
                        onClick={() => handleOAuth('google')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all group"
                    >
                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                        <span className="text-sm font-bold text-stone-300 group-hover:text-white">Acceder con Google</span>
                    </button>
                </div>

                <div className="mt-[1.5rem] text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-muted hover:text-white transition-colors"
                    >
                        {isSignUp ? t('has_account') : t('no_account')}
                    </button>
                </div>
            </div>
        </div>
    );
}
