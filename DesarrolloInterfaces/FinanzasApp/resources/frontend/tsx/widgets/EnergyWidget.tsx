import React, { useEffect, useState } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonIcon, IonSkeletonText } from '@ionic/react';
import { flash, alertCircleOutline, happyOutline } from 'ionicons/icons';
import { esiosService, type PVPCData } from '../../ts/services/esios.service';

const EnergyWidget: React.FC = () => {
    const [data, setData] = useState<PVPCData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const result = await esiosService.getPVPC();
        setData(result);
        setLoading(false);
    };

    // Lógica de "Semáforo"
    // Precio medio ref: ~100-150 €/MWh. 
    // < 100 Barato (Verde), 100-200 Normal (Amarillo), > 200 Caro (Rojo)
    const getTrafficLight = (price: number) => {
        if (price < 100) return { color: 'var(--ion-color-success)', icon: happyOutline, text: 'Buen momento' };
        if (price < 200) return { color: 'var(--ion-color-warning)', icon: flash, text: 'Precio Medio' };
        return { color: 'var(--ion-color-danger)', icon: alertCircleOutline, text: 'Pico Alto' };
    };

    if (loading) {
        return (
            <IonCard style={{ margin: '0 0 1rem 0', borderRadius: '1rem' }}>
                <IonCardContent>
                    <IonSkeletonText animated style={{ width: '50%', height: '1.5rem', marginBottom: '0.5rem' }} />
                    <IonSkeletonText animated style={{ width: '80%', height: '3rem' }} />
                </IonCardContent>
            </IonCard>
        );
    }

    if (!data) return null; // O mostrar error state

    const status = getTrafficLight(data.value);
    const priceKwh = (data.value / 1000).toFixed(4); // Convertir MWh a kWh

    return (
        <IonCard style={{
            margin: '0 0 1rem 0',
            borderRadius: '1rem',
            background: `linear-gradient(135deg, var(--ion-background-color) 0%, ${status.color}15 100%)`,
            border: `0.0625rem solid ${status.color}30`
        }}>
            <IonCardHeader style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <IonCardSubtitle style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <IonIcon icon={flash} style={{ color: status.color }} />
                        PRECIO LUZ (PVPC)
                    </IonCardSubtitle>
                    <div style={{
                        background: status.color,
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '2rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                    }}>
                        {status.text}
                    </div>
                </div>
            </IonCardHeader>

            <IonCardContent style={{ padding: '0 1rem 1rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--ion-text-color)' }}>
                        {priceKwh}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--ion-color-medium)' }}>
                        €/kWh
                    </span>
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--ion-color-medium)' }}>
                    Hora actual: {new Date().getHours()}:00 - {new Date().getHours() + 1}:00
                </p>
            </IonCardContent>
        </IonCard>
    );
};

export default EnergyWidget;
