import React, { useState, useEffect } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import type { Budget } from '../services/budgetService';
import { CATEGORIES } from '../constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (budget: Budget) => void;
    initialData?: Budget;
}

const BudgetModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState<number | string>('');
    const { t } = useTranslation();

    useEffect(() => {
        if (initialData) {
            setCategory(initialData.category);
            setAmount(initialData.amount);
        } else {
            setCategory('');
            setAmount('');
        }
    }, [initialData, isOpen]);

    const handleSave = () => {
        if (!category || !amount) return;
        onSave({
            category,
            amount: Number(amount)
        });
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{initialData ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>{t('transactions.cancel')}</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked">{t('transactions.category')}</IonLabel>
                        <IonSelect value={category} placeholder="Selecciona una categoría" onIonChange={e => setCategory(e.detail.value)}>
                            {CATEGORIES.map(cat => (
                                <IonSelectOption key={cat} value={cat}>{cat}</IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Límite Mensual (€)</IonLabel>
                        <IonInput type="number" value={amount} onIonChange={e => setAmount(e.detail.value!)} />
                    </IonItem>
                </IonList>
                <IonButton expand="block" className="ion-margin-top" onClick={handleSave}>
                    {t('transactions.save')}
                </IonButton>
            </IonContent>
        </IonModal>
    );
};

export default BudgetModal;
