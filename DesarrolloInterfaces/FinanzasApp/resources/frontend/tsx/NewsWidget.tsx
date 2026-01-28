import React, { useEffect, useState } from 'react';
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel, IonNote } from '@ionic/react';
import { getFinancialNews } from '../services/apiService';
import { useTranslation } from 'react-i18next';

const NewsWidget: React.FC = () => {
    const [news, setNews] = useState<any[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchNews = async () => {
            const token = localStorage.getItem('marketaux_token');
            if (token) {
                const data = await getFinancialNews(token);
                if (data) setNews(data.slice(0, 3)); // Show top 3
            }
        };
        fetchNews();
    }, []);

    if (!localStorage.getItem('marketaux_token')) return null;

    return (
        <IonCard>
            <IonCardHeader>
                <IonCardSubtitle>{t('dashboard.financial_news')}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent className="ion-no-padding">
                <IonList>
                    {news.map((item, index) => (
                        <IonItem key={index} href={item.url} target="_blank">
                            <IonLabel className="ion-text-wrap">
                                <h2>{item.title}</h2>
                                <IonNote>{item.source}</IonNote>
                            </IonLabel>
                        </IonItem>
                    ))}
                    {news.length === 0 && (
                        <IonItem>
                            <IonLabel>{t('dashboard.no_news')}</IonLabel>
                        </IonItem>
                    )}
                </IonList>
            </IonCardContent>
        </IonCard>
    );
};

export default NewsWidget;
