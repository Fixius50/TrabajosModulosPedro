import React from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonPage, IonFooter } from '@ionic/react';
import { Route, Navigate, Routes, useLocation, useNavigate } from 'react-router-dom';
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

    const currentTab = location.pathname.split('/').pop() || 'dashboard';

    return (
        <IonPage>
            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="budgets" element={<Budgets />} />
                    <Route path="market" element={<FantasyMarket />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="recurring" element={<RecurringTransactions />} />
                    <Route path="/" element={<Navigate to="dashboard" />} />
                </Routes>
            </div>

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
        </IonPage>
    );
};

export default MainTabs;
