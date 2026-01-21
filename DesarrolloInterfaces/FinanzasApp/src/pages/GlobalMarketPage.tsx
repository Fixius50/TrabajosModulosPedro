import React, { useState, useEffect } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonText,
    IonIcon, useIonViewWillEnter, IonButtons, IonMenuButton
} from '@ionic/react';
import { arrowUp, arrowDown, newspaperOutline, trendingUpOutline } from 'ionicons/icons';
import { getMarketData, tickMarket, type MarketAsset } from '../services/marketSimulationService';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Widgets migrated from Dashboard
import NewsWidget from '../components/NewsWidget';
import { getBitcoinPrice } from '../services/apiService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GlobalMarketPage: React.FC = () => {
    const [assets, setAssets] = useState<MarketAsset[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState<string>('mithril');
    const [btcPrice, setBtcPrice] = useState<number | null>(null);

    // Initial Data Load
    useIonViewWillEnter(() => {
        setAssets(getMarketData());
        loadCryptoData();
    });

    // Real-time Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            const data = tickMarket();
            setAssets([...data]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const loadCryptoData = async () => {
        const price = await getBitcoinPrice();
        setBtcPrice(price);
    };

    const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

    // Chart Configuration
    const chartData = {
        labels: Array.from({ length: selectedAsset?.history.length || 0 }, (_, i) => i + 1),
        datasets: [{
            label: selectedAsset?.name,
            data: selectedAsset?.history,
            borderColor: selectedAsset?.color,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2
        }]
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
                        {/* LEFT COLUMN: INFORMATION & REAL WORLD DATA */}
                        <IonCol size="12" sizeMd="6">
                            {/* Real Crypto Widget */}
                            <IonCard color="dark">
                                <IonCardHeader>
                                    <IonCardSubtitle>Mercado Real</IonCardSubtitle>
                                    <IonCardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>Bitcoin (BTC)</span>
                                        <IonIcon icon={trendingUpOutline} color="warning" />
                                    </IonCardTitle>
                                </IonCardHeader>
                                <div style={{ padding: '0 20px 20px' }}>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
                                        {btcPrice ? `${btcPrice.toLocaleString()} €` : '...'}
                                    </h1>
                                    <p style={{ opacity: 0.7, marginTop: '5px' }}>Precio en vivo (CoinGecko)</p>
                                </div>
                            </IonCard>

                            {/* News Feed */}
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginLeft: '5px' }}>
                                    <IonIcon icon={newspaperOutline} style={{ marginRight: '10px' }} />
                                    <h3 style={{ margin: 0 }}>Noticias Financieras</h3>
                                </div>
                                <NewsWidget />
                            </div>
                        </IonCol>

                        {/* RIGHT COLUMN: FANTASY MARKET GAME */}
                        <IonCol size="12" sizeMd="6">
                            <h3 style={{ marginLeft: '5px', marginTop: '0' }}>Simulador de Fantasía</h3>

                            {/* Main Chart */}
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardSubtitle>{selectedAsset?.symbol}</IonCardSubtitle>
                                    <IonCardTitle>
                                        {selectedAsset?.name}
                                        <span style={{ float: 'right', color: selectedAsset?.history[selectedAsset.history.length - 1] > selectedAsset?.history[selectedAsset.history.length - 2] ? '#2dd36f' : '#eb445a', fontSize: '0.8em' }}>
                                            {selectedAsset?.price.toFixed(2)}
                                            <IonIcon icon={selectedAsset?.history[selectedAsset.history.length - 1] > selectedAsset?.history[selectedAsset.history.length - 2] ? arrowUp : arrowDown} />
                                        </span>
                                    </IonCardTitle>
                                </IonCardHeader>
                                <div style={{ height: '30vh', padding: '10px' }}>
                                    {selectedAsset && <Line data={chartData} options={chartOptions} />}
                                </div>
                            </IonCard>

                            {/* Asset List Selector */}
                            <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                                {assets.map(asset => {
                                    const isUp = asset.history[asset.history.length - 1] > asset.history[asset.history.length - 2];
                                    return (
                                        <IonCard
                                            key={asset.id}
                                            button
                                            onClick={() => setSelectedAssetId(asset.id)}
                                            color={selectedAssetId === asset.id ? 'medium' : undefined}
                                            style={{ margin: '5px 0' }}
                                        >
                                            <div style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{asset.symbol}</div>
                                                    <div style={{ fontSize: '0.8em', opacity: 0.7 }}>{asset.name}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{asset.price.toFixed(2)}</div>
                                                    <IonText color={isUp ? 'success' : 'danger'} style={{ fontSize: '0.8em' }}>
                                                        {isUp ? '+' : ''}{((asset.price - asset.history[asset.history.length - 2]) / asset.history[asset.history.length - 2] * 100).toFixed(2)}%
                                                    </IonText>
                                                </div>
                                            </div>
                                        </IonCard>
                                    );
                                })}
                            </div>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default GlobalMarketPage;
