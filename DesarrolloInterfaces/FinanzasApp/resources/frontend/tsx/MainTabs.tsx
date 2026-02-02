import React, { Suspense } from 'react';
import { IonPage } from '@ionic/react';
import { useLocation } from 'react-router-dom';

import Inventory from './Inventory';
import Dashboard from './Dashboard';
import FinancesPage from './FinancesPage';
import GlobalMarketPage from './GlobalMarketPage';
import AccountPage from './AccountPage';
import NavRune from './NavRune';

interface MainTabsProps {
    isAppUnlocked: boolean;
    onUnlock: () => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ isAppUnlocked, onUnlock }) => {
    const location = useLocation();

    // 1. Determine Current Tab
    const validTabs = ['dashboard', 'inventory', 'finances', 'market', 'account'];
    let currentTab = location.pathname.split('/').pop() || 'dashboard';

    if (!validTabs.includes(currentTab)) {
        if (['transactions', 'budgets', 'recurring'].includes(currentTab)) currentTab = 'finances';
        else if (['profile', 'settings'].includes(currentTab)) currentTab = 'account';
        else currentTab = 'dashboard';
    }

    const getCoordinates = (tab: string) => {
        switch (tab) {
            case 'inventory': return { x: 0, y: 100 };
            case 'market': return { x: 100, y: 0 };
            case 'finances': return { x: -100, y: 0 };
            case 'account': return { x: 0, y: -100 };
            case 'dashboard':
            default: return { x: 0, y: 0 };
        }
    };

    const { x, y } = getCoordinates(currentTab);
    const isDashboard = currentTab === 'dashboard';

    return (
        <IonPage className="bg-black overflow-hidden relative">
            <div
                className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                style={{ transform: `translate3d(${x}vw, ${y}vh, 0)` }}
            >
                {/* 1. DASHBOARD */}
                <div className="absolute inset-0 w-full h-full z-10" style={{ opacity: isDashboard ? 1 : 0, pointerEvents: isDashboard ? 'auto' : 'none' }}>
                    <Suspense fallback={<div className="bg-black h-full flex items-center justify-center text-gold font-[Cinzel]">Invocando Dashboard...</div>}>
                        <Dashboard onUnlock={onUnlock} />
                    </Suspense>
                </div>

                {/* 2. INVENTORY */}
                <div className="absolute top-[-100vh] left-0 w-full h-full z-10" style={{ opacity: currentTab === 'inventory' ? 1 : 0, pointerEvents: currentTab === 'inventory' ? 'auto' : 'none' }}>
                    <Suspense fallback={<div className="bg-black h-full flex items-center justify-center text-gold font-[Cinzel]">Abriendo Cofre...</div>}>
                        <Inventory />
                    </Suspense>
                </div>

                {/* 3. MARKET */}
                <div className="absolute top-0 left-[-100vw] w-full h-full z-10" style={{ opacity: currentTab === 'market' ? 1 : 0, pointerEvents: currentTab === 'market' ? 'auto' : 'none' }}>
                    <Suspense fallback={<div className="bg-black h-full flex items-center justify-center text-gold font-[Cinzel]">Consultando Mercado...</div>}>
                        <GlobalMarketPage />
                    </Suspense>
                </div>

                {/* 4. FINANCES */}
                <div className="absolute top-0 left-[100vw] w-full h-full z-10" style={{ opacity: currentTab === 'finances' ? 1 : 0, pointerEvents: currentTab === 'finances' ? 'auto' : 'none' }}>
                    <Suspense fallback={<div className="bg-black h-full flex items-center justify-center text-gold font-[Cinzel]">Abriendo Arcas...</div>}>
                        <FinancesPage />
                    </Suspense>
                </div>

                {/* 5. ACCOUNT */}
                <div className="absolute top-[100vh] left-0 w-full h-full z-10" style={{ opacity: currentTab === 'account' ? 1 : 0, pointerEvents: currentTab === 'account' ? 'auto' : 'none' }}>
                    <Suspense fallback={<div className="bg-black h-full flex items-center justify-center text-gold font-[Cinzel]">Accediendo al Altar...</div>}>
                        <AccountPage />
                    </Suspense>
                </div>
            </div>

            <NavRune isVisible={true} />
        </IonPage>
    );
};

export default MainTabs;
