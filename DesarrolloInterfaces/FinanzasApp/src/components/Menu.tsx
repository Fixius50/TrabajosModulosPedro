import {
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { pieChartOutline, walletOutline, trendingUpOutline, personOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import './Menu.css';

interface AppPage {
    url: string;
    iosIcon: string;
    mdIcon: string;
    title: string;
}

const Menu: React.FC = () => {
    const location = useLocation();
    const { t } = useTranslation();

    const appPages: AppPage[] = [
        {
            title: t('app.dashboard') || 'Dashboard',
            url: '/app/dashboard',
            iosIcon: pieChartOutline,
            mdIcon: pieChartOutline
        },
        {
            title: 'Finanzas',
            url: '/app/finances',
            iosIcon: walletOutline,
            mdIcon: walletOutline
        },
        {
            title: 'Mercado',
            url: '/app/market',
            iosIcon: trendingUpOutline,
            mdIcon: trendingUpOutline
        },
        {
            title: 'Cuenta',
            url: '/app/account',
            iosIcon: personOutline,
            mdIcon: personOutline
        }
    ];

    return (
        <IonMenu contentId="main">
            <IonContent>
                <IonList id="inbox-list">
                    <IonListHeader>Finanzas App</IonListHeader>
                    <IonNote>Gestión & Fantasía</IonNote>
                    {appPages.map((appPage, index) => {
                        return (
                            <IonMenuToggle key={index} autoHide={false}>
                                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                                    <IonIcon slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                                    <IonLabel>{appPage.title}</IonLabel>
                                </IonItem>
                            </IonMenuToggle>
                        );
                    })}
                </IonList>
            </IonContent>
        </IonMenu>
    );
};

export default Menu;
