import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import BankAccountManager from './BankAccountManager';
import EnergyWidget from './widgets/EnergyWidget';

interface DashboardProps {
    onUnlock: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onUnlock }) => {
    return (
        <IonPage>
            <IonContent fullscreen>
                <div style={{ padding: '1rem' }}>
                    <EnergyWidget />
                    <BankAccountManager onUnlock={onUnlock} />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;
