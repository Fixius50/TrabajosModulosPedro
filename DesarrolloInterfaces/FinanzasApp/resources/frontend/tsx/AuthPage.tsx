import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from './context/ErrorContext';
import { DungeonLoading } from './components/common/DungeonLoading';
import { GuildInscription } from './features/auth/GuildInscription';
import { supabase } from '../ts/supabaseClient';

interface AuthPageProps {
    onLoginSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
    const { t } = useTranslation();
    const { showError } = useError();
    const [mode, setMode] = useState<'portal' | 'register' | 'login'>('portal');
    const [loading, setLoading] = useState(false);

    // Controlled inputs for login
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const startRegister = () => {
        setLoading(false);
        setMode('register');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Auto-append @gmail.com if missing (safety check in case onBlur didn't fire)
        const email = loginEmail.includes('@') ? loginEmail : `${loginEmail}@gmail.com`;

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: loginPassword,
        });

        if (authError) {
            showError(authError.message);
            setLoading(false);
        } else {
            if (onLoginSuccess) onLoginSuccess();
        }
    };

    const handleRegister = async (data: any) => {
        setLoading(true);

        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    class: data.class,
                }
            }
        });

        if (signUpError) {
            setLoading(false);
            // Propagate error to GuildInscription
            throw signUpError;
        }

        // Crear una bóveda inicial (hierro) para el nuevo usuario
        if (signUpData.user) {
            const { error: insertError } = await supabase.from('bank_accounts').insert({
                user_id: signUpData.user.id,
                account_name: t('dungeon.vaults.label_checking'),
                balance: 100, // Welcome bonus
                account_type: 'checking',
                currency: 'GP',
                // Required dummy fields for schema compliance
                bank_id: 'DUNGEON_BANK',
                bank_name: 'Royal Treasury',
                country_code: 'DG',
                branch_id: 'MAIN',
                branch_name: 'Main Hall',
                iban: `DG${Math.floor(Math.random() * 1000000000000)}`,
                security_code_hash: 'legacy_hash'
            });

            if (insertError) {
                console.error("AuthPage: Error creating bank account:", insertError);
                // We don't block login, but we log it.
                // The UI will show empty state, but we can handle it there.
            } else {
                console.log("AuthPage: Bank account created successfully.");
            }
        }

        if (onLoginSuccess) onLoginSuccess();
    };

    return (
        <div className="min-h-screen bg-[#05070a] relative overflow-hidden font-sans flex items-center justify-center p-6">
            {loading && <DungeonLoading />}

            {/* Background Texture */}
            <div className="stone-texture fixed inset-0 z-0 opacity-40 pointer-events-none"></div>

            <div className="relative z-10 max-w-md w-full bg-[#f2e8cf] p-1 scale-100 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border-4 border-[#5d4037]">
                <div className="bg-[#f2e8cf] p-8 rounded-lg relative">
                    {/* Inner border */}
                    <div className="absolute inset-2 border-2 border-[#5d4037]/20 pointer-events-none"></div>

                    <header className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-[#5d4037] uppercase tracking-widest mb-2 font-serif">
                            {t('dungeon.portal.title') || 'Portal de Acceso'}
                        </h1>
                        <div className="h-1 w-24 bg-[#d41121] mx-auto rounded-full"></div>
                    </header>

                    {mode === 'portal' ? (
                        <div className="space-y-6">
                            <p className="text-[#2d241e] text-center italic mb-8 opacity-70">
                                {t('dungeon.portal.welcome') || 'Bienvenido aventurero'}
                            </p>

                            <button
                                onClick={() => setMode('login')}
                                className="w-full bg-[#5d4037] text-[#f2e8cf] py-4 rounded font-bold uppercase tracking-wider hover:bg-[#2d241e] transition-all shadow-lg flex items-center justify-center gap-3"
                            >
                                <span className="material-symbols-outlined">key</span>
                                {t('dungeon.portal.resume') || 'Reanudar Aventura'}
                            </button>

                            <div className="relative flex items-center py-4">
                                <div className="flex-grow border-t border-[#5d4037]/30"></div>
                                <span className="flex-shrink mx-4 text-[#5d4037]/50 text-xs font-bold uppercase">{t('dungeon.portal.or') || 'O'}</span>
                                <div className="flex-grow border-t border-[#5d4037]/30"></div>
                            </div>

                            <button
                                onClick={() => setMode('register')}
                                className="w-full border-2 border-[#5d4037] text-[#5d4037] py-4 rounded font-bold uppercase tracking-wider hover:bg-[#5d4037] hover:text-[#f2e8cf] transition-all flex items-center justify-center gap-3"
                            >
                                <span className="material-symbols-outlined">edit_note</span>
                                {t('dungeon.portal.new') || 'Nueva Inscripción'}
                            </button>
                        </div>
                    ) : mode === 'register' ? (
                        <div className="animate-fade-in">
                            {/* Error handling delegated to component */}
                            <GuildInscription
                                onComplete={handleRegister}
                                onCancel={() => setMode('portal')}
                            />
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="animate-fade-in">
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-[#5d4037] mb-1">{t('dungeon.registration.email_label')}</label>
                                            <input
                                                type="text"
                                                required
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                onBlur={() => {
                                                    if (loginEmail && !loginEmail.includes('@')) {
                                                        setLoginEmail(loginEmail + '@gmail.com');
                                                    }
                                                }}
                                                className="w-full bg-transparent border-b-2 border-[#5d4037] text-[#2d241e] focus:outline-none focus:border-[#d41121] py-2"
                                                placeholder="hero"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-[#5d4037] mb-1">{t('dungeon.registration.cipher_label')}</label>
                                            <input
                                                type="password"
                                                required
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className="w-full bg-transparent border-b-2 border-[#5d4037] text-[#2d241e] focus:outline-none focus:border-[#d41121] py-2"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#d41121] text-white py-4 rounded font-bold uppercase tracking-wider hover:bg-[#8a1c1c] transition-all shadow-xl flex items-center justify-center gap-3"
                                    >
                                        <span className="material-symbols-outlined">{loading ? 'hourglass_empty' : 'login'}</span>
                                        {loading ? t('dungeon.auth.unlocking') : t('dungeon.auth.enter')}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={startRegister}
                                        className="w-full text-[#5d4037]/60 text-xs underline underline-offset-4 font-bold mt-4"
                                    >
                                        {t('dungeon.portal.register_cta') || 'Registrarse'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setMode('portal')}
                                        className="w-full text-[#5d4037]/40 text-[10px] uppercase font-bold mt-2 tracking-tighter"
                                    >
                                        {t('dungeon.auth.return') || 'Volver atrás'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .stone-texture {
                    background-image: linear-gradient(rgba(34,16,18,0.8), rgba(34,16,18,0.9)), url(https://lh3.googleusercontent.com/aida-public/AB6AXuBTUME1PTC34u5gy5lQes9d7sripnQ5iYzRhT0pLoc05lBRjN_c7r7tVcV5tNUccNDguW5Zqp5VboiSuGDLzXhfdTWShBryjVFbdPWqKl-mFPnzsfvv4yjbsdDEt-GxnSKz8Exo_e4EHhB-ciU94eN9ZEpJEcXcIdr3OF0cHAClIH3gv59wjxnUChTHV_9rXOXHvKKijggthPkKmcWiZc9rNMMpFFf5dapmlWCGnbM_fp3ggekVk9BRPlahErBxhW0j1JJnrMkbZjbM);
                    background-size: cover;
                    background-position: center;
                }
                .animate-fade-in { animation: fade-in 0.4s ease-out; }
                @keyframes fade-in { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
};

export default AuthPage;
