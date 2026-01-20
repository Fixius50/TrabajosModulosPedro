import React from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonPage, IonFooter } from '@ionic/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { pieChartOutline, listOutline, settingsOutline, walletOutline, trendingUpOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Settings from '../pages/Settings';
import ProfilePage from '../pages/Profile';
import Budgets from '../pages/Budgets';
import FantasyMarket from '../pages/FantasyMarket';
import RecurringTransactions from '../pages/RecurringTransactions';

const MainTabs: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const validTabs = ['dashboard', 'transactions', 'budgets', 'market', 'settings', 'profile', 'recurring'];
    let currentTab = location.pathname.split('/').pop() || 'dashboard';

    // Prevent blank screen by validating tab
    if (!validTabs.includes(currentTab)) {
        console.warn('Invalid tab detected:', currentTab, 'Redirecting to dashboard...');
        // We can't navigate immediately during render, but we can default the view to dashboard 
        // while the useEffect (if we added one) or this fallback handles it visually.
        // For visual stability, let's default to dashboard if invalid
        currentTab = 'dashboard';

        // Optional: Force URL sync if needed, but visual fallback is critical first
        if (currentTab !== 'app') { // don't loop indefinitely
            // Use a timeout to avoid render-cycle warning if we wanted to navigate, 
            // but visually overriding is safer and faster.
        }
    }

    console.log('MainTabs Render:', { path: location.pathname, calculatedTab: currentTab });

    return (
        <IonPage style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', width: '100%' }}>
                <div style={{ width: '100%', height: '100%', display: currentTab === 'dashboard' ? 'block' : 'none' }}>
                    <Dashboard />
                </div>
                <div style={{ width: '100%', height: '100%', display: currentTab === 'transactions' ? 'block' : 'none' }}>
                    <Transactions />
                </div>
                <div style={{ width: '100%', height: '100%', display: currentTab === 'budgets' ? 'block' : 'none' }}>
                    <Budgets />
                </div>
                <div style={{ width: '100%', height: '100%', display: currentTab === 'market' ? 'block' : 'none' }}>
                    <FantasyMarket />
                </div>
                <div style={{ width: '100%', height: '100%', display: currentTab === 'settings' ? 'block' : 'none' }}>
                    <Settings />
                </div>
                <div style={{ width: '100%', height: '100%', display: currentTab === 'profile' ? 'block' : 'none' }}>
                    <ProfilePage />
                </div>
                <div style={{ width: '100%', height: '100%', display: currentTab === 'recurring' ? 'block' : 'none' }}>
                    <RecurringTransactions />
                </div>
            </div>

            <div className="ion-hide-md-up">
                <IonFooter>
                    <IonTabBar slot="bottom" selectedTab={currentTab}>
                        <IonTabButton tab="dashboard" selected={currentTab === 'dashboard'} onClick={(e) => { e.preventDefault(); navigate('/app/dashboard'); }}>
                            <IonIcon icon={pieChartOutline} />
                            <IonLabel>{t('app.dashboard')}</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="transactions" selected={currentTab === 'transactions'} onClick={(e) => { e.preventDefault(); navigate('/app/transactions'); }}>
                            <IonIcon icon={listOutline} />
                            <IonLabel>{t('app.transactions')}</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="market" selected={currentTab === 'market'} onClick={(e) => { e.preventDefault(); navigate('/app/market'); }}>
                            <IonIcon icon={trendingUpOutline} />
                            <IonLabel>Mercado</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="budgets" selected={currentTab === 'budgets'} onClick={(e) => { e.preventDefault(); navigate('/app/budgets'); }}>
                            <IonIcon icon={walletOutline} />
                            <IonLabel>{t('app.budgets')}</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="settings" selected={currentTab === 'settings'} onClick={(e) => { e.preventDefault(); navigate('/app/settings'); }}>
                            <IonIcon icon={settingsOutline} />
                            <IonLabel>{t('app.settings')}</IonLabel>
                        </IonTabButton>
                    </IonTabBar>
                </IonFooter>
            </div>
        </IonPage>
    );
};

export default MainTabs;
