import React, { useState } from 'react';
import { DungeonDashboard as Dashboard } from './components/dungeon/Dashboard';
import { TransactionsPage } from './components/dungeon/TransactionsPage';
import { MarketPage } from './components/dungeon/MarketPage';
import { InventoryPage } from './components/dungeon/InventoryPage';
import AccountPage from './AccountPage';
import { IonIcon } from '@ionic/react';
import { homeOutline, walletOutline, personOutline, globeOutline, bagHandleOutline } from 'ionicons/icons';

interface MainTabsProps {
    isAppUnlocked: boolean;
    onUnlock: () => void;
}

// Tab Types
type Tab = 'dashboard' | 'transactions' | 'market' | 'inventory' | 'account';

const MainTabs: React.FC<MainTabsProps> = ({ onUnlock }) => {
    const [currentTab, setCurrentTab] = useState<Tab>('dashboard');

    return (
        <div className="flex flex-col h-screen bg-black">
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-20 relative">
                {currentTab === 'dashboard' && <Dashboard onUnlock={onUnlock} />}
                {currentTab === 'transactions' && <TransactionsPage />}
                {currentTab === 'market' && <MarketPage />}
                {currentTab === 'inventory' && <InventoryPage />}
                {currentTab === 'account' && <AccountPage />}
            </div>

            {/* Mobile Navigation Bar */}
            <div className="fixed bottom-0 left-0 w-full h-16 bg-[#1a0b1f] border-t border-[#4a2b5a] flex justify-around items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
                <NavButton
                    active={currentTab === 'dashboard'}
                    onClick={() => setCurrentTab('dashboard')}
                    icon={homeOutline}
                    label="Treasury"
                />

                <NavButton
                    active={currentTab === 'market'}
                    onClick={() => setCurrentTab('market')}
                    icon={globeOutline}
                    label="Market"
                />

                {/* FAB-like center button for Ledger */}
                <button
                    onClick={() => setCurrentTab('transactions')}
                    className={`relative -top-5 w-14 h-14 rounded-full border-4 border-[#1a0b1f] flex items-center justify-center shadow-lg transition-transform ${currentTab === 'transactions' ? 'bg-gold-coin text-black scale-110' : 'bg-[#4a2b5a] text-parchment'}`}
                >
                    <IonIcon icon={walletOutline} className="text-2xl" />
                </button>

                <NavButton
                    active={currentTab === 'inventory'}
                    onClick={() => setCurrentTab('inventory')}
                    icon={bagHandleOutline}
                    label="Hoard"
                />

                <NavButton
                    active={currentTab === 'account'}
                    onClick={() => setCurrentTab('account')}
                    icon={personOutline}
                    label="Guild"
                />
            </div>
        </div>
    );
};

// Helper Component for Nav Items
const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 w-16 ${active ? 'text-gold-coin' : 'text-gray-500 hover:text-gray-300'}`}
    >
        <IonIcon icon={icon} className={`text-xl transition-all ${active ? 'scale-110' : ''}`} />
        <span className="text-[9px] uppercase font-bold tracking-widest">{label}</span>
    </button>
);

export default MainTabs;

