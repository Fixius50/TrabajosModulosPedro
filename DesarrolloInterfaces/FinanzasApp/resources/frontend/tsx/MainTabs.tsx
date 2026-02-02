import React from 'react';

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

    // 2. Calculate Spatial Coordinates based on Tab
    // Dashboard: Center (0,0)
    // Inventory: Top (0, -100vh)
    // Market: Left (-100vw, 0)
    // Finances: Right (100vw, 0)
    // Account: Bottom (0, 100vh)

    const getCoordinates = (tab: string) => {
        switch (tab) {
            case 'inventory': return { x: 0, y: 100 }; // Move world DOWN to see TOP
            case 'market': return { x: 100, y: 0 };    // Move world RIGHT to see LEFT
            case 'finances': return { x: -100, y: 0 }; // Move world LEFT to see RIGHT
            case 'account': return { x: 0, y: -100 };  // Move world UP to see BOTTOM
            case 'dashboard':
            default: return { x: 0, y: 0 };
        }
    };

    const { x, y } = getCoordinates(currentTab);

    // Determine if we are on the dashboard
    const isDashboard = currentTab === 'dashboard';

    return (
        <IonPage className="bg-black overflow-hidden relative">

            {/* THE WORLD CONTAINER */}
            {/* THE WORLD CONTAINER */}
            <div
                className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                style={{ transform: `translate3d(${x}vw, ${y}vh, 0)` }}
            >

                {/* 1. DASHBOARD (CENTER 0,0) */}
                <div className="absolute inset-0 w-full h-full z-10 transition-opacity duration-500 delay-200" style={{ opacity: isDashboard ? 1 : 0.2, pointerEvents: isDashboard ? 'auto' : 'none' }}>
                    <Dashboard onUnlock={onUnlock} />
                </div>

                {/* 2. INVENTORY (TOP: 0, -100vh) */}
                <div className="absolute top-[-100vh] left-0 w-full h-full z-10 transition-opacity duration-500 delay-200" style={{ opacity: currentTab === 'inventory' ? 1 : 0.2, pointerEvents: currentTab === 'inventory' ? 'auto' : 'none' }}>
                    <Inventory />
                </div>

                {/* 3. MARKET (LEFT: -100vw, 0) */}
                <div className="absolute top-0 left-[-100vw] w-full h-full z-10 transition-opacity duration-500 delay-200" style={{ opacity: currentTab === 'market' ? 1 : 0.2, pointerEvents: currentTab === 'market' ? 'auto' : 'none' }}>
                    <GlobalMarketPage />
                </div>

                {/* 4. FINANCES (RIGHT: 100vw, 0) */}
                <div className="absolute top-0 left-[100vw] w-full h-full z-10 transition-opacity duration-500 delay-200" style={{ opacity: currentTab === 'finances' ? 1 : 0.2, pointerEvents: currentTab === 'finances' ? 'auto' : 'none' }}>
                    <FinancesPage />
                </div>

                {/* 5. ACCOUNT (BOTTOM: 0, 100vh) */}
                <div className="absolute top-[100vh] left-0 w-full h-full z-10 transition-opacity duration-500 delay-200" style={{ opacity: currentTab === 'account' ? 1 : 0.2, pointerEvents: currentTab === 'account' ? 'auto' : 'none' }}>
                    <AccountPage />
                </div>

            </div>

            {/* NAV RUNE (Floating Navigation Controller) */}
            <NavRune isVisible={isAppUnlocked} />

        </IonPage>
    );
};

export default MainTabs;
