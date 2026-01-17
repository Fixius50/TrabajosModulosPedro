import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonToggle, IonInput, IonItemDivider, IonList, IonIcon } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
    const history = useHistory();
    const { t, i18n } = useTranslation();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDark);
        document.body.classList.toggle('dark', isDark);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        history.push('/login');
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const toggleDarkMode = (isDark: boolean) => {
        setDarkMode(isDark);
        localStorage.setItem('darkMode', String(isDark));
        document.body.classList.toggle('dark', isDark);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{t('settings.title')}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <h2>{t('settings.title')}</h2>

                <IonItem>
                    <IonLabel>{t('settings.language')}</IonLabel>
                    <IonSelect value={i18n.language} onIonChange={e => changeLanguage(e.detail.value)}>
                        <IonSelectOption value="es">Español</IonSelectOption>
                        <IonSelectOption value="en">English</IonSelectOption>
                    </IonSelect>
                </IonItem>

                <IonItem>
                    <IonLabel>{t('settings.darkMode')}</IonLabel>
                    <IonToggle checked={darkMode} onIonChange={e => toggleDarkMode(e.detail.checked)} />
                </IonItem>

                <IonItemDivider>
                    <IonLabel>{t('settings.api_tokens')}</IonLabel>
                </IonItemDivider>
                <IonItem>
                    <IonLabel position="stacked">{t('settings.esios_token')}</IonLabel>
                    <IonInput
                        value={localStorage.getItem('esios_token') || ''}
                        placeholder="Pegar Token ESIOS"
                        onIonChange={e => {
                            if (e.detail.value) localStorage.setItem('esios_token', e.detail.value);
                            else localStorage.removeItem('esios_token');
                        }}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">{t('settings.marketaux_token')}</IonLabel>
                    <IonInput
                        value={localStorage.getItem('marketaux_token') || ''}
                        placeholder="Pegar Token Marketaux"
                        onIonChange={e => {
                            if (e.detail.value) localStorage.setItem('marketaux_token', e.detail.value);
                            else localStorage.removeItem('marketaux_token');
                        }}
                    />
                </IonItem>

                <IonButton expand="block" routerLink="/app/profile" className="ion-margin-bottom">
                    {t('settings.editProfile')}
                </IonButton>
                <IonButton expand="block" color="danger" onClick={handleLogout}>
                    {t('settings.logout')}
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default Settings;
