import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import { pieChartOutline, listOutline, settingsOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Settings from '../pages/Settings';
import ProfilePage from '../pages/Profile';

const MainTabs: React.FC = () => {
    const { t } = useTranslation();

    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route path="/app/dashboard" component={Dashboard} exact={true} />
                <Route path="/app/transactions" component={Transactions} exact={true} />
                <Route path="/app/settings" component={Settings} exact={true} />
                <Route path="/app/profile" component={ProfilePage} exact={true} />
                <Route exact path="/app">
                    <Redirect to="/app/dashboard" />
                </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
                <IonTabButton tab="dashboard" href="/app/dashboard">
                    <IonIcon icon={pieChartOutline} />
                    <IonLabel>{t('app.dashboard')}</IonLabel>
                </IonTabButton>
                <IonTabButton tab="transactions" href="/app/transactions">
                    <IonIcon icon={listOutline} />
                    <IonLabel>{t('app.transactions')}</IonLabel>
                </IonTabButton>
                <IonTabButton tab="settings" href="/app/settings">
                    <IonIcon icon={settingsOutline} />
                    <IonLabel>{t('app.settings')}</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default MainTabs;
