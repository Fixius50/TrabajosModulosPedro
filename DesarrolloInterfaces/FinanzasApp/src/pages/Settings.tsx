import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonToggle } from '@ionic/react';
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
