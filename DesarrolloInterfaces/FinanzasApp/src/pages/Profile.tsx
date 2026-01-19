import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonAvatar, IonLoading, IonToast, IonButtons, IonBackButton } from '@ionic/react';
import { getProfile, updateProfile, uploadAvatar } from '../services/profileService';
// import type { Profile } from '../types';
import { useTranslation } from 'react-i18next';

const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [website, setWebsite] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const profile = await getProfile();
            if (profile) {
                setUsername(profile.username || '');
                setWebsite(profile.website || '');
                setAvatarUrl(profile.avatar_url || '');
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({ username, website, avatar_url: avatarUrl } as any); // Cast to handle id missing in partial
            setToastMessage(t('profile.saved'));
            setShowToast(true);
        } catch (error: any) {
            setToastMessage(t('profile.error') + ': ' + error.message);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        setLoading(true);
        try {
            const file = event.target.files[0];
            // Note: We need to create 'avatars' bucket or verify it exists. 
            // For now assuming we might fail if bucket missing.
            const publicUrl = await uploadAvatar(file);
            setAvatarUrl(publicUrl);
            await updateProfile({ avatar_url: publicUrl } as any);
        } catch (error: any) {
            setToastMessage('Error: ' + error.message);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/app/settings" />
                    </IonButtons>
                    <IonTitle>{t('profile.title')}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div className="ion-text-center ion-margin-bottom">
                    <IonAvatar style={{ width: '100px', height: '100px', margin: '0 auto' }}>
                        <img src={avatarUrl || 'https://ionicframework.com/docs/img/demos/avatar.svg'} alt="Avatar" />
                    </IonAvatar>
                    <br />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} />
                </div>

                <IonItem>
                    <IonLabel position="stacked">{t('profile.username')}</IonLabel>
                    <IonInput value={username} onIonChange={e => setUsername(e.detail.value!)} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">{t('profile.website')}</IonLabel>
                    <IonInput value={website} onIonChange={e => setWebsite(e.detail.value!)} />
                </IonItem>

                <IonButton expand="block" className="ion-margin-top" onClick={handleSave}>
                    {t('profile.save')}
                </IonButton>

                <IonLoading isOpen={loading} message="Cargando..." />
                <IonToast isOpen={showToast} message={toastMessage} duration={2000} onDidDismiss={() => setShowToast(false)} />
            </IonContent>
        </IonPage>
    );
};

export default ProfilePage;
