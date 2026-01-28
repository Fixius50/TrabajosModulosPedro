import React, { useState } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonText,
    IonIcon, useIonViewWillEnter, IonButtons, IonMenuButton,
    IonSearchbar, IonSpinner, IonButton
} from '@ionic/react';
import { arrowUp, arrowDown, newspaperOutline, searchOutline, pricetagOutline } from 'ionicons/icons';
import { marketService, type MarketAsset } from '../services/market.service';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import NewsWidget from '../components/NewsWidget';

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
            // Handle not found
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
                borderColor: selectedAsset.type === 'crypto' ? '#ffc409' : '#3880ff', // Yellow for crypto, Blue for stocks
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
            y: { grid: { color: 'rgba(255, 255, 255, 0.1)' } }
        },
        maintainAspectRatio: false
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start"><IonMenuButton /></IonButtons>
                    <IonTitle>Mercados Globales</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding">
                <IonGrid>
                    <IonRow>
                        {/* LEFT COLUMN: WATCHLIST & CRYPTO */}
                        <IonCol size="12" sizeMd="4">
                            <h3 style={{ marginLeft: '10px' }}>Top Cripto (Live)</h3>
                            {loading && <IonSpinner />}

                            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {cryptoAssets.map(asset => {
                                    const isUp = asset.change_24h_percent >= 0;
                                    return (
                                        <IonCard
                                            key={asset.id}
                                            button
                                            onClick={() => setSelectedAsset(asset)}
                                            color={selectedAsset?.id === asset.id ? 'medium' : undefined}
                                            style={{ margin: '5px 0' }}
                                        >
                                            <div style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{asset.symbol}</div>
                                                    <div style={{ fontSize: '0.8em', opacity: 0.7 }}>{asset.name}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{asset.price.toLocaleString()} €</div>
                                                    <IonText color={isUp ? 'success' : 'danger'} style={{ fontSize: '0.8em' }}>
                                                        {isUp ? '▲' : '▼'} {Math.abs(asset.change_24h_percent).toFixed(2)}%
                                                    </IonText>
                                                </div>
                                            </div>
                                        </IonCard>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: '30px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '5px' }}>
                                    <IonIcon icon={newspaperOutline} style={{ marginRight: '10px' }} />
                                    <h3 style={{ margin: 0 }}>Noticias</h3>
                                </div>
                                <NewsWidget />
                            </div>
                        </IonCol>

                        {/* RIGHT COLUMN: DETAIL & SEARCH */}
                        <IonCol size="12" sizeMd="8">
                            {/* SEARCH BAR */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <IonSearchbar
                                    placeholder="Buscar acción (ej. AAPL, TSLA)"
                                    value={searchTerm}
                                    onIonInput={e => setSearchTerm(e.detail.value!)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    animated
                                />
                                <IonButton onClick={handleSearch} disabled={searchLoading}>
                                    {searchLoading ? <IonSpinner name="dots" /> : <IonIcon icon={searchOutline} />}
                                </IonButton>
                            </div>

                            {/* MAIN CHART CARD */}
                            <IonCard style={{ minHeight: '400px' }}>
                                {selectedAsset ? (
                                    <>
                                        <IonCardHeader>
                                            <IonCardSubtitle>{selectedAsset.type === 'crypto' ? 'Criptomoneda' : 'Stock (USA)'}</IonCardSubtitle>
                                            <IonCardTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>
                                                    {selectedAsset.name} <span style={{ fontSize: '0.6em', opacity: 0.7 }}>({selectedAsset.symbol})</span>
                                                </span>
                                                <span style={{
                                                    color: selectedAsset.change_24h_percent >= 0 ? '#2dd36f' : '#eb445a',
                                                    fontSize: '0.9em'
                                                }}>
                                                    {selectedAsset.price.toLocaleString()} {selectedAsset.type === 'crypto' ? '€' : '$'}
                                                    <IonIcon icon={selectedAsset.change_24h_percent >= 0 ? arrowUp : arrowDown} style={{ marginLeft: '5px' }} />
                                                </span>
                                            </IonCardTitle>
                                        </IonCardHeader>
                                        <div style={{ height: '350px', padding: '15px' }}>
                                            {buildChartData() ? (
                                                <Line data={buildChartData()!} options={chartOptions} />
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', opacity: 0.5 }}>
                                                    <IonIcon icon={pricetagOutline} size="large" />
                                                    <p>Gráfico no disponible para este activo</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <p>Selecciona un activo o busca una acción</p>
                                    </div>
                                )}
                            </IonCard>

                            {/* IF SEARCHED ASSET EXISTS BUT NOT SAVED */}
                            {searchedAsset && searchedAsset.id !== selectedAsset?.id && (
                                <IonCard color="light" button onClick={() => setSelectedAsset(searchedAsset)}>
                                    <div style={{ padding: '15px' }}>
                                        <strong>Resultado:</strong> {searchedAsset.name} ({searchedAsset.symbol}) - {searchedAsset.price} $
                                    </div>
                                </IonCard>
                            )}

                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default GlobalMarketPage;
