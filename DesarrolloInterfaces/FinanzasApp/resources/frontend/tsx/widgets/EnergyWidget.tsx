import React, { useEffect, useState } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, IonSkeletonText } from '@ionic/react';
import { flash, alertCircleOutline, trendingDownOutline, trendingUpOutline } from 'ionicons/icons';
import { esiosService, type EsiosData } from '../../ts/services/esios.service';

const EnergyWidget: React.FC = () => {
    const [data, setData] = useState<EsiosData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const result = await esiosService.getPvpcPrices();
            setData(result);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <IonCard className="w-full">
                <IonCardContent>
                    <IonSkeletonText animated style={{ width: '60%', height: '1.5rem' }} />
                    <IonSkeletonText animated style={{ width: '40%', height: '3rem', marginTop: '1rem' }} />
                </IonCardContent>
            </IonCard>
        );
    }

    if (!data) return null;

    const { currentPrice, avgPrice } = data;
    const isHigh = currentPrice.price > 0.20; // Example threshold
    const isLow = currentPrice.price < 0.10;

    // Tailwind classes for colors
    const colorClass = isLow ? 'text-green-500' : (isHigh ? 'text-red-500' : 'text-yellow-500');
    const borderColorClass = isLow ? 'border-green-500' : (isHigh ? 'border-red-500' : 'border-yellow-500');

    return (
        <IonCard className={`w-full m-0 shadow-md border-l-4 ${borderColorClass}`}>
            <IonCardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <IonCardSubtitle className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Precio Luz (PVPC)
                    </IonCardSubtitle>
                    <IonIcon icon={flash} className={`text-xl ${colorClass}`} />
                </div>
            </IonCardHeader>
            <IonCardContent>
                <div className="flex items-end justify-between">
                    <div>
                        <IonCardTitle className={`text-3xl font-bold ${colorClass}`}>
                            {currentPrice.price.toFixed(4)} <span className="text-base text-gray-500">€/kWh</span>
                        </IonCardTitle>
                        <p className="text-xs text-gray-400 mt-1">
                            Hora: {currentPrice.hour}
                        </p>
                    </div>
                </div>

                {/* Mini indicator vs Average */}
                <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center text-sm">
                    {currentPrice.price < avgPrice ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                            <IonIcon icon={trendingDownOutline} className="mr-1" />
                            <span>Bajo la media ({avgPrice.toFixed(3)})</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-red-600 dark:text-red-400">
                            <IonIcon icon={trendingUpOutline} className="mr-1" />
                            <span>Sobre la media ({avgPrice.toFixed(3)})</span>
                        </div>
                    )}
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default EnergyWidget;
