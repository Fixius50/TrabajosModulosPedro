import React, { useState, useMemo } from 'react';
import {
    IonPage, IonContent,
    IonGrid, IonRow, IonCol, IonSpinner, IonIcon
} from '@ionic/react';
import { searchOutline, pricetagOutline, statsChartOutline, diamondOutline, flameOutline, sparklesOutline } from 'ionicons/icons';
import { marketService, type MarketAsset } from '../ts/market.service';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useIonViewWillEnter } from '@ionic/react';
import CoinValue from './components/dashboard/CoinValue';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CosmicMarketPage: React.FC = () => {
    const [assets, setAssets] = useState<MarketAsset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'crypto' | 'lore' | 'stocks'>('all');

    useIonViewWillEnter(() => {
        loadMarket();
    });

    const loadMarket = async () => {
        setLoading(true);
        const data = await marketService.getUnifiedAssets();
        setAssets(data);
        if (data.length > 0 && !selectedAsset) {
            setSelectedAsset(data[0]);
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!searchTerm) return;
        setSearchLoading(true);
        const asset = await marketService.getStockQuote(searchTerm.toUpperCase());
        if (asset) {
            const history = await marketService.getStockHistory(asset.symbol);
            asset.history = history;
            asset.type = 'stock';
            setSelectedAsset(asset);
        }
        setSearchLoading(false);
    };

    const filteredAssets = useMemo(() => {
        if (activeTab === 'all') return assets;
        return assets.filter(a => a.type === activeTab);
    }, [assets, activeTab]);

    const chartData = useMemo(() => {
        if (!selectedAsset || !selectedAsset.history || selectedAsset.history.length === 0) return null;

        const isLore = selectedAsset.type === 'lore';
        const color = isLore ? '#38bdf8' : '#eab308';

        return {
            labels: selectedAsset.history.map((_, i) => i),
            datasets: [{
                label: selectedAsset.name,
                data: selectedAsset.history,
                borderColor: color,
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, `${color}44`);
                    gradient.addColorStop(1, `${color}00`);
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 3,
                shadowColor: color,
                shadowBlur: 10
            }]
        };
    }, [selectedAsset]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1a1616',
                titleColor: '#d4af37',
                bodyColor: '#fff',
                borderColor: '#d4af3722',
                borderWidth: 1,
                displayColors: false
            }
        },
        scales: {
            x: { display: false },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#666', font: { size: 10 } }
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <IonPage>
            <IonContent fullscreen style={{ '--background': '#0a0a0c' }}>
                {/* Cosmic Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-[#0a0a0c] opacity-80" />
                </div>

                <div className="relative z-10 p-6 pt-24 h-full flex flex-col min-h-screen">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-lg">
                                <IonIcon icon={statsChartOutline} className="text-2xl text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-[Cinzel] text-white font-bold tracking-tight">
                                    Mercado <span className="text-blue-400">Cósmico</span>
                                </h1>
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Interdimensional Artifacts</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="relative w-full md:w-96"
                        >
                            <input
                                type="text"
                                placeholder="Invocando símbolo (ej. AAPL, SOL)..."
                                className="w-full bg-white/5 border border-white/10 text-white font-[Inter] px-5 py-3 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all placeholder-gray-600 text-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white"
                            >
                                {searchLoading ? <IonSpinner name="dots" className="w-4 h-4" /> : <IonIcon icon={searchOutline} />}
                            </button>
                        </motion.div>
                    </div>

                    <IonGrid className="p-0 flex-1">
                        <IonRow className="h-full gap-6 lg:gap-8">
                            {/* Left Panel: Asset List */}
                            <IonCol size="12" sizeLg="4" className="flex flex-col gap-6">
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                    {(['all', 'lore', 'crypto', 'stocks'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                                                ? 'bg-blue-500 text-white shadow-[0_4px_20px_rgba(59,130,246,0.3)]'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {tab === 'all' ? 'Todo' : tab === 'lore' ? 'Artefactos' : tab === 'crypto' ? 'Cripto' : 'Acciones'}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 max-h-[70vh]">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-40 gap-4 opacity-50">
                                            <IonSpinner name="bubbles" className="text-blue-500" />
                                            <p className="font-[Cinzel] text-[10px] tracking-widest text-blue-500 uppercase">Explorando el Vacío...</p>
                                        </div>
                                    ) : (
                                        <AnimatePresence mode='popLayout'>
                                            {filteredAssets.map((asset, idx) => (
                                                <motion.div
                                                    layout
                                                    key={asset.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => setSelectedAsset(asset)}
                                                    className={`group relative p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden ${selectedAsset?.id === asset.id
                                                        ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_8px_32px_rgba(59,130,246,0.1)]'
                                                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/8'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${asset.type === 'lore' ? 'bg-blue-400 animate-pulse' : 'bg-yellow-400'}`} />
                                                            <span className="text-white font-[Cinzel] font-bold tracking-wide group-hover:text-blue-400 transition-colors uppercase">
                                                                {asset.symbol}
                                                            </span>
                                                        </div>
                                                        <span className={`text-[10px] font-bold ${asset.change_24h_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                            {asset.change_24h_percent >= 0 ? '+' : ''}{asset.change_24h_percent.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{asset.name}</span>
                                                        <span className="text-sm font-mono text-gray-300">
                                                            {asset.price.toLocaleString()} <span className="text-[10px] text-blue-400/60 font-[Cinzel]">GP</span>
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </div>
                            </IonCol>

                            {/* Right Panel: Artifact Inspection */}
                            <IonCol size="12" sizeLg="8">
                                <AnimatePresence mode='wait'>
                                    {selectedAsset && (
                                        <motion.div
                                            key={selectedAsset.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="h-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 flex flex-col shadow-2xl relative overflow-hidden"
                                        >
                                            {/* Glow effect matching asset type */}
                                            <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] pointer-events-none opacity-20 ${selectedAsset.type === 'lore' ? 'bg-blue-500' : 'bg-yellow-500'
                                                }`} />

                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {selectedAsset.rarity || 'Artefacto'}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                                                            {selectedAsset.type}
                                                        </span>
                                                    </div>
                                                    <h2 className="text-4xl md:text-5xl text-white font-[Cinzel] font-bold tracking-tight">
                                                        {selectedAsset.name}
                                                    </h2>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <CoinValue value={selectedAsset.price} type={selectedAsset.change_24h_percent >= 0 ? 'income' : 'expense'} />
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Valor Dimensional Actual</p>
                                                </div>
                                            </div>

                                            {/* Stats Strip */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 relative z-10">
                                                {[
                                                    { label: 'Volatilidad', value: selectedAsset.rarity === 'Legendario' ? 'Extrema' : 'Estable', icon: flameOutline },
                                                    { label: 'Rareza', value: selectedAsset.rarity || '---', icon: diamondOutline },
                                                    { label: 'Origen', value: selectedAsset.type === 'lore' ? 'Fantasía' : 'Mundo Real', icon: sparklesOutline },
                                                    { label: 'Tendencia', value: selectedAsset.change_24h_percent >= 0 ? 'Ascendente' : 'Descendente', icon: statsChartOutline }
                                                ].map((stat, i) => (
                                                    <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                                                        <div className="flex items-center gap-2 mb-1 text-gray-500">
                                                            <IonIcon icon={stat.icon} className="text-xs" />
                                                            <span className="text-[9px] uppercase tracking-widest font-bold">{stat.label}</span>
                                                        </div>
                                                        <div className="text-xs text-white font-[Cinzel]">{stat.value}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* The Chart */}
                                            <div className="flex-1 min-h-[300px] relative z-10 mb-6">
                                                {chartData ? (
                                                    <Line data={chartData} options={chartOptions as any} />
                                                ) : (
                                                    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                                                        <IonIcon icon={pricetagOutline} className="text-6xl" />
                                                        <p className="font-[Cinzel] text-sm uppercase tracking-widest">Invocando registros...</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="relative z-10 pt-6 border-t border-white/5">
                                                <p className="text-xs text-gray-500 italic leading-relaxed max-w-2xl">
                                                    {selectedAsset.description || "Este artefacto fluctúa en el tejido mismo del mercado interdimensional. Su valor está sujeto a las fuerzas místicas de la oferta y la demanda galáctica."}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default CosmicMarketPage;
