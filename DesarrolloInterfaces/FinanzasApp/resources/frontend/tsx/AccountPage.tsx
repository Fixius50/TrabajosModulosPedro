import React, { useState } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonSegment, IonSegmentButton, IonLabel, IonButtons, IonMenuButton
} from '@ionic/react';
import ProfilePage from './Profile';
import Settings from './Settings';

const AccountPage: React.FC = () => {
    const [selectedView, setSelectedView] = useState<'profile' | 'settings'>('profile');

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Mi Cuenta</IonTitle>
                </IonToolbar>
                <IonToolbar>
                    <IonSegment value={selectedView} onIonChange={e => setSelectedView(e.detail.value as any)}>
                        <IonSegmentButton value="profile">
                            <IonLabel>Perfil</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="settings">
                            <IonLabel>Ajustes</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div style={{ display: selectedView === 'profile' ? 'block' : 'none', height: '100%' }}>
                    <ProfilePage />
                </div>
                <div style={{ display: selectedView === 'settings' ? 'block' : 'none', height: '100%' }}>
                    <Settings />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AccountPage;
