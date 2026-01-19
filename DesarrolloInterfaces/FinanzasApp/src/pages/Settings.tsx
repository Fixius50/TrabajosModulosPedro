import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonToggle, IonInput, IonItemDivider, IonList, IonIcon } from '@ionic/react';
import { documentTextOutline, cloudUploadOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImportModal from '../components/ImportModal';

const Settings: React.FC = () => {
    const history = useHistory();
    const { t, i18n } = useTranslation();
    const [darkMode, setDarkMode] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [esiosToken, setEsiosToken] = useState(localStorage.getItem('esios_token') || '');
    const [marketauxToken, setMarketauxToken] = useState(localStorage.getItem('marketaux_token') || '');

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

    const handleExportJSON = async () => {
        const { getTransactions } = await import('../services/transactionService');
        const transactions = await getTransactions();
        const { exportToJSON } = await import('../services/exportService');
        exportToJSON(transactions, 'finanzas_backup');
    };

    const handleExportPDF = async () => {
        const { getTransactions } = await import('../services/transactionService');
        const transactions = await getTransactions();
        const { exportToPDF } = await import('../services/exportService');
        exportToPDF(transactions);
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

                <IonList>
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
                        <IonLabel>{t('settings.export_data')}</IonLabel>
                    </IonItemDivider>
                    <IonItem button onClick={() => setShowImportModal(true)}>
                        <IonLabel>{t('settings.import_csv')}</IonLabel>
                        <IonIcon icon={cloudUploadOutline} slot="end" />
                    </IonItem>
                    <IonItem button onClick={handleExportJSON}>
                        <IonLabel>{t('settings.export_json')}</IonLabel>
                        <IonIcon icon={documentTextOutline} slot="end" />
                    </IonItem>
                    <IonItem button onClick={handleExportPDF}>
                        <IonLabel>{t('settings.export_pdf')}</IonLabel>
                        <IonIcon icon={documentTextOutline} slot="end" />
                    </IonItem>

                    <IonItemDivider>
                        <IonLabel>{t('settings.api_tokens')}</IonLabel>
                    </IonItemDivider>
                    <IonItem>
                        <IonLabel position="stacked">{t('settings.esios_token')}</IonLabel>
                        <IonInput
                            value={esiosToken}
                            placeholder="Pegar Token ESIOS"
                            onIonChange={e => {
                                const val = e.detail.value || '';
                                setEsiosToken(val);
                                if (val) localStorage.setItem('esios_token', val);
                                else localStorage.removeItem('esios_token');
                            }}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">{t('settings.marketaux_token')}</IonLabel>
                        <IonInput
                            value={marketauxToken}
                            placeholder="Pegar Token Marketaux"
                            onIonChange={e => {
                                const val = e.detail.value || '';
                                setMarketauxToken(val);
                                if (val) localStorage.setItem('marketaux_token', val);
                                else localStorage.removeItem('marketaux_token');
                            }}
                        />
                    </IonItem>
                </IonList>

                <IonButton expand="block" routerLink="/app/profile" className="ion-margin-bottom ion-margin-top">
                    {t('settings.editProfile')}
                </IonButton>
                <IonButton expand="block" color="danger" onClick={handleLogout}>
                    {t('settings.logout')}
                </IonButton>

                <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
            </IonContent>
        </IonPage>
    );
};

export default Settings;
