import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonLabel, IonNote, IonProgressBar, IonFab, IonFabButton, IonIcon, IonLoading, IonCard, IonCardContent, IonRefresher, IonRefresherContent, type RefresherEventDetail, useIonViewWillEnter, IonToast } from '@ionic/react';
import { add } from 'ionicons/icons';
import { getBudgets, upsertBudget, type Budget } from '../services/budgetService';
import { getTransactions } from '../services/transactionService';
import BudgetModal from '../components/BudgetModal';
import { useTranslation } from 'react-i18next';

const Budgets: React.FC = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [spending, setSpending] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
    const [errorToast, setErrorToast] = useState('');
    const { t } = useTranslation();

    const loadData = async () => {
        try {
            const [budgetsData, transactionsData] = await Promise.all([
                getBudgets(),
                getTransactions()
            ]);

            setBudgets(budgetsData);

            // Calculate current month spending per category
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const expenses = transactionsData.filter(t => {
                const d = new Date(t.date);
                return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            const spendingMap: { [key: string]: number } = {};
            expenses.forEach(t => {
                const cat = t.category || 'Otros';
                spendingMap[cat] = (spendingMap[cat] || 0) + t.amount;
            });
            setSpending(spendingMap);

        } catch (error: any) {
            console.error('Error loading budgets:', error);
            setErrorToast('Error cargando presupuestos: ' + (error.message || 'Desconocido'));
        } finally {
            setLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        loadData();
    });

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await loadData();
        event.detail.complete();
    };

    const handleSave = async (budget: Budget) => {
        try {
            setLoading(true);
            await upsertBudget(budget);
            await loadData();
            setShowModal(false);
        } catch (error: any) {
            console.error(error);
            setErrorToast(error.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setSelectedBudget(undefined);
        setShowModal(true);
    };

    const openEditModal = (budget: Budget) => {
        // setSelectedBudget(budget); // logic upsert handles insert/update by category
        // For simplicity reusing modal.
        setSelectedBudget(budget);
        setShowModal(true);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{t('app.budgets')}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <IonLoading isOpen={loading} message="Cargando..." />

                <IonList>
                    {budgets.map(b => {
                        const spent = spending[b.category] || 0;
                        const progress = Math.min(spent / b.amount, 1);
                        const isOver = spent > b.amount;

                        return (
                            <IonCard key={b.id} onClick={() => openEditModal(b)}>
                                <IonCardContent>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <IonLabel><h2>{b.category}</h2></IonLabel>
                                        <IonNote color={isOver ? 'danger' : 'medium'}>
                                            {spent.toFixed(2)}€ / {b.amount}€
                                        </IonNote>
                                    </div>
                                    <IonProgressBar
                                        value={progress}
                                        color={isOver ? 'danger' : (progress > 0.8 ? 'warning' : 'success')}
                                    />
                                </IonCardContent>
                            </IonCard>
                        );
                    })}
                    {!loading && budgets.length === 0 && (
                        <div className="ion-text-center ion-padding">
                            <p>No tienes presupuestos activos.</p>
                        </div>
                    )}
                </IonList>

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={openCreateModal}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>

                <BudgetModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    initialData={selectedBudget}
                />

                <IonToast
                    isOpen={!!errorToast}
                    message={errorToast}
                    duration={3000}
                    color="danger"
                    onDidDismiss={() => setErrorToast('')}
                />
            </IonContent>
        </IonPage>
    );
};

export default Budgets;
