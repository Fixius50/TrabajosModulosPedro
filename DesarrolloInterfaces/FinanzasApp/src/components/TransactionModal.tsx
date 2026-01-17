import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton } from '@ionic/react';
import type { Transaction } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Partial<Transaction> & { imageFile?: File }) => void;
    initialData?: Transaction;
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
    const [amount, setAmount] = useState<number>(initialData?.amount || 0);
    const [description, setDescription] = useState<string>(initialData?.description || '');
    const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
    const [category, setCategory] = useState<string>(initialData?.category || '');
    const [date, setDate] = useState<string>(initialData?.date || new Date().toISOString());
    const [imageFile, setImageFile] = useState<File | null>(null);
    const { t } = useTranslation();

    const handleSave = () => {
        onSave({ amount, description, type, category, date, imageFile: imageFile || undefined });
        onClose();
        setAmount(0);
        setDescription('');
        setImageFile(null);
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{initialData ? t('transactions.edit') : t('transactions.new')}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>{t('transactions.cancel')}</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="stacked">{t('transactions.amount')}</IonLabel>
                    <IonInput type="number" value={amount} onIonChange={e => setAmount(parseFloat(e.detail.value!) || 0)} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">{t('transactions.description')}</IonLabel>
                    <IonInput value={description} onIonChange={e => setDescription(e.detail.value!)} />
                </IonItem>
                <IonItem>
                    <IonLabel>{t('transactions.type')}</IonLabel>
                    <IonSelect value={type} onIonChange={e => setType(e.detail.value)}>
                        <IonSelectOption value="income">{t('transactions.income')}</IonSelectOption>
                        <IonSelectOption value="expense">{t('transactions.expense')}</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">{t('transactions.category')}</IonLabel>
                    <IonInput value={category} placeholder="Ej: Comida, Transporte" onIonChange={e => setCategory(e.detail.value!)} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">{t('transactions.receipt')}</IonLabel>
                    <br />
                    <input type="file" accept="image/*" onChange={e => {
                        const file = e.target.files ? e.target.files[0] : null;
                        setImageFile(file);
                    }} style={{ marginTop: '10px' }} />
                </IonItem>
                <IonItem>
                    <IonLabel>{t('transactions.date')}</IonLabel>
                    <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
                    <IonModal keepContentsMounted={true}>
                        <IonDatetime id="datetime" presentation="date" value={date} onIonChange={e => setDate(e.detail.value as string)}></IonDatetime>
                    </IonModal>
                </IonItem>
                <IonButton expand="block" className="ion-margin-top" onClick={handleSave}>
                    {t('transactions.save')}
                </IonButton>
            </IonContent>
        </IonModal>
    );
};

export default TransactionModal;
