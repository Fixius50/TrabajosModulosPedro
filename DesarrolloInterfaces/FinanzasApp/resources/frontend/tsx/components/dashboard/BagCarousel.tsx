import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import { lockClosed, lockOpen, walletOutline } from 'ionicons/icons';
import type { BankAccount } from '../../../ts/bankAccountService';
import CoinValue from './CoinValue';

interface BagCarouselProps {
    accounts: BankAccount[];
    onSelectAccount: (account: BankAccount) => void;
    unlockedAccounts: Set<string>;
}

const BagCarousel: React.FC<BagCarouselProps> = ({ accounts, onSelectAccount, unlockedAccounts }) => {
    const [selectedGroup, setSelectedGroup] = useState<string>('Todas');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter accounts by group
    const groups = useMemo(() => {
        const uniqueGroups = Array.from(new Set(accounts.map(acc => acc.group_name || 'General')));
        return ['Todas', ...uniqueGroups];
    }, [accounts]);

    const filteredAccounts = useMemo(() => {
        if (selectedGroup === 'Todas') return accounts;
        return accounts.filter(acc => acc.group_name === selectedGroup);
    }, [accounts, selectedGroup]);

    // Reset index when changing group
    React.useEffect(() => {
        setCurrentIndex(0);
    }, [selectedGroup]);

    const nextAccount = () => {
        setCurrentIndex((prev) => (prev + 1) % filteredAccounts.length);
    };

    const prevAccount = () => {
        setCurrentIndex((prev) => (prev - 1 + filteredAccounts.length) % filteredAccounts.length);
    };

    if (accounts.length === 0) return null;

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">

            {/* Group Selector "Bolsas" */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar w-full justify-center">
                {groups.map(group => (
                    <button
                        key={group}
                        onClick={() => setSelectedGroup(group)}
                        className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all ${selectedGroup === group
                            ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {group}
                    </button>
                ))}
            </div>

            {/* Carousel Container */}
            <div className="relative w-full max-w-[400px] h-[220px] flex items-center justify-center perspective-[1000px]">
                <AnimatePresence mode='popLayout'>
                    {filteredAccounts.length > 0 ? (
                        <motion.div
                            key={filteredAccounts[currentIndex].id}
                            initial={{ rotateY: -45, x: 100, opacity: 0, scale: 0.8 }}
                            animate={{ rotateY: 0, x: 0, opacity: 1, scale: 1 }}
                            exit={{ rotateY: 45, x: -100, opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            onClick={() => onSelectAccount(filteredAccounts[currentIndex])}
                            className="relative w-full h-full bg-gradient-to-br from-[#1a1616] to-[#0f0a0a] rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer group overflow-hidden p-6 flex flex-col justify-between"
                        >
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            {/* Card Decoration */}
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <IonIcon icon={walletOutline} style={{ fontSize: '120px', color: '#d4af37' }} />
                            </div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                                        <span className="text-[10px] text-[#d4af37]/60 tracking-[0.2em] uppercase font-bold">
                                            {filteredAccounts[currentIndex].bank_name}
                                        </span>
                                    </div>
                                    <h3 className="text-xl text-white font-[Cinzel] tracking-tight truncate max-w-[200px]">
                                        {filteredAccounts[currentIndex].account_name}
                                    </h3>
                                </div>
                                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                                    <IonIcon
                                        icon={unlockedAccounts.has(filteredAccounts[currentIndex].id) ? lockOpen : lockClosed}
                                        className={unlockedAccounts.has(filteredAccounts[currentIndex].id) ? 'text-green-400' : 'text-amber-500/50'}
                                    />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Tesoro Disponible</p>
                                {unlockedAccounts.has(filteredAccounts[currentIndex].id) ? (
                                    <CoinValue value={filteredAccounts[currentIndex].balance} type="income" />
                                ) : (
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 animate-pulse" />)}
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 flex justify-between items-center mt-4">
                                <span className="text-[10px] font-mono text-gray-600 tracking-tighter">
                                    {unlockedAccounts.has(filteredAccounts[currentIndex].id)
                                        ? filteredAccounts[currentIndex].iban.replace(/(.{4})/g, '$1 ')
                                        : '•••• •••• •••• •••• •••• ••••'}
                                </span>
                                <div className="text-[8px] bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded border border-[#d4af37]/20 uppercase font-bold">
                                    {filteredAccounts[currentIndex].group_name || 'General'}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-[Cinzel] uppercase text-xs tracking-widest border border-dashed border-white/10 rounded-2xl">
                            Bolsa vacia
                        </div>
                    )}
                </AnimatePresence>

                {/* Navigation Arrows */}
                {filteredAccounts.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevAccount(); }}
                            className="absolute -left-12 p-3 text-white/20 hover:text-white transition-colors"
                        >
                            <span className="text-2xl">‹</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextAccount(); }}
                            className="absolute -right-12 p-3 text-white/20 hover:text-white transition-colors"
                        >
                            <span className="text-2xl">›</span>
                        </button>
                    </>
                )}
            </div>

            {/* Indicator Dots */}
            {filteredAccounts.length > 1 && (
                <div className="flex gap-1.5 mt-8">
                    {filteredAccounts.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 transition-all duration-300 rounded-full ${i === currentIndex ? 'w-8 bg-[#d4af37]' : 'w-2 bg-white/10'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BagCarousel;
