import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../ts/supabaseClient';

interface Vault {
    id: string;
    name: string;
    type: string;
    balance: number;
    appearance: 'iron' | 'gold' | 'stone';
    locked?: boolean;
}

interface RoyalVaultsProps {
    vaults: Vault[];
    onSelect: (vault: Vault) => void;
}

export const RoyalVaults: React.FC<RoyalVaultsProps> = ({ vaults, onSelect }) => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="min-h-screen bg-[#1a1814] p-6 flex flex-col items-center">
            {/* Background Texture */}
            <div className="fixed inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBTUME1PTC34u5gy5lQes9d7sripnQ5iYzRhT0pLoc05lBRjN_c7r7tVcV5tNUccNDguW5Zqp5VboiSuGDLzXhfdTWShBryjVFbdPWqKl-mFPnzsfvv4yjbsdDEt-GxnSKz8Exo_e4EHhB-ciU94eN9ZEpJEcXcIdr3OF0cHAClIH3gv59wjxnUChTHV_9rXOXHvKKijggthPkKmcWiZc9rNMMpFFf5dapmlWCGnbM_fp3ggekVk9BRPlahErBxhW0j1JJnrMkbZjbM)', backgroundSize: 'cover' }}></div>

            <header className="relative z-10 text-center mb-12 mt-8">
                <h1 className="text-3xl font-bold text-[#f1a727] uppercase tracking-widest drop-shadow-lg">{t('dungeon.vaults.title')}</h1>
                <p className="text-[#c5a059]/60 italic text-sm">{t('dungeon.vaults.subtitle')}</p>
            </header>

            <main className="relative z-10 w-full overflow-x-auto pb-12 flex space-x-6 px-4 scrollbar-hide min-h-[50vh] items-center justify-center">
                {vaults.length === 0 ? (
                    <div className="text-center p-8 bg-[#2a2824]/80 rounded-xl border-2 border-[#5d4037] backdrop-blur-sm max-w-sm">
                        <span className="material-symbols-outlined text-4xl text-[#c5a059] mb-4">lock_clock</span>
                        <h3 className="text-xl font-bold text-[#f1a727] mb-2">{t('dungeon.vaults.no_vaults_title') || 'Bóveda Vacía'}</h3>
                        <p className="text-[#f2e8cf]/70 text-sm mb-6">{t('dungeon.vaults.no_vaults_msg') || 'No se han encontrado cámaras asignadas a tu linaje. Debes reclamar tu herencia inicial.'}</p>

                        <button
                            onClick={async () => {
                                // Manual initialization fallback
                                try {
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (!user) return;

                                    const { error } = await supabase.from('bank_accounts').insert({
                                        user_id: user.id,
                                        account_name: t('dungeon.vaults.label_checking'),
                                        balance: 100,
                                        account_type: 'checking',
                                        currency: 'GP',
                                        // Required dummy fields
                                        bank_id: 'DUNGEON_BANK',
                                        bank_name: 'Royal Treasury',
                                        country_code: 'DG',
                                        branch_id: 'MAIN',
                                        branch_name: 'Main Hall',
                                        iban: `DG${Math.floor(Math.random() * 1000000000000)}`,
                                        security_code_hash: 'legacy_hash'
                                    });

                                    if (error) {
                                        alert("Error: " + error.message);
                                    } else {
                                        window.location.reload();
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                            }}
                            className="w-full bg-[#d41121] text-white py-3 rounded font-bold uppercase tracking-wider hover:bg-[#8a1c1c] transition-colors shadow-lg"
                        >
                            {t('dungeon.vaults.create_btn') || 'Inicializar Bóveda'}
                        </button>
                    </div>
                ) : (
                    vaults.map((vault, index) => (
                        <button
                            key={vault.id}
                            onClick={() => { setActiveIndex(index); onSelect(vault); }}
                            className={`flex-shrink-0 w-[80vw] sm:w-64 h-[60vh] sm:h-96 relative rounded-2xl transition-all duration-500 transform ${activeIndex === index ? 'scale-105 shadow-[0_0_40px_rgba(241,167,39,0.3)]' : 'scale-95 opacity-50 grayscale'}`}
                        >
                            {/* Chest Box */}
                            <div className={`absolute inset-0 rounded-2xl border-4 ${vault.appearance === 'gold' ? 'bg-gradient-to-b from-[#f1a727] to-[#c5a059] border-[#f1a727]' : 'bg-gradient-to-b from-[#3a3a3c] to-[#1a1814] border-[#3a3a3c]'} overflow-hidden shadow-2xl transition-transform active:scale-95`}>
                                {/* Textures and Details */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full border-x border-black/20"></div>
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-4 border-y border-black/20"></div>

                                {/* Lock */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-16 bg-[#1a1814] rounded-lg border-2 border-gold flex items-center justify-center">
                                    <span className={`material-symbols-outlined text-gold ${vault.locked ? 'text-red-500' : ''}`}>
                                        {vault.locked ? 'lock' : 'lock_open'}
                                    </span>
                                </div>

                                {/* Info Tag */}
                                <div className="absolute bottom-12 inset-x-4 bg-black/60 p-4 rounded-lg backdrop-blur-md">
                                    <h3 className="text-xl font-bold text-[#f1a727]">{vault.name}</h3>
                                    <p className="text-[#c5a059]/70 text-xs uppercase font-bold tracking-tighter">{vault.type}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-2xl font-mono text-white font-bold">{vault.balance.toLocaleString()}</span>
                                        <span className="text-[#f1a727] font-bold">GP</span>
                                    </div>
                                </div>
                            </div>

                            {/* Wood Tag Hanging */}
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#5d4037] border-2 border-[#2b2118] text-[#f2e8cf] font-bold text-xs rounded rotate-3">
                                {vault.appearance === 'gold' ? t('dungeon.vaults.label_savings') : t('dungeon.vaults.label_checking')}
                            </div>
                        </button>
                    ))
                )}
            </main>

            <footer className="relative z-10 w-full max-w-md mt-auto mb-8 bg-[#3a3a3c]/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="flex justify-around text-[#c5a059]/80 uppercase text-[10px] font-bold tracking-widest">
                    <span>{t('dungeon.vaults.footer_treasury')}</span>
                    <span>{t('dungeon.vaults.footer_forge')}</span>
                    <span>{t('dungeon.vaults.footer_market')}</span>
                </div>
            </footer>
        </div>
    );
};
