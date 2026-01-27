import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonRefresher, IonRefresherContent, type RefresherEventDetail, IonButtons, IonMenuButton } from '@ionic/react';
import { getTransactions } from '../services/transactionService';
import { useTranslation } from 'react-i18next';

import ElectricityWidget from '../components/ElectricityWidget';

const Dashboard: React.FC = () => {
    const [balance, setBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const { t } = useTranslation();

    const loadData = async () => {
        try {
            const transactions = await getTransactions();
            const inc = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const exp = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

            setIncome(inc);
            setExpense(exp);
            setBalance(inc - exp);
        } catch (error) {
            console.error("Dashboard data load error:", error);
        }
    };

    useEffect(() => {
        console.log("Dashboard: Component Mounted (useEffect)");
        loadData();
    }, []); // Run once on mount

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await loadData();
        event.detail.complete();
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>{t('app.dashboard')}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <IonCard>
                    <IonCardHeader>
                        <IonCardSubtitle>{t('dashboard.totalBalance')}</IonCardSubtitle>
                        <IonCardTitle>{balance.toFixed(2)} €</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <div style={{ color: 'var(--ion-color-success)' }}>
                                        {t('dashboard.income')}: +{income.toFixed(2)} €
                                    </div>
                                </IonCol>
                                <IonCol>
                                    <div style={{ color: 'var(--ion-color-danger)' }}>
                                        {t('dashboard.expenses')}: -{expense.toFixed(2)} €
                                    </div>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonCardContent>
                </IonCard>


                <ElectricityWidget />
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;
