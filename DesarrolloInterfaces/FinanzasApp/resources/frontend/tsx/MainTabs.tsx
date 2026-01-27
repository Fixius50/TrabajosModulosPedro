import React, { useEffect } from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonPage, IonFooter } from '@ionic/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { pieChartOutline, walletOutline, trendingUpOutline, personCircleOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import Dashboard from '../pages/Dashboard';
import FinancesPage from '../pages/FinancesPage';
import GlobalMarketPage from '../pages/GlobalMarketPage';
import AccountPage from '../pages/AccountPage';

const MainTabs: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Valid tabs for the new structure
    const validTabs = ['dashboard', 'finances', 'market', 'account'];
    let currentTab = location.pathname.split('/').pop() || 'dashboard';

    // Auto-redirect valid old routes to new containers
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/transactions') || path.includes('/budgets') || path.includes('/recurring')) {
            // These are now sub-tabs of FinancesPage, handled internally by state, 
            // but for main nav highlighting we treat them as 'finances'
            // NOTE: Deep linking to sub-tabs inside FinancesPage would require passing props or context,
            // for now, we just ensure the MainTab highlights 'Finances'.
        }
    }, [location.pathname]);

    // Safety check
    if (!validTabs.includes(currentTab)) {
        // If it's one of the old routes, map it visually to the new parent
        if (['transactions', 'budgets', 'recurring'].includes(currentTab)) currentTab = 'finances';
        else if (['profile', 'settings'].includes(currentTab)) currentTab = 'account';
        else currentTab = 'dashboard';
    }

    return (
        <IonPage style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', zIndex: 1000, boxSizing: 'border-box', position: 'absolute', top: 0, left: 0 }}>
            <div style={{ flex: '1 1 auto', overflow: 'hidden', position: 'relative', width: '100%', display: 'flex', flexDirection: 'column' }}>

                {/* 1. DASHBOARD */}
                <div style={{ flex: 1, width: '100%', display: currentTab === 'dashboard' ? 'flex' : 'none', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <Dashboard />
                    </div>
                </div>

                {/* 2. FINANCES (Unified) */}
                <div style={{ width: '100%', height: '100%', display: currentTab === 'finances' ? 'block' : 'none' }}>
                    <FinancesPage />
                </div>

                {/* 3. MARKET (Unified) */}
                <div style={{ width: '100%', height: '100%', display: currentTab === 'market' ? 'block' : 'none' }}>
                    <GlobalMarketPage />
                </div>

                {/* 4. ACCOUNT (Unified) */}
                <div style={{ width: '100%', height: '100%', display: currentTab === 'account' ? 'block' : 'none' }}>
                    <AccountPage />
                </div>
            </div>

            <div className="ion-hide-md-up">
                <IonFooter>
                    <IonTabBar slot="bottom" selectedTab={currentTab}>
                        <IonTabButton tab="dashboard" selected={currentTab === 'dashboard'} onClick={(e) => { e.preventDefault(); navigate('/app/dashboard'); }}>
                            <IonIcon icon={pieChartOutline} />
                            <IonLabel>{t('app.dashboard')}</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="finances" selected={currentTab === 'finances'} onClick={(e) => { e.preventDefault(); navigate('/app/finances'); }}>
                            <IonIcon icon={walletOutline} />
                            <IonLabel>Finanzas</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="market" selected={currentTab === 'market'} onClick={(e) => { e.preventDefault(); navigate('/app/market'); }}>
                            <IonIcon icon={trendingUpOutline} />
                            <IonLabel>Mercado</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="account" selected={currentTab === 'account'} onClick={(e) => { e.preventDefault(); navigate('/app/account'); }}>
                            <IonIcon icon={personCircleOutline} />
                            <IonLabel>Cuenta</IonLabel>
                        </IonTabButton>
                    </IonTabBar>
                </IonFooter>
            </div>
        </IonPage>
    );
};

export default MainTabs;
