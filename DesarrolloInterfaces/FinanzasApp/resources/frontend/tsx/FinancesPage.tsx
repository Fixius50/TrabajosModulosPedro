import React, { useState } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonSegment, IonSegmentButton, IonLabel, IonButtons, IonMenuButton
} from '@ionic/react';
import Transactions from './Transactions';
import Budgets from './Budgets';
import RecurringTransactions from './RecurringTransactions';

const FinancesPage: React.FC = () => {
    const [selectedView, setSelectedView] = useState<'transactions' | 'budgets' | 'recurring'>('transactions');

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Finanzas</IonTitle>
                </IonToolbar>
                <IonToolbar>
                    <IonSegment value={selectedView} onIonChange={e => setSelectedView(e.detail.value as any)}>
                        <IonSegmentButton value="transactions">
                            <IonLabel>Movimientos</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="budgets">
                            <IonLabel>Presupuestos</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="recurring">
                            <IonLabel>Fijos</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div style={{ display: selectedView === 'transactions' ? 'block' : 'none', height: '100%' }}>
                    <Transactions />
                </div>
                <div style={{ display: selectedView === 'budgets' ? 'block' : 'none', height: '100%' }}>
                    <Budgets />
                </div>
                <div style={{ display: selectedView === 'recurring' ? 'block' : 'none', height: '100%' }}>
                    <RecurringTransactions />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default FinancesPage;
