import { useState } from 'react';
import Papa from 'papaparse';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, ArrowRight } from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface CSVRow {
    [key: string]: string;
}

interface Category {
    id: string;
    name: string;
    icon: string;
}

export default function CSVImport({ categories }: { categories: Category[] }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [parsedData, setParsedData] = useState<CSVRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<{ date: string; description: string[]; amount: string }>({ date: '', description: [], amount: '' });
    const [defaultCategoryId, setDefaultCategoryId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Map, 3: Preview/Submit

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setParsedData(results.data as CSVRow[]);
                setHeaders(results.meta.fields || []);
                setStep(2);

                // Try to auto-map common headers
                const newMapping: { date: string; description: string[]; amount: string } = { date: '', description: [], amount: '' };
                const fields = results.meta.fields || [];
                fields.forEach(f => {
                    const lower = f.toLowerCase();
                    if (lower.includes('date') || lower.includes('fecha')) newMapping.date = f;
                    if (lower.includes('desc') || lower.includes('concept') || lower.includes('nom') || lower.includes('ref')) newMapping.description.push(f);
                    if (lower.includes('amount') || lower.includes('cantidad') || lower.includes('importe') || lower.includes('saldo')) newMapping.amount = f;
                });
                setMapping(newMapping);
            }
        });
    };

    const handleImport = async () => {
        if (!defaultCategoryId) return alert(t('select_category', 'Selecciona una categoría por defecto'));
        setLoading(true);

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error("No user");

            const transactions = parsedData.map(row => {
                // Basic cleanup of amount (remove currency symbols, handle commas)
                let amountStr = row[mapping.amount] || '0';
                amountStr = amountStr.replace(/[^0-9.,-]/g, '').replace(',', '.');
                const amount = parseFloat(amountStr);

                // Join multiple description columns
                const description = mapping.description
                    .map(col => row[col])
                    .filter(val => val && val.trim() !== '')
                    .join(' - ') || 'Sin descripción';

                return {
                    amount: isNaN(amount) ? 0 : amount,
                    description: description,
                    date: row[mapping.date] ? new Date(row[mapping.date]).toISOString() : new Date().toISOString(),
                    category_id: defaultCategoryId,
                    user_id: user.id
                };
            }).filter(t => t.amount !== 0); // Skip empty or zero rows

            await transactionService.createTransactions(transactions);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Error importing transactions');
        } finally {
            setLoading(false);
        }
    };

    const toggleDescriptionColumn = (column: string) => {
        setMapping(prev => {
            const exists = prev.description.includes(column);
            const newDesc = exists
                ? prev.description.filter(c => c !== column)
                : [...prev.description, column];
            return { ...prev, description: newDesc };
        });
    };

    if (step === 1) {
        return (
            <div className="p-8 border-2 border-dashed border-stone-700 hover:border-primary/50 rounded-2xl transition-colors bg-stone-900/30 text-center">
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
                <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 hover:text-primary transition-colors">
                        <Upload size={32} />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-stone-200">{t('upload_csv', 'Sube tu archivo CSV')}</p>
                        <p className="text-sm text-stone-500 mt-1">{t('drag_drop_csv', 'Arrastra o haz clic para seleccionar')}</p>
                    </div>
                </label>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {step === 2 && (
                <div className="glass-panel p-6 bg-stone-900/50 border border-white/5 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <FileText size={20} /> {t('map_columns', 'Asignar Columnas')}
                    </h3>

                    <div className="grid gap-4">
                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase block mb-1">Fecha</label>
                            <select
                                value={mapping.date}
                                onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                                className="w-full bg-stone-800 border-none rounded-lg p-2 text-stone-200"
                            >
                                <option value="">Seleccionar...</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase block mb-1">Descripción (Multi-columna)</label>
                            <div className="flex flex-wrap gap-2 mb-2 p-2 bg-stone-800/50 rounded-lg min-h-[2.625rem]">
                                {mapping.description.length === 0 && <span className="text-stone-500 text-sm italic py-1 px-2">Ninguna seleccionada</span>}
                                {mapping.description.map(col => (
                                    <span key={col} className="bg-primary/20 text-primary text-xs px-2 py-1 rounded flex items-center gap-1">
                                        {col}
                                        <button onClick={() => toggleDescriptionColumn(col)} className="hover:text-white">×</button>
                                    </span>
                                ))}
                            </div>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        toggleDescriptionColumn(e.target.value);
                                        e.target.value = ""; // Reset select
                                    }
                                }}
                                className="w-full bg-stone-800 border-none rounded-lg p-2 text-stone-200"
                            >
                                <option value="">+ Añadir Columna...</option>
                                {headers.filter(h => !mapping.description.includes(h)).map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            <p className="text-[0.625rem] text-stone-500 mt-1">Selecciona múltiples columnas para combinarlas (ej: Concepto + Notas).</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-stone-500 uppercase block mb-1">Cantidad/Monto</label>
                            <select
                                value={mapping.amount}
                                onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                                className="w-full bg-stone-800 border-none rounded-lg p-2 text-stone-200"
                            >
                                <option value="">Seleccionar...</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep(3)}
                        disabled={!mapping.date || !mapping.amount || mapping.description.length === 0}
                        className="w-full btn-secondary py-3 mt-4 flex items-center justify-center gap-2"
                    >
                        Continuar <ArrowRight size={16} />
                    </button>
                    <button onClick={() => setStep(1)} className="w-full text-stone-500 text-sm hover:text-stone-300">Cancelar</button>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <div className="glass-panel p-6 bg-stone-900/50 border border-white/5 rounded-2xl">
                        <h3 className="text-sm font-bold text-stone-500 uppercase mb-4">{t('preview', 'Vista Previa')} ({parsedData.length} filas)</h3>
                        <div className="max-h-48 overflow-y-auto text-sm">
                            <table className="w-full text-left text-stone-300">
                                <thead>
                                    <tr className="border-b border-stone-800 text-stone-500">
                                        <th className="py-2">Fecha</th>
                                        <th className="py-2">Desc.</th>
                                        <th className="py-2 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.slice(0, 5).map((row, i) => (
                                        <tr key={i} className="border-b border-stone-800/50">
                                            <td className="py-2 opacity-70">{row[mapping.date]?.substring(0, 10)}</td>
                                            <td className="py-2 truncate max-w-[9.375rem]">
                                                {mapping.description
                                                    .map(col => row[col])
                                                    .filter(val => val && val.trim() !== '')
                                                    .join(' - ') || 'Sin descripción'}
                                            </td>
                                            <td className="py-2 text-right font-mono">{row[mapping.amount]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {parsedData.length > 5 && <p className="text-center text-xs text-stone-600 mt-2">... y {parsedData.length - 5} más</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase">Categoría por Defecto</label>
                        <select
                            value={defaultCategoryId}
                            onChange={(e) => setDefaultCategoryId(e.target.value)}
                            className="w-full bg-stone-800 border-none rounded-lg p-3 text-stone-200"
                        >
                            <option value="">Selecciona una categoría...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={loading || !defaultCategoryId}
                        className="w-full btn-primary py-4 font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        {loading ? 'Importando...' : `Importar ${parsedData.length} Transcacciones`}
                    </button>
                    <button onClick={() => setStep(2)} className="w-full text-stone-500 text-sm hover:text-stone-300 mt-2">Atrás</button>
                </div>
            )}
        </div>
    );
}
