import React, { useState, useEffect } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { add, trash } from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, uploadReceipt } from '../ts/transactionService';
import type { Transaction } from '../ts/types';
import TransactionModal from './TransactionModal';
import CoinValue from './components/dashboard/CoinValue';

const categoryIcons: Record<string, string> = {
    'Alimentación': 'restaurant',
    'Comida': 'pizza',
    'Entretenimiento': 'game-controller',
    'Regalo': 'gift',
    'Salud': 'medkit',
    'Transporte': 'bus',
    'General': 'wallet'
};

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getTransactions();
            const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(sortedData);
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
                imageUrl = await uploadReceipt(transactionData.imageFile);
            }
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

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await deleteTransaction(id);
            await loadData();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 bg-transparent mt-4">
            {loading && transactions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                    <IonSpinner name="dots" color="primary" />
                    <p className="text-sm font-[Inter] mt-2 uppercase tracking-widest text-[#c5a059]">Explorando la boveda...</p>
                </div>
            ) : (
                <div className="space-y-4 overflow-y-auto custom-scrollbar pb-32 pr-2">
                    <AnimatePresence initial={false}>
                        {transactions.map((tra, index) => {
                            const iconName = tra.category && categoryIcons[tra.category] ? categoryIcons[tra.category] : 'wallet';
                            return (
                                <motion.div
                                    key={tra.id}
                                    initial={{ x: -30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    transition={{ delay: index * 0.03, type: 'spring', stiffness: 200, damping: 20 }}
                                    className="relative group"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#c5a05933] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-sm" />

                                    <div
                                        className="relative flex items-center gap-4 p-4 bg-[#1a1616]/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-[#c5a059]/40 transition-all cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                                        onClick={() => { setSelectedTransaction(tra); setShowModal(true); }}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c5a05922] to-black border border-[#c5a059]/20 flex items-center justify-center shrink-0 shadow-inner">
                                            <IonIcon
                                                icon={iconName}
                                                className="text-2xl text-[#c5a059] drop-shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-[#e2d5b5] font-bold text-sm uppercase tracking-wide truncate">
                                                    {tra.description}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter bg-white/5 px-1.5 py-0.5 rounded">{tra.category}</span>
                                                <span className="text-[10px] text-gray-600">•</span>
                                                <span className="text-[10px] text-gray-500 font-[Inter]">{new Date(tra.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col items-end">
                                            <CoinValue value={tra.amount} type={tra.type as any} />
                                        </div>

                                        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(tra.id!); }}
                                                className="p-2 text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                            >
                                                <IonIcon icon={trash} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {!loading && transactions.length === 0 && (
                        <div className="text-center py-20 opacity-30">
                            <IonIcon icon="journal" style={{ fontSize: '48px', color: '#c5a059' }} />
                            <p className="mt-4 font-[Cinzel] tracking-[0.2em] text-[#c5a059] uppercase text-xs">La boveda esta vacia</p>
                        </div>
                    )}
                </div>
            )}

            <div className="fixed bottom-32 right-6 z-[1001]">
                <motion.button
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedTransaction(undefined); setShowModal(true); }}
                    style={{
                        background: 'linear-gradient(135deg, #c5a059, #8a6e3a)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.5), 0 0 20px rgba(197,160,89,0.3)'
                    }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20 group hover:border-[#fff]/40 transition-all duration-300"
                >
                    <IonIcon icon={add} className="text-2xl text-black" />
                    <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
            </div>

            <TransactionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                initialData={selectedTransaction}
            />
        </div>
    );
};

export default Transactions;
