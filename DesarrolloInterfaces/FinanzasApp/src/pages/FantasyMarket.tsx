import React, { useState, useEffect } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonText,
    IonIcon, useIonViewWillEnter, IonButtons, IonMenuButton
} from '@ionic/react';
import { arrowUp, arrowDown } from 'ionicons/icons';
import { getMarketData, tickMarket, type MarketAsset } from '../services/marketSimulationService';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FantasyMarket: React.FC = () => {
    const [assets, setAssets] = useState<MarketAsset[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState<string>('mithril');

    const updateMarket = () => {
        const data = tickMarket();
        setAssets([...data]);
    };

    useIonViewWillEnter(() => {
        // Initial load
        setAssets(getMarketData());
    });

    // Simulate "Real Time" ticks every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            updateMarket();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

    const chartData = {
        labels: Array.from({ length: selectedAsset?.history.length || 0 }, (_, i) => i + 1),
        datasets: [
            {
                label: selectedAsset?.name,
                data: selectedAsset?.history,
                borderColor: selectedAsset?.color,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                tension: 0.4,
                pointRadius: 0
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: { display: false },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Mercado de Fantasía 🧙‍♂️</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding">
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Mercado</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonGrid>
                    <IonRow>
                        {/* Selected Asset Chart Card */}
                        <IonCol size="12" sizeMd="8">
                            <IonCard style={{ height: '40vh', display: 'flex', flexDirection: 'column' }}>
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
                                <div style={{ flex: 1, position: 'relative', width: '99%', maxHeight: '30vh', padding: '0.6rem' }}>
                                    {selectedAsset && <Line data={chartData} options={chartOptions} />}
                                </div>
                            </IonCard>
                        </IonCol>

                        {/* Asset List Side Panel */}
                        <IonCol size="12" sizeMd="4">
                            <h3 style={{ marginLeft: '0.6rem' }}>Activos</h3>
                            {assets.map(asset => {
                                const isUp = asset.history[asset.history.length - 1] > asset.history[asset.history.length - 2];
                                return (
                                    <IonCard
                                        key={asset.id}
                                        button
                                        onClick={() => setSelectedAssetId(asset.id)}
                                        color={selectedAssetId === asset.id ? 'light' : undefined}
                                    >
                                        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default FantasyMarket;
