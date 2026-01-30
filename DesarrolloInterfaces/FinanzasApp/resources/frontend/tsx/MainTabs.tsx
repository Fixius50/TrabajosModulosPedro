import React, { useState } from 'react';

import { IonPage } from '@ionic/react';
import { useLocation } from 'react-router-dom';

import Inventory from './Inventory';
import Dashboard from './Dashboard';
import FinancesPage from './FinancesPage';
import GlobalMarketPage from './GlobalMarketPage';
import AccountPage from './AccountPage';

const MainTabs: React.FC = () => {
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
                    <Dashboard />
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

            {/* GLOBAL HOLOGRAPHIC HUD (Overlay) */}
            <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between p-4">

                {/* Top Bar: Context Info (Visible if not on Dashboard) */}
                <div className={`flex justify-between items-start transition-opacity duration-500 ${isDashboard ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex flex-col">
                        <span className="material-symbols-outlined text-[#c5a059] text-2xl drop-shadow-[0_0_5px_rgba(197,160,89,0.8)]">astrophotography_mode</span>
                    </div>
                </div>

                {/* Bottom Bar: Navigation Compass & Ticker */}
                <div className="w-full flex flex-col items-center gap-2 mb-2">

                    {/* Compass / Back Button (Only if not on Dashboard) */}
                    {!isDashboard && (
                        <a
                            href="/app/dashboard"
                            className="pointer-events-auto bg-black/50 hover:bg-[#c5a059]/10 border border-[#c5a059] text-[#c5a059] rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(197,160,89,0.3)] transition-all hover:scale-110"
                        >
                            <span className="material-symbols-outlined">explore</span>
                        </a>
                    )}

                    {/* Global Ticker (Always Visible, matching reference) */}
                    <div className="w-full bg-[#0a080c]/90 border-t border-b border-[#c5a059]/20 backdrop-blur-md overflow-hidden py-1 pointer-events-auto">
                        <div className="whitespace-nowrap flex gap-8 animate-marquee text-[10px] font-mono text-[#c5a059]">
                            {/* Duplicate items for seamless loop */}
                            <span>BTC: $48,200 <span className="text-green-500">▲ 2.4%</span></span>
                            <span className="text-gray-600">|</span>
                            <span>ETH: $3,150 <span className="text-red-500">▼ 0.8%</span></span>
                            <span className="text-gray-600">|</span>
                            <span>ORO: $2,045 <span className="text-green-500">▲ 0.1%</span></span>
                            <span className="text-gray-600">|</span>
                            <span>MANA: 100% (Estable)</span>
                            <span className="text-gray-600">|</span>
                            <span>SISTEMA: EN LÍNEA</span>

                            <span className="ml-8 text-white/20">///</span>

                            <span>BTC: $48,200 <span className="text-green-500">▲ 2.4%</span></span>
                            <span className="text-gray-600">|</span>
                            <span>ETH: $3,150 <span className="text-red-500">▼ 0.8%</span></span>
                            <span className="text-gray-600">|</span>
                            <span>ORO: $2,045 <span className="text-green-500">▲ 0.1%</span></span>
                        </div>
                    </div>
                </div>

            </div>

        </IonPage>
    );
};

export default MainTabs;
