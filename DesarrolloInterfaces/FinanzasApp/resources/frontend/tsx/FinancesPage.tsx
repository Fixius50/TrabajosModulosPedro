import React, { useState } from 'react';
import {
    IonPage, IonContent
} from '@ionic/react';
import Transactions from './Transactions';
import Budgets from './Budgets';
import RecurringTransactions from './RecurringTransactions';

const FinancesPage: React.FC = () => {
    const [selectedView, setSelectedView] = useState<'transactions' | 'budgets' | 'recurring'>('transactions');

    return (
        <IonPage>
            <IonContent fullscreen className="bg-[#0f0a0a]">
                {/* Background Atmosphere (Same as Dashboard) */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90"></div>
                </div>

                <div className="relative z-10 p-6 pt-24 h-full flex flex-col">
                    {/* Header is handled by AnimatedPageTitle, so we just add extra spacing or a subtle sub-indicator if needed */}
                    <div className="mb-6 opacity-0 pointer-events-none">
                        {/* Spacing for Animated Title */}
                        <div className="h-8"></div>
                    </div>

                    {/* Navigation Tabs (Standard Terminology) */}
                    <div className="flex justify-center gap-2 mb-6">
                        {['transactions', 'budgets', 'recurring'].map((view) => (
                            <button
                                key={view}
                                onClick={() => setSelectedView(view as any)}
                                className={`px-5 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${selectedView === view
                                    ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.3)]'
                                    : 'bg-[#1a1616]/60 text-gray-400 border-[#4a4e5a]/50 hover:border-[#c5a059]/50'
                                    }`}
                            >
                                {view === 'transactions' && 'Transacciones'}
                                {view === 'budgets' && 'Presupuestos'}
                                {view === 'recurring' && 'Recurrentes'}
                            </button>
                        ))}
                    </div>

                    {/* Content Container (Premium Glass Box) */}
                    <div className="flex-1 relative bg-[#1a1616]/20 border border-white/5 rounded-3xl backdrop-blur-xl p-2 overflow-hidden shadow-2xl">
                        <div className="h-full overflow-y-auto custom-scrollbar p-2">
                            <div style={{ display: selectedView === 'transactions' ? 'block' : 'none', height: '100%' }}>
                                <Transactions />
                            </div>
                            <div style={{ display: selectedView === 'budgets' ? 'block' : 'none', height: '100%' }}>
                                <Budgets />
                            </div>
                            <div style={{ display: selectedView === 'recurring' ? 'block' : 'none', height: '100%' }}>
                                <RecurringTransactions />
                            </div>
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default FinancesPage;
