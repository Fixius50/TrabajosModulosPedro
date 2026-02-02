import React from 'react';
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

    const validTabs = ['dashboard', 'inventory', 'finances', 'market', 'account'];
    let currentTab = location.pathname.split('/').pop() || 'dashboard';

    if (!validTabs.includes(currentTab)) {
        if (['transactions', 'budgets', 'recurring'].includes(currentTab)) currentTab = 'finances';
        else if (['profile', 'settings'].includes(currentTab)) currentTab = 'account';
        else currentTab = 'dashboard';
    }

    return (
        <>
            {currentTab === 'dashboard' && <Dashboard onUnlock={onUnlock} />}
            {currentTab === 'inventory' && <Inventory />}
            {currentTab === 'market' && <GlobalMarketPage />}
            {currentTab === 'finances' && <FinancesPage />}
            {currentTab === 'account' && <AccountPage />}

            {/* Navigation always visible */}
            <NavRune isVisible={true} />
        </>
    );
};

export default MainTabs;
