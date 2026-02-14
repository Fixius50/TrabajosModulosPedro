import React, { useState } from 'react';
import { supabase } from '../../../ts/supabaseClient';
import { useTranslation } from 'react-i18next';
import { useError } from '../../context/ErrorContext';

interface GuildInscriptionProps {
    onComplete: (data: any) => void;
    onCancel: () => void;
}

export const GuildInscription: React.FC<GuildInscriptionProps> = ({ onComplete, onCancel }) => {
    const { t } = useTranslation();
    const { showError } = useError();
    const [step, setStep] = useState(1);
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [emailValid, setEmailValid] = useState<boolean | null>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCredentials({ ...credentials, email: val });
        setEmailValid(validateEmail(val));
    };

    // Limpieza de formulario al montar
    React.useEffect(() => {
        setCredentials({ email: '', password: '' });
        setStep(1);
    }, []);

    const safeSubmit = async () => {
        try {
            // Default class 'adventurer' since selection is removed
            await onComplete({ ...credentials, class: 'adventurer' });
        } catch (error: any) {
            console.error("Registration failed:", error);
            // If user exists or other specific errors, go back to Step 1
            if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('user already exists')) {
                setStep(1);
                showError(t('dungeon.registration.error_exists') || 'Este correo ya está registrado en el gremio.');
            } else {
                showError(error.message || 'Error desconocido');
            }
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) showError(error.message);
    };

    return (
        <div className="min-h-screen bg-[#221012] font-serif text-slate-100 p-6 flex flex-col items-center">
            {/* Background Textures (Simulated from Stitch design) */}
            <div className="fixed inset-0 opacity-40 pointer-events-none"
                style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBTUME1PTC34u5gy5lQes9d7sripnQ5iYzRhT0pLoc05lBRjN_c7r7tVcV5tNUccNDguW5Zqp5VboiSuGDLzXhfdTWShBryjVFbdPWqKl-mFPnzsfvv4yjbsdDEt-GxnSKz8Exo_e4EHhB-ciU94eN9ZEpJEcXcIdr3OF0cHAClIH3gv59wjxnUChTHV_9rXOXHvKKijggthPkKmcWiZc9rNMMpFFf5dapmlWCGnbM_fp3ggekVk9BRPlahErBxhW0j1JJnrMkbZjbM)', backgroundSize: 'cover' }}></div>

            <header className="relative z-10 text-center mb-12">
                <h1 className="text-4xl font-bold text-[#c5a059] mb-2 drop-shadow-md">{t('dungeon.registration.title')}</h1>
                <p className="text-[#d41121] italic opacity-80">{t('dungeon.registration.subtitle')}</p>
            </header>

            <main className="relative z-10 w-full max-w-md">
                <div className="w-full max-w-sm mx-auto">
                    {step === 1 && (
                        <section className="animate-slide-up">
                            <h2 className="text-center text-[#c5a059] uppercase tracking-widest text-sm font-bold mb-8">{t('dungeon.registration.datos_acceso') || 'Datos de Acceso'}</h2>
                            <div className="bg-[#f2e8cf] p-8 rounded-lg shadow-2xl relative overflow-hidden deckle-edge">
                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #5d4037 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                                <div className="space-y-6 relative z-10">
                                    {/* Error Modal handles errors globally now */}
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-[#5d4037] mb-1">{t('dungeon.registration.email_label')}</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={credentials.email}
                                                onChange={handleEmailChange}
                                                className={`w-full bg-white/50 border-b-2 text-[#2d241e] font-bold focus:outline-none py-2 px-2 rounded-t ${emailValid === true ? 'border-green-600' : emailValid === false ? 'border-red-500' : 'border-[#5d4037] focus:border-[#d41121]'}`}
                                                placeholder="nombre@ejemplo.com"
                                                onBlur={(e) => {
                                                    const val = e.target.value;
                                                    if (val && !val.includes('@')) {
                                                        const newVal = val + '@gmail.com';
                                                        setCredentials({ ...credentials, email: newVal });
                                                        setEmailValid(validateEmail(newVal));
                                                    }
                                                }}
                                            />
                                            {emailValid === true && <span className="material-symbols-outlined absolute right-2 top-2 text-green-600">check_circle</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-[#5d4037] mb-1">{t('dungeon.registration.cipher_label')}</label>
                                        <input
                                            type="password"
                                            value={credentials.password}
                                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                            className="w-full bg-white/50 border-b-2 border-[#5d4037] text-[#2d241e] font-bold focus:outline-none focus:border-[#d41121] py-2 px-2 rounded-t"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!credentials.email || !credentials.password || emailValid === false}
                                        className="w-full bg-[#5d4037] text-[#f2e8cf] py-3 rounded font-bold uppercase tracking-wider hover:bg-[#2d241e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg"
                                    >
                                        {t('dungeon.registration.prepare_seal')}
                                    </button>

                                    <button
                                        onClick={onCancel}
                                        className="w-full text-[#5d4037]/60 text-xs underline underline-offset-4 font-bold mt-2 text-center hover:text-[#5d4037]"
                                    >
                                        {t('dungeon.auth.return') || 'Volver al portal'}
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section className="flex flex-col items-center animate-bounce-in w-full">
                            <h2 className="text-center text-[#c5a059] uppercase tracking-widest text-sm font-bold mb-8">{t('dungeon.registration.confirm_title') || 'Confirmación'}</h2>

                            <div className="flex flex-col gap-4 w-full mb-12">
                                {/* Error Modal handles errors globally now */}
                                <button
                                    onClick={safeSubmit}
                                    className="w-full py-4 bg-[#d41121] text-white font-bold rounded-lg shadow-xl hover:bg-[#8a1c1c] transition-all flex items-center justify-center gap-3"
                                >
                                    <span className="material-symbols-outlined">how_to_reg</span>
                                    {t('dungeon.registration.join_button').replace('\n', ' ')}
                                </button>

                                <div className="flex items-center gap-4 my-2">
                                    <div className="flex-1 h-[1px] bg-[#c5a059]/30"></div>
                                    <span className="text-[10px] text-[#c5a059]/60 uppercase font-bold tracking-widest">{t('dungeon.portal.or') || 'O'}</span>
                                    <div className="flex-1 h-[1px] bg-[#c5a059]/30"></div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={handleGoogleLogin}
                                        className="py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-5 h-5" alt="Google" />
                                        <span className="text-xs font-bold">Continuar con Google</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="text-[#c5a059] text-xs underline opacity-60 hover:opacity-100 mb-6"
                            >
                                {t('settings.back_label') || 'Volver atrás'}
                            </button>

                            <p className="text-[#c5a059]/60 text-center text-[10px] italic leading-relaxed px-4">{t('dungeon.registration.contract_text')}</p>
                        </section>
                    )}
                </div>
            </main>

            <style>{`
                .deckle-edge {
                    clip-path: polygon(0% 0%, 5% 2%, 10% 0%, 15% 3%, 20% 1%, 25% 4%, 30% 0%, 35% 2%, 40% 1%, 45% 3%, 50% 0%, 55% 2%, 60% 1%, 65% 4%, 70% 2%, 75% 5%, 80% 2%, 85% 4%, 90% 1%, 95% 3%, 100% 0%, 100% 100%, 95% 98%, 90% 100%, 85% 97%, 80% 99%, 75% 96%, 70% 98%, 65% 96%, 60% 99%, 55% 97%, 50% 100%, 45% 97%, 40% 99%, 35% 97%, 30% 100%, 25% 96%, 20% 98%, 15% 97%, 10% 100%, 5% 98%, 0% 100%);
                }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes bounce-in { 
                    0% { transform: scale(0.8); opacity: 0; }
                    70% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
                .animate-slide-up { animation: slide-up 0.5s ease-out; }
                .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                
                /* Force input text color and background to ensure visibility */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px #f2e8cf inset !important;
                    -webkit-text-fill-color: #2d241e !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
                
                /* Ensure placeholder and standard text contrast */
                input {
                    color: #2d241e !important; 
                    background-color: rgba(255, 255, 255, 0.5) !important;
                }
                input::placeholder {
                    color: rgba(93, 64, 55, 0.5) !important;
                }
            `}</style>
        </div>
    );
};
