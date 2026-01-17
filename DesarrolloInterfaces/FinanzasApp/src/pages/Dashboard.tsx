import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonRefresher, IonRefresherContent, type RefresherEventDetail, useIonViewWillEnter } from '@ionic/react';
import { getTransactions } from '../services/transactionService';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
    const [balance, setBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const { t } = useTranslation();

    const loadData = async () => {
        try {
            const data = await getTransactions();
            const inc = data.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const exp = data.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
            setIncome(inc);
            setExpense(exp);
            setBalance(inc - exp);
        } catch (error) {
            console.error(error);
        }
    };

    useIonViewWillEnter(() => {
        loadData();
    });

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await loadData();
        event.detail.complete();
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
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
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;
