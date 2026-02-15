import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../../services/transactionService';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus } from 'lucide-react';
import { useStealth } from '../../context/StealthContext';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    categories: {
        name: string;
        icon: string;
        type: string;
    };
}

export default function TransactionHistory() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { formatAmount } = useStealth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await transactionService.getTransactions();
            setTransactions(data || []);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fantasy-theme min-h-screen pb-24">
            <div className="fantasy-container leather-texture max-w-md mx-auto min-h-screen">
                <header className="fantasy-header flex items-center justify-between p-4 sticky top-0 z-10 bg-stone-900/90 backdrop-blur-md border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="text-primary" />
                        </button>
                        <h1 className="text-xl font-bold text-primary uppercase tracking-widest">Historial</h1>
                    </div>
                    <button
                        onClick={() => navigate('/add-transaction')}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-stone-900 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        <Plus size={24} />
                    </button>
                </header>

                <main className="p-4 space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-muted">Cargando pergaminos...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-10 space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-3xl">📜</span>
                            </div>
                            <p className="text-stone-400">No hay registros en el libro de cuentas.</p>
                            <button
                                onClick={() => navigate('/add-transaction')}
                                className="text-primary hover:underline text-sm uppercase tracking-wider"
                            >
                                Registrar primer movimiento
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((t) => (
                                <div key={t.id} className="fantasy-card flex items-center justify-between p-4 group cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-stone-800 flex items-center justify-center text-2xl border border-white/5 shadow-inner">
                                            {t.categories?.icon || '📄'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-stone-200">{t.description}</h4>
                                            <p className="text-xs uppercase text-stone-500 tracking-wider">
                                                {new Date(t.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-mono font-bold text-lg ${t.categories?.type === 'expense' ? 'text-stone-300' : 'text-emerald-400'}`}>
                                        {t.categories?.type === 'expense' ? '-' : '+'} {formatAmount(Math.abs(t.amount), '')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
