import React from 'react';
import { useLocation } from 'react-router-dom';
import Inventory from './Inventory';
import Dashboard from './Dashboard';
import FinancesPage from './FinancesPage';
import GlobalMarketPage from './GlobalMarketPage';
import AccountPage from './AccountPage';
import NavigationDice from './components/dashboard/NavigationDice';
import AnimatedPageTitle from './components/dashboard/AnimatedPageTitle';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Animated Header */}
            <AnimatedPageTitle />

            {/* Page Content with Spatial Transitions */}
            <div className="w-full h-full relative">
                <AnimatePresence mode='wait' initial={false}>
                    <motion.div
                        key={currentTab}
                        initial={{ x: 300, opacity: 0, filter: 'blur(10px)' }}
                        animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                        exit={{ x: -100, opacity: 0, filter: 'blur(10px)' }}
                        transition={{
                            type: 'spring',
                            stiffness: 100,
                            damping: 20,
                            mass: 1
                        }}
                        className="absolute inset-0 w-full h-full overflow-y-auto no-scrollbar"
                    >
                        <div className="pb-40"> {/* Space for Navigation Dice */}
                            {currentTab === 'dashboard' && <Dashboard onUnlock={onUnlock} />}
                            {currentTab === 'inventory' && <Inventory />}
                            {currentTab === 'market' && <GlobalMarketPage />}
                            {currentTab === 'finances' && <FinancesPage />}
                            {currentTab === 'account' && <AccountPage />}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 3D Navigation Dice (The Orb) */}
            <NavigationDice />
        </div>
    );
};

export default MainTabs;
