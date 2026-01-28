import React, { useState } from 'react';
import {
    IonPage, IonContent,
    IonGrid, IonRow, IonCol, IonSpinner, IonIcon
} from '@ionic/react';
import { searchOutline, pricetagOutline } from 'ionicons/icons';
import { marketService, type MarketAsset } from '../ts/market.service';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import NewsWidget from './NewsWidget';
import { useIonViewWillEnter } from '@ionic/react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GlobalMarketPage: React.FC = () => {
    // State
    const [cryptoAssets, setCryptoAssets] = useState<MarketAsset[]>([]);
    const [searchedAsset, setSearchedAsset] = useState<MarketAsset | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);

    // Initial Load (Crypto)
    useIonViewWillEnter(() => {
        loadCryptoMarket();
    });

    const loadCryptoMarket = async () => {
        setLoading(true);
        const data = await marketService.getCryptoAssets();
        setCryptoAssets(data);
        if (data.length > 0 && !selectedAsset) {
            setSelectedAsset(data[0]); // Default to Bitcoin
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!searchTerm) return;
        setSearchLoading(true);
        setSearchedAsset(null);

        // Try to find as stock first (using Finnhub)
        const asset = await marketService.getStockQuote(searchTerm.toUpperCase());
        if (asset) {
            // Fetch history for chart
            const history = await marketService.getStockHistory(asset.symbol);
            asset.history = history;
            setSearchedAsset(asset);
            setSelectedAsset(asset);
        } else {
            console.log("Asset not found");
        }
        setSearchLoading(false);
    };

    // Chart Data Construction
    const buildChartData = () => {
        if (!selectedAsset || !selectedAsset.history || selectedAsset.history.length === 0) return null;

        return {
            labels: Array.from({ length: selectedAsset.history.length }, (_, i) => i + 1),
            datasets: [{
                label: selectedAsset.name,
                data: selectedAsset.history,
                borderColor: selectedAsset.type === 'crypto' ? '#d4af37' : '#9333ea', // Gold for crypto, Magic Purple for stocks
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: false } },
        scales: {
            x: { display: false },
            y: { grid: { color: 'rgba(74, 78, 90, 0.2)' }, ticks: { color: '#9ca3af', font: { family: 'MedievalSharp' } } }
        },
        maintainAspectRatio: false
    };

    return (
        <IonPage>
            <IonContent fullscreen className="bg-[#0f0a0a]">
                {/* Background Atmosphere */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90"></div>
                </div>

                <div className="relative z-10 p-6 pt-24 h-full flex flex-col font-display">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-[Cinzel] text-[#8a1c1c] uppercase tracking-[0.2em] font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            Mercado Negro
                        </h1>
                        <p className="text-[10px] text-gray-400 font-[MedievalSharp] uppercase tracking-widest mt-1">
                            - Intercambio de Reliquias & Divisas -
                        </p>
                    </div>

                    <IonGrid className="flex-1 w-full max-w-6xl mx-auto">
                        <IonRow className="h-full">
                            {/* LEFT COLUMN: LIST of ASSETS */}
                            <IonCol size="12" sizeMd="4" className="h-[60vh] md:h-auto overflow-y-auto custom-scrollbar pr-2">
                                <h3 className="text-[#c5a059] font-[Cinzel] text-sm mb-4 border-b border-[#c5a059]/30 pb-2">
                                    Mercancías (Top Cripto)
                                </h3>
                                {loading && <div className="text-[#c5a059] animate-pulse text-center">Invocando precios...</div>}

                                <div className="space-y-3">
                                    {cryptoAssets.map(asset => {
                                        const isUp = asset.change_24h_percent >= 0;
                                        const isSelected = selectedAsset?.id === asset.id;
                                        return (
                                            <div
                                                key={asset.id}
                                                onClick={() => setSelectedAsset(asset)}
                                                className={`p-3 rounded border transition-all cursor-pointer group ${isSelected
                                                    ? 'bg-[#8a1c1c]/20 border-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.2)]'
                                                    : 'bg-[#1a1616]/60 border-[#4a4e5a] hover:border-[#c5a059]/50 hover:bg-[#1a1616]'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="text-[#e2d5b5] font-[Cinzel] font-bold group-hover:text-[#c5a059] transition-colors">{asset.symbol}</div>
                                                        <div className="text-[10px] text-gray-500 uppercase">{asset.name}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[#e2d5b5] font-[MedievalSharp]">{asset.price.toLocaleString()} GP</div>
                                                        <div className={`text-[10px] ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                                                            {isUp ? '▲' : '▼'} {Math.abs(asset.change_24h_percent).toFixed(2)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-[#c5a059] font-[Cinzel] text-sm mb-4 border-b border-[#c5a059]/30 pb-2">
                                        Pergaminos de Noticias
                                    </h3>
                                    <div className="bg-[#1a1616]/40 p-2 rounded border border-[#4a4e5a]">
                                        <NewsWidget />
                                    </div>
                                </div>
                            </IonCol>

                            {/* RIGHT COLUMN: DETAIL & SEARCH */}
                            <IonCol size="12" sizeMd="8" className="pl-4">
                                {/* SEARCH BAR RPG STYLE */}
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Buscar reliquia (ej. AAPL, TSLA)"
                                            className="w-full bg-[#0f0a0a] border border-[#4a4e5a] text-[#c5a059] font-[MedievalSharp] px-4 py-3 rounded focus:outline-none focus:border-[#9333ea] placeholder-gray-700 text-xs tracking-widest uppercase"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        />
                                        <button
                                            onClick={handleSearch}
                                            disabled={searchLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#c5a059]"
                                        >
                                            {searchLoading ? <IonSpinner name="dots" className="w-4 h-4" /> : <IonIcon icon={searchOutline} />}
                                        </button>
                                    </div>
                                </div>

                                {/* MAIN CHART CARD */}
                                <div className="bg-[#1a1616]/80 p-6 rounded-lg border border-[#c5a059]/50 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden h-[500px] flex flex-col">
                                    {/* Magic Circle Background Opacity */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>

                                    {selectedAsset ? (
                                        <>
                                            <div className="flex justify-between items-start mb-6 z-10 border-b border-[#4a4e5a] pb-4">
                                                <div>
                                                    <h2 className="text-3xl text-[#c5a059] font-[Cinzel] font-bold">
                                                        {selectedAsset.name}
                                                        <span className="text-sm text-gray-500 ml-2 font-[MedievalSharp]">({selectedAsset.symbol})</span>
                                                    </h2>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs uppercase px-2 py-0.5 rounded bg-[#4a4e5a]/30 text-gray-400 border border-[#4a4e5a]">
                                                            {selectedAsset.type === 'crypto' ? 'Artefacto Mágico' : 'Pergamino Real'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-4xl text-[#e2d5b5] font-[MedievalSharp] drop-shadow-md">
                                                        {selectedAsset.price.toLocaleString()} <span className="text-xl text-[#c5a059]">GP</span>
                                                    </div>
                                                    <div className={`text-sm ${selectedAsset.change_24h_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {selectedAsset.change_24h_percent >= 0 ? '▲' : '▼'} {Math.abs(selectedAsset.change_24h_percent).toFixed(2)}% (24h)
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 relative z-10">
                                                {buildChartData() ? (
                                                    <Line data={buildChartData()!} options={chartOptions} />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50">
                                                        <IonIcon icon={pricetagOutline} style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                                                        <p className="font-[MedievalSharp] uppercase tracking-widest">La bola de cristal está nublada...</p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500 z-10">
                                            <p className="font-[Cinzel] tracking-widest uppercase">Selecciona un artefacto para inspeccionar</p>
                                        </div>
                                    )}
                                </div>

                                {/* SEARCH RESULT PREVIEW */}
                                {searchedAsset && searchedAsset.id !== selectedAsset?.id && (
                                    <div
                                        onClick={() => setSelectedAsset(searchedAsset)}
                                        className="mt-4 p-4 bg-[#8a1c1c]/10 border border-[#8a1c1c] rounded cursor-pointer hover:bg-[#8a1c1c]/20 flex justify-between items-center animate-fadeIn"
                                    >
                                        <span className="text-[#c5a059] font-[Cinzel]">Resultado: {searchedAsset.name}</span>
                                        <span className="text-[#e2d5b5] font-[MedievalSharp]">{searchedAsset.price} GP</span>
                                    </div>
                                )}
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default GlobalMarketPage;
