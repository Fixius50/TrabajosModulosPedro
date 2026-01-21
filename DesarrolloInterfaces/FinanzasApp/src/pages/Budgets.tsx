import React, { useState, useEffect } from 'react';
import { IonList, IonLabel, IonNote, IonProgressBar, IonFab, IonFabButton, IonIcon, IonSpinner, IonCard, IonCardContent, IonToast } from '@ionic/react';
import { add } from 'ionicons/icons';
import { getBudgets, upsertBudget, type Budget } from '../services/budgetService';
import { getTransactions } from '../services/transactionService';
import BudgetModal from '../components/BudgetModal';


const Budgets: React.FC = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [spending, setSpending] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
    const [errorToast, setErrorToast] = useState('');


    const loadData = async () => {
        try {
            console.log('Budgets: loading data...');
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

    useEffect(() => {
        loadData();
    }, []);

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
        setSelectedBudget(budget);
        setShowModal(true);
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', paddingBottom: '80px' }}>
            {loading && (
                <div className="ion-text-center ion-padding">
                    <IonSpinner name="crescent" />
                    <p>Cargando presupuestos...</p>
                </div>
            )}

            <IonList style={{ background: 'transparent' }}>
                {budgets.map(b => {
                    const spent = spending[b.category] || 0;
                    const progress = Math.min(spent / b.amount, 1);
                    const isOver = spent > b.amount;

                    return (
                        <IonCard key={b.id} onClick={() => openEditModal(b)}>
                            <IonCardContent>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
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

            <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '60px', marginRight: '10px' }}>
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
        </div>
    );
};

export default Budgets;

