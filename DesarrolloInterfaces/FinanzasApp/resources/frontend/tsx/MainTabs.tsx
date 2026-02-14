import React from 'react';
import { useTranslation } from 'react-i18next';
import { DungeonDashboard as Dashboard } from './components/dungeon/Dashboard';
import { TransactionsPage } from './components/dungeon/TransactionsPage';
import { MarketPage } from './components/dungeon/MarketPage';
import { InventoryPage } from './components/dungeon/InventoryPage';
import { DungeonSettings as SettingsPage } from './components/dungeon/Settings';
import Profile from './Profile';
import { PageTransition } from './components/common/PageTransition';
import { IonIcon } from '@ionic/react';
import { homeOutline, walletOutline, personOutline, globeOutline, bagHandleOutline, settingsOutline } from 'ionicons/icons';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';

interface MainTabsProps {
    isAppUnlocked: boolean;
    onUnlock: () => void;
}

type Tab = 'dashboard' | 'transactions' | 'market' | 'inventory' | 'settings' | 'profile';

const MainTabs: React.FC<MainTabsProps> = ({ onUnlock, isAppUnlocked }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveTab = (path: string): Tab => {
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('transactions')) return 'transactions';
        if (path.includes('market')) return 'market';
        if (path.includes('inventory')) return 'inventory';
        if (path.includes('settings')) return 'settings';
        if (path.includes('profile')) return 'profile';
        return 'dashboard';
    };

    const currentTab = getActiveTab(location.pathname);

    const handleNavClick = (tab: Tab) => {
        navigate(tab);
    };

    return (
        <div className="flex flex-col h-screen bg-black">
            {/* Main Content Area with Page Transitions */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-20 relative">
                <Routes>
                    <Route path="dashboard" element={<PageTransition><Dashboard onUnlock={onUnlock} isAppUnlocked={isAppUnlocked} /></PageTransition>} />
                    <Route path="transactions" element={<PageTransition><TransactionsPage /></PageTransition>} />
                    <Route path="market" element={<PageTransition><MarketPage /></PageTransition>} />
                    <Route path="inventory" element={<PageTransition><InventoryPage /></PageTransition>} />
                    <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
                    <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="fixed bottom-0 w-full bg-[#1a0a0c] border-t border-[#5d4037] pb-safe z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    <button
                        onClick={() => handleNavClick('dashboard')}
                        className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'dashboard' ? 'text-[#c5a059]' : 'text-[#5d4037] hover:text-[#8a6a4b]'}`}
                    >
                        <IonIcon icon={homeOutline} className={`text-xl ${currentTab === 'dashboard' ? 'animate-pulse' : ''}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t('dungeon.nav.home') || 'Inicio'}</span>
                    </button>

                    <button
                        onClick={() => handleNavClick('transactions')}
                        className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'transactions' ? 'text-[#c5a059]' : 'text-[#5d4037] hover:text-[#8a6a4b]'}`}
                    >
                        <IonIcon icon={walletOutline} className="text-xl" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t('dungeon.nav.vault') || 'Tesoro'}</span>
                    </button>

                    <button
                        onClick={() => handleNavClick('market')}
                        className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'market' ? 'text-[#c5a059]' : 'text-[#5d4037] hover:text-[#8a6a4b]'}`}
                    >
                        <IonIcon icon={globeOutline} className="text-xl" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t('dungeon.nav.market') || 'Mercado'}</span>
                    </button>

                    <button
                        onClick={() => handleNavClick('inventory')}
                        className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'inventory' ? 'text-[#c5a059]' : 'text-[#5d4037] hover:text-[#8a6a4b]'}`}
                    >
                        <IonIcon icon={bagHandleOutline} className="text-xl" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t('dungeon.nav.inventory') || 'Morral'}</span>
                    </button>

                    <button
                        onClick={() => handleNavClick('settings')}
                        className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'settings' ? 'text-[#c5a059]' : 'text-[#5d4037] hover:text-[#8a6a4b]'}`}
                    >
                        <IonIcon icon={settingsOutline} className="text-xl" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t('dungeon.nav.settings') || 'Ajustes'}</span>
                    </button>

                    <button
                        onClick={() => handleNavClick('profile')}
                        className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'profile' ? 'text-[#c5a059]' : 'text-[#5d4037] hover:text-[#8a6a4b]'}`}
                    >
                        <IonIcon icon={personOutline} className="text-xl" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t('dungeon.nav.profile') || 'Perfil'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainTabs;
