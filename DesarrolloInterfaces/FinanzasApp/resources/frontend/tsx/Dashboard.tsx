import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import BankAccountManager from './BankAccountManager.tsx';

const Dashboard: React.FC = () => {
    // Hide IonTabBar when on this page to prevent "double nav" and "mystery buttons"
    React.useEffect(() => {
        const tabBar = document.querySelector('ion-tab-bar');
        if (tabBar) tabBar.style.display = 'none';
        return () => {
            if (tabBar) tabBar.style.display = 'flex';
        };
    }, []);

    return (
        <IonPage>
            <IonContent fullscreen>
                <BankAccountManager />
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;
