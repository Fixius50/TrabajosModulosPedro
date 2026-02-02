import React from 'react';
import { useLocation } from 'react-router-dom';
import Inventory from './Inventory';
import Dashboard from './Dashboard';
import FinancesPage from './FinancesPage';
import GlobalMarketPage from './GlobalMarketPage';
import AccountPage from './AccountPage';
import NavigationDice from './components/dashboard/NavigationDice';
import AnimatedPageTitle from './components/dashboard/AnimatedPageTitle';

interface MainTabsProps {
    isAppUnlocked: boolean;
    onUnlock: () => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ onUnlock }) => {
    const location = useLocation();

    const validTabs = ['dashboard', 'inventory', 'finances', 'market', 'account'];
    let currentTab = location.pathname.split('/').pop() || 'dashboard';

    if (!validTabs.includes(currentTab)) {
        if (['transactions', 'budgets', 'recurring'].includes(currentTab)) currentTab = 'finances';
        else if (['profile', 'settings'].includes(currentTab)) currentTab = 'account';
        else currentTab = 'dashboard';
    }

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {/* Animated Header */}
            <AnimatedPageTitle />

            {/* Page Content */}
            <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
                {currentTab === 'dashboard' && <Dashboard onUnlock={onUnlock} />}
                {currentTab === 'inventory' && <Inventory />}
                {currentTab === 'market' && <GlobalMarketPage />}
                {currentTab === 'finances' && <FinancesPage />}
                {currentTab === 'account' && <AccountPage />}
            </div>

            {/* 3D Navigation Dice */}
            <NavigationDice />
        </div>
    );
};

export default MainTabs;
