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

                <div className="relative z-10 p-6 pt-20 h-full flex flex-col">

                    {/* Normal Header "Finanzas" */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-[Cinzel] text-[#c5a059] uppercase tracking-[0.2em] gold-text-glow">
                            Finanzas
                        </h1>
                        <p className="text-[10px] text-gray-500 font-[MedievalSharp] uppercase tracking-widest mt-1">
                            - Gestión de Activos y Patrimonio -
                        </p>
                    </div>

                    {/* RPG Tabs (Scrolls/Parchments) */}
                    <div className="flex justify-center gap-4 mb-8">
                        {['transactions', 'budgets', 'recurring'].map((view) => (
                            <button
                                key={view}
                                onClick={() => setSelectedView(view as any)}
                                className={`px-4 py-2 rounded-sm border font-[Cinzel] text-xs uppercase tracking-widest transition-all duration-300 ${selectedView === view
                                        ? 'bg-[#8a1c1c] text-[#e2d5b5] border-[#c5a059] shadow-[0_0_15px_rgba(138,28,28,0.5)] transform -translate-y-1'
                                        : 'bg-[#1a1616] text-gray-500 border-[#4a4e5a] hover:border-[#c5a059] hover:text-[#c5a059]'
                                    }`}
                            >
                                {view === 'transactions' && 'Movimientos'}
                                {view === 'budgets' && 'Presupuestos'}
                                {view === 'recurring' && 'Recurrentes'}
                            </button>
                        ))}
                    </div>

                    {/* Content Container (Parchment/Panel Style) */}
                    <div className="flex-1 relative bg-[#1a1616]/60 border border-[#4a4e5a] rounded-lg backdrop-blur-sm p-1 overflow-hidden">
                        {/* Decorative Corners */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#c5a059]"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#c5a059]"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#c5a059]"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#c5a059]"></div>

                        <div className="h-full overflow-y-auto custom-scrollbar p-4">
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
