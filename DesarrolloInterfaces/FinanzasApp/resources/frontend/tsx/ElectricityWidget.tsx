import React, { useEffect, useState } from 'react';
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonIcon, IonText } from '@ionic/react';
import { flash } from 'ionicons/icons';
import { getElectricityPrice } from '../ts/apiService';
import { useTranslation } from 'react-i18next';

const ElectricityWidget: React.FC = () => {
    const [price, setPrice] = useState<number | null>(null);
    const [color, setColor] = useState('medium');
    const { t } = useTranslation();

    useEffect(() => {
        const fetchPrice = async () => {
            // NOTE: Ideally getting token from settings context or localStorage
            const token = localStorage.getItem('esios_token');
            if (token) {
                const values = await getElectricityPrice(token);
                if (values && values.length > 0) {
                    // Get current hour price
                    const currentHour = new Date().getHours();
                    const currentVal = values.find((v: any) => v.datetime.includes(`T${currentHour.toString().padStart(2, '0')}`));
                    if (currentVal) {
                        const priceVal = currentVal.value / 1000; // €/MWh -> €/kWh
                        setPrice(priceVal);

                        // Color logic (Arbitrary thresholds)
                        if (priceVal < 0.10) setColor('success');
                        else if (priceVal < 0.20) setColor('warning');
                        else setColor('danger');
                    }
                }
            }
        };
        fetchPrice();
    }, []);

    if (!localStorage.getItem('esios_token')) return null;

    return (
        <IonCard>
            <IonCardHeader>
                <IonCardSubtitle>{t('dashboard.electricity_price')}</IonCardSubtitle>
                <IonCardTitle>
                    <IonIcon icon={flash} color={color} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                    {price ? `${price.toFixed(4)} €/kWh` : '--'}
                </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <IonText color={color}>
                    {price ? (color === 'success' ? t('dashboard.cheap_time') : color === 'warning' ? t('dashboard.average_time') : t('dashboard.expensive_time')) : t('dashboard.configure_token')}
                </IonText>
            </IonCardContent>
        </IonCard>
    );
};

export default ElectricityWidget;
