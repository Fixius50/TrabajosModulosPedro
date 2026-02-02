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
            <IonContent fullscreen style={{ '--background': '#0f0a0a' }}>
                <div className="relative min-h-screen bg-[#0f0a0a] pb-20 pt-6 px-4">
                    <EnergyWidget />
                    <div className="mt-4">
                        <BankAccountManager onUnlock={onUnlock} />
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;
