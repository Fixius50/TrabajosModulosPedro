import React, { useEffect, useState } from 'react';
import {
    IonList, IonItem, IonLabel, IonNote, IonFab, IonFabButton, IonIcon,
    IonModal, IonButton, IonInput, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton,
    IonToast, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent
} from '@ionic/react';
import { add, repeatOutline, trashOutline } from 'ionicons/icons';
import { recurringService } from '../services/recurring.service';
import type { RecurringTransaction } from '../types';
import { supabase } from '../supabaseClient';

const RecurringTransactions: React.FC = () => {
    // const { t } = useTranslation();
    const [recurrences, setRecurrences] = useState<RecurringTransaction[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, color: string } | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<RecurringTransaction>>({
        amount: 0,
        description: '',
        type: 'expense',
        interval_unit: 'month',
        interval_value: 1,
        start_date: new Date().toISOString(),
        active: true
    });

    useEffect(() => {
        loadRecurrences();
    }, []);

    const loadRecurrences = async () => {
        try {
            const data = await recurringService.getRecurring();
            setRecurrences(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const newRecurrence: RecurringTransaction = {
                user_id: user.id,
                amount: Number(formData.amount),
                description: formData.description || '',
                type: formData.type as 'income' | 'expense',
                interval_unit: formData.interval_unit as any,
                interval_value: Number(formData.interval_value),
                start_date: formData.start_date || new Date().toISOString(),
                next_run_date: formData.start_date || new Date().toISOString(), // First run is start date
                active: true
            };

            await recurringService.createRecurring(newRecurrence);
            setToast({ message: 'Recurrencia creada', color: 'success' });
            setShowModal(false);
            loadRecurrences();
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al crear', color: 'danger' });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await recurringService.toggleActive(id, false);
            setToast({ message: 'Recurrencia desactivada', color: 'warning' });
            loadRecurrences();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
            <IonList style={{ background: 'transparent' }}>
                {recurrences.map(rec => (
                    <IonItem key={rec.id}>
                        <IonIcon icon={repeatOutline} slot="start" color={rec.type === 'income' ? 'success' : 'danger'} />
                        <IonLabel>
                            <h2>{rec.description}</h2>
                            <p>Cada {rec.interval_value} {rec.interval_unit}(s)</p>
                            <p>Próxima: {new Date(rec.next_run_date).toLocaleDateString()}</p>
                        </IonLabel>
                        <IonNote slot="end" color={rec.type === 'income' ? 'success' : 'danger'}>
                            {rec.amount.toFixed(2)} €
                        </IonNote>
                        <IonButton slot="end" fill="clear" color="medium" onClick={() => handleDelete(rec.id!)}>
                            <IonIcon icon={trashOutline} />
                        </IonButton>
                    </IonItem>
                ))}
                {recurrences.length === 0 && !loading && (
                    <div className="ion-padding ion-text-center">
                        <p>No tienes transacciones recurrentes activas.</p>
                    </div>
                )}
            </IonList>

            <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '60px', marginRight: '10px' }}>
                <IonFabButton onClick={() => setShowModal(true)}>
                    <IonIcon icon={add} />
                </IonFabButton>
            </IonFab>

            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Nueva Recurrencia</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setShowModal(false)}>Cerrar</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <IonList>
                        <IonItem>
                            <IonLabel position="stacked">Descripción</IonLabel>
                            <IonInput value={formData.description} onIonChange={e => setFormData({ ...formData, description: e.detail.value! })} />
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Monto</IonLabel>
                            <IonInput type="number" value={formData.amount} onIonChange={e => setFormData({ ...formData, amount: Number(e.detail.value!) })} />
                        </IonItem>
                        <IonItem>
                            <IonLabel>Tipo</IonLabel>
                            <IonSelect value={formData.type} onIonChange={e => setFormData({ ...formData, type: e.detail.value! })}>
                                <IonSelectOption value="expense">Gasto</IonSelectOption>
                                <IonSelectOption value="income">Ingreso</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Repetir cada</IonLabel>
                            <IonInput type="number" value={formData.interval_value} onIonChange={e => setFormData({ ...formData, interval_value: Number(e.detail.value!) })} />
                            <IonSelect value={formData.interval_unit} onIonChange={e => setFormData({ ...formData, interval_unit: e.detail.value! })}>
                                <IonSelectOption value="day">Día(s)</IonSelectOption>
                                <IonSelectOption value="week">Semana(s)</IonSelectOption>
                                <IonSelectOption value="month">Mes(es)</IonSelectOption>
                                <IonSelectOption value="year">Año(s)</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Fecha Inicio</IonLabel>
                            <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
                            <IonModal keepContentsMounted={true}>
                                <IonDatetime id="datetime" presentation="date"
                                    value={formData.start_date}
                                    onIonChange={e => setFormData({ ...formData, start_date: String(e.detail.value!) })}
                                ></IonDatetime>
                            </IonModal>
                        </IonItem>
                    </IonList>
                    <div className="ion-padding">
                        <IonButton expand="block" onClick={handleSave}>Guardar</IonButton>
                    </div>
                </IonContent>
            </IonModal>

            <IonToast isOpen={!!toast} message={toast?.message} color={toast?.color} duration={2000} onDidDismiss={() => setToast(null)} />
        </div>
    );
};

export default RecurringTransactions;
