import React, { useState, useEffect, Suspense } from 'react';
import { IonList, IonItem, IonLabel, IonNote, IonFab, IonFabButton, IonIcon, IonSpinner, IonItemSliding, IonItemOptions, IonItemOption, IonAlert, IonThumbnail } from '@ionic/react';
import { add, trash } from 'ionicons/icons';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, uploadReceipt } from '../ts/transactionService';
import type { Transaction } from '../ts/types';
import TransactionModal from './TransactionModal';
import { useTranslation } from 'react-i18next';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import GoldCoin from './models/GoldCoin';

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
    const [showAlert, setShowAlert] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
    const { t } = useTranslation();

    const loadData = async () => {
        try {
            const data = await getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);



    const handleSave = async (transactionData: Partial<Transaction> & { imageFile?: File }) => {
        try {
            setLoading(true);
            let imageUrl = transactionData.image_url;

            if (transactionData.imageFile) {
                // Upload file
                imageUrl = await uploadReceipt(transactionData.imageFile);
            }

            // Remove imageFile from data sent to DB
            const { imageFile, ...dataToSave } = transactionData;
            const finalData = { ...dataToSave, image_url: imageUrl };

            if (selectedTransaction && selectedTransaction.id) {
                await updateTransaction(selectedTransaction.id, finalData);
            } else {
                await createTransaction(finalData as Transaction);
            }
            await loadData();
            setShowModal(false);
            setSelectedTransaction(undefined);
        } catch (error) {
            console.error('Error saving transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setSelectedTransaction(undefined);
        setShowModal(true);
    };

    const openEditModal = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowModal(true);
    };

    const confirmDelete = (id: number) => {
        setTransactionToDelete(id);
        setShowAlert(true);
    };

    const handleDelete = async () => {
        if (transactionToDelete) {
            try {
                setLoading(true);
                await deleteTransaction(transactionToDelete);
                await loadData();
            } catch (error) {
                console.error('Error deleting transaction:', error);
            } finally {
                setLoading(false);
                setTransactionToDelete(null);
            }
        }
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
            {/* 3D Accent Section */}
            <div className="h-32 mb-4 relative z-0">
                <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
                    <ambientLight intensity={0.7} />
                    <pointLight position={[5, 1, 5]} intensity={1.5} color="#ffd700" />
                    <Suspense fallback={null}>
                        <GoldCoin position={[0, 0, 0]} scale={1.2} />
                        <Environment preset="city" />
                    </Suspense>
                    <OrbitControls enableZoom={false} autoRotate />
                </Canvas>
            </div>

            {loading && (
                <div className="ion-text-center ion-padding">
                    <IonSpinner name="crescent" />
                    <p>Cargando movimientos...</p>
                </div>
            )}

            <IonList style={{ background: 'transparent' }}>
                {transactions.map(t => (
                    <IonItemSliding key={t.id}>
                        <IonItem button onClick={() => openEditModal(t)}>
                            {t.image_url && (
                                <IonThumbnail slot="start">
                                    <img src={t.image_url} alt="Recibo" />
                                </IonThumbnail>
                            )}
                            <IonLabel>
                                <h2>{t.description}</h2>
                                <p>{t.category} - {new Date(t.date).toLocaleDateString()}</p>
                            </IonLabel>
                            <IonNote slot="end" color={t.type === 'income' ? 'success' : 'danger'}>
                                {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} €
                            </IonNote>
                        </IonItem>
                        <IonItemOptions side="end">
                            <IonItemOption color="danger" onClick={() => confirmDelete(t.id!)}>
                                <IonIcon slot="icon-only" icon={trash} />
                            </IonItemOption>
                        </IonItemOptions>
                    </IonItemSliding>
                ))}
                {!loading && transactions.length === 0 && (
                    <div className="ion-text-center ion-padding">
                        <p>{t('transactions.empty')}</p>
                    </div>
                )}
            </IonList>

            <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '60px', marginRight: '10px' }}>
                <IonFabButton onClick={openCreateModal}>
                    <IonIcon icon={add} />
                </IonFabButton>
            </IonFab>

            <TransactionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                initialData={selectedTransaction}
            />

            <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                header={t('transactions.confirmDelete')}
                message={t('transactions.deleteMessage')}
                buttons={[
                    { text: t('transactions.cancel'), role: 'cancel', handler: () => setTransactionToDelete(null) },
                    { text: t('transactions.delete'), handler: handleDelete }
                ]}
            />
        </div>
    );
};

export default Transactions;
