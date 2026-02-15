import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { transactionService } from '../../services/transactionService';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { storageService } from '../../services/storageService';

interface Category {
    id: string;
    name: string;
    icon: string;
    type: string;
}

export default function AddTransaction() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [currencySymbol, setCurrencySymbol] = useState('€');

    useEffect(() => {
        // Fetch categories
        supabase.from('categories').select('*').then(({ data }) => {
            if (data) setCategories(data);
        });

        // Get currency
        const profile = storageService.getUserProfile();
        if (profile?.currency === 'USD') setCurrencySymbol('$');
        else if (profile?.currency === 'GBP') setCurrencySymbol('£');
        else setCurrencySymbol('€');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !categoryId) return;

        setLoading(true);
        try {
            let filePath = null;
            if (file) {
                filePath = await transactionService.uploadAttachment(file);
            }

            await transactionService.createTransaction({
                amount: parseFloat(amount),
                description,
                category_id: categoryId,
                date: new Date().toISOString(),
                file_path: filePath || undefined,
                user_id: (await supabase.auth.getUser()).data.user?.id!,
            });

            navigate('/');
        } catch (error) {
            console.error(error);
            alert(t('error_create_transaction', 'Error al crear la transacción'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-6 px-4">
            <header className="flex items-center justify-center mb-6 relative">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-stone-800/50 hover:bg-stone-700 transition-colors absolute left-0 text-stone-300"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-center bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent uppercase tracking-wider">
                    {t('add_transaction', 'Añadir Transacción')}
                </h2>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Input */}
                <div className="glass-panel p-6 text-center bg-stone-900/50 border border-white/5 rounded-2xl">
                    <label className="text-stone-500 text-xs uppercase tracking-widest block mb-2 font-bold">{t('amount', 'Cantidad')}</label>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl text-stone-600 font-serif">{currencySymbol}</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-transparent text-5xl font-bold text-center w-full focus:outline-none placeholder:text-stone-700 text-stone-200"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">{t('category', 'Categoría')}</label>
                    <div className="grid grid-cols-3 gap-3">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => setCategoryId(cat.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 ${categoryId === cat.id
                                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(244,192,37,0.2)]'
                                    : 'bg-stone-900/50 border-white/5 text-stone-500 hover:bg-stone-800 hover:text-stone-300 hover:border-white/10'
                                    }`}
                            >
                                <div className="text-2xl filter drop-shadow-md">{cat.icon}</div>
                                <div className="text-[10px] uppercase font-bold tracking-wide text-center">{t(`category_${cat.name.toLowerCase()}`, cat.name)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 ml-1">{t('description', 'Descripción')}</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-stone-900/50 border border-white/5 rounded-xl px-4 py-4 text-stone-200 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 placeholder:text-stone-700 transition-all"
                        placeholder={t('description_placeholder', '¿Para qué es esto?')}
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 ml-1">{t('attachment', 'Adjunto')}</label>
                    <label className="flex items-center gap-3 w-full bg-stone-900/50 border border-white/5 rounded-xl px-4 py-4 cursor-pointer hover:bg-stone-800 transition-colors group border-dashed hover:border-primary/30">
                        <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center group-hover:bg-stone-700 transition-colors">
                            <Upload size={18} className="text-stone-500 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm text-stone-500 group-hover:text-stone-300 transition-colors flex-1">
                            {file ? file.name : t('upload_receipt', 'Subir recibo o factura')}
                        </span>
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || !amount || !categoryId}
                    className="w-full btn-primary py-4 text-sm font-bold uppercase tracking-widest mt-8 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : t('save_transaction', 'Guardar Transacción')}
                </button>
            </form>
        </div>
    );
}
