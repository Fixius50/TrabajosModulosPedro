import React, { useState, useEffect } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton, IonIcon } from '@ionic/react';
import type { Transaction } from '../ts/types';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../ts/constants';
import { convertCurrency } from '../ts/apiService';

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

    // Currency Conversion State
    const [currency, setCurrency] = useState('EUR');
    const [originalAmount, setOriginalAmount] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            setAmount(initialData?.amount || 0);
            setDescription(initialData?.description || '');
            setType(initialData?.type || 'expense');
            setCategory(initialData?.category || '');
            setDate(initialData?.date || new Date().toISOString());
            setImageFile(null);
            setCurrency('EUR');
            setOriginalAmount(null);
        }
    }, [isOpen, initialData]);

    const updateAmountWithCurrency = async (val: string, type: 'orig' | 'curr') => {
        if (type === 'curr') {
            setCurrency(val);
            if (originalAmount) {
                const rate = await convertCurrency(1, val, 'EUR');
                if (rate) setAmount(parseFloat((originalAmount * rate).toFixed(2)));
            }
        } else {
            const amt = parseFloat(val);
            setOriginalAmount(amt);
            if (currency !== 'EUR') {
                const rate = await convertCurrency(1, currency, 'EUR');
                if (rate) setAmount(parseFloat((amt * rate).toFixed(2)));
            } else {
                setAmount(amt);
            }
        }
    };

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
                    <IonLabel position="stacked">{t('transactions.amount')} (EUR)</IonLabel>
                    <IonInput type="number" value={amount} readonly={currency !== 'EUR'} onIonChange={e => {
                        if (currency === 'EUR') {
                            setAmount(parseFloat(e.detail.value!) || 0);
                            setOriginalAmount(parseFloat(e.detail.value!) || 0);
                        }
                    }} />
                </IonItem>

                <IonItem>
                    <IonLabel>Divisa Original</IonLabel>
                    <IonSelect value={currency} onIonChange={e => updateAmountWithCurrency(e.detail.value, 'curr')}>
                        <IonSelectOption value="EUR">EUR (€)</IonSelectOption>
                        <IonSelectOption value="USD">USD ($)</IonSelectOption>
                        <IonSelectOption value="GBP">GBP (£)</IonSelectOption>
                        <IonSelectOption value="JPY">JPY (¥)</IonSelectOption>
                    </IonSelect>
                </IonItem>

                {currency !== 'EUR' && (
                    <IonItem>
                        <IonLabel position="stacked">Monto en {currency}</IonLabel>
                        <IonInput type="number" value={originalAmount} onIonChange={e => updateAmountWithCurrency(e.detail.value!, 'orig')} placeholder="0.00" />
                    </IonItem>
                )}

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
                    <IonSelect value={category} placeholder="Selecciona una categoría" onIonChange={e => setCategory(e.detail.value)}>
                        {CATEGORIES.map((cat: string) => (
                            <IonSelectOption key={cat} value={cat}>{cat}</IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">{t('transactions.receipt')}</IonLabel>
                    <br />
                    <input type="file" accept="image/*" onChange={e => {
                        const file = e.target.files ? e.target.files[0] : null;
                        setImageFile(file);
                    }} style={{ marginTop: '10px' }} />

                    {imageFile && (
                        <div className="ion-margin-top">
                            <IonButton size="small" fill="outline" onClick={async () => {
                                const { analyzeReceipt } = await import('../ts/ocrService');
                                const toast = document.createElement('ion-toast');
                                toast.message = 'Analizando recibo... espera unos segundos';
                                toast.duration = 2000;
                                document.body.appendChild(toast);
                                await toast.present();

                                try {
                                    const result = await analyzeReceipt(imageFile);
                                    if (result.amount) {
                                        setAmount(result.amount);
                                        // Update original amount for foreign currency logic if needed
                                        setOriginalAmount(result.amount);
                                    }
                                    if (result.date) setDate(result.date);
                                    if (result.text) {
                                        // Try to get a description from first non-empty line
                                        const lines = result.text.split('\n').filter(l => l.trim().length > 3);
                                        if (lines.length > 0 && !description) setDescription(lines[0].substring(0, 30));
                                    }

                                    const successToast = document.createElement('ion-toast');
                                    successToast.message = '¡Datos extraídos!';
                                    successToast.color = 'success';
                                    successToast.duration = 2000;
                                    document.body.appendChild(successToast);
                                    await successToast.present();

                                } catch (e) {
                                    console.error(e);
                                    const errToast = document.createElement('ion-toast');
                                    errToast.message = 'No se pudo leer el recibo';
                                    errToast.color = 'warning';
                                    errToast.duration = 2000;
                                    document.body.appendChild(errToast);
                                    await errToast.present();
                                }
                            }}>
                                <IonIcon slot="start" icon={require('ionicons/icons').scanOutline} />
                                ✨ {t('transactions.extract_data') || 'Escanear Datos'}
                            </IonButton>
                        </div>
                    )}
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
