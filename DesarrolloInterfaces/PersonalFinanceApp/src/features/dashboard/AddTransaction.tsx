import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { transactionService } from '../../services/transactionService';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    icon: string;
    type: string;
}

export default function AddTransaction() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        // Fetch categories
        supabase.from('categories').select('*').then(({ data }) => {
            if (data) setCategories(data);
        });
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
            alert('Error creating transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-6">
            <header className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 glass-panel hover:bg-white/10">
                    <ArrowLeft />
                </button>
                <h2 className="text-2xl font-bold">Add Transaction</h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Input */}
                <div className="glass-panel p-6 text-center">
                    <label className="text-muted text-sm uppercase tracking-wider block mb-2">Amount</label>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl text-muted">$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-transparent text-5xl font-bold text-center w-full focus:outline-none placeholder:text-white/10"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted ml-1">Category</label>
                    <div className="grid grid-cols-3 gap-3">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => setCategoryId(cat.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 ${categoryId === cat.id
                                        ? 'bg-primary/20 border-primary text-white'
                                        : 'bg-white/5 border-transparent text-muted hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-2xl">{cat.icon}</div>
                                <div className="text-xs font-medium">{cat.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-muted mb-1 ml-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="What is this for?"
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-muted mb-1 ml-1">Attachment</label>
                    <label className="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors">
                        <Upload size={20} className="text-muted" />
                        <span className="text-sm text-muted">{file ? file.name : 'Upload receipt or invoice'}</span>
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || !amount || !categoryId}
                    className="w-full btn btn-primary py-4 text-lg mt-8"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Save Transaction'}
                </button>
            </form>
        </div>
    );
}
