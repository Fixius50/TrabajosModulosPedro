import React, { useState } from 'react';
import {
    IonContent, IonPage, IonCard, IonCardContent, IonSegment,
    IonSegmentButton, IonLabel, IonItem, IonInput, IonButton,
    IonLoading, IonToast, IonIcon
} from '@ionic/react';
import { lockClosedOutline, mailOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (authMode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setToastMessage(error.message.includes("Invalid login") ? "Credenciales incorrectas." : error.message);
                setShowToast(true);
            } else {
                navigate('/app/dashboard');
            }
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setToastMessage(error.message.includes("already registered") ? "Usuario ya registrado." : error.message);
                setShowToast(true);
            } else {
                setToastMessage('¡Cuenta creada! Verifica tu email.');
                setShowToast(true);
                setTimeout(() => setAuthMode('login'), 2000);
            }
        }
        setLoading(false);
    };

    return (
        <IonPage>
            <IonContent className="ion-padding" scrollY={false}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    background: 'var(--ion-background-color)'
                }}>
                    <IonCard style={{
                        width: '100%',
                        maxWidth: '400px',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                    }}>
                        <IonSegment value={authMode} onIonChange={e => setAuthMode(e.detail.value as any)} style={{ padding: '10px' }}>
                            <IonSegmentButton value="login">
                                <IonLabel>Iniciar Sesión</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="register">
                                <IonLabel>Registrarse</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>

                        <IonCardContent>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h1 style={{ fontWeight: 'bold', fontSize: '24px' }}>
                                    {authMode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                                </h1>
                                <p style={{ color: 'var(--ion-color-medium)' }}>
                                    {authMode === 'login' ? 'Gestiona tus finanzas' : 'Empieza a controlar tus gastos'}
                                </p>
                            </div>

                            <form onSubmit={handleAuth}>
                                <IonItem className="ion-margin-bottom" lines="none" style={{ border: '1px solid var(--ion-color-light-shade)', borderRadius: '10px' }}>
                                    <IonIcon icon={mailOutline} slot="start" style={{ marginLeft: '10px' }} />
                                    <IonInput
                                        name="email"
                                        autocomplete="username"
                                        placeholder="Email"
                                        type="email"
                                        value={email}
                                        onIonInput={e => setEmail(e.detail.value!)}
                                        required
                                    />
                                </IonItem>

                                <IonItem className="ion-margin-bottom" lines="none" style={{ border: '1px solid var(--ion-color-light-shade)', borderRadius: '10px' }}>
                                    <IonIcon icon={lockClosedOutline} slot="start" style={{ marginLeft: '10px' }} />
                                    <IonInput
                                        name="password"
                                        autocomplete={authMode === 'login' ? 'current-password' : 'new-password'}
                                        placeholder="Contraseña"
                                        type="password"
                                        value={password}
                                        onIonInput={e => setPassword(e.detail.value!)}
                                        required
                                    />
                                </IonItem>

                                <IonButton expand="block" type="submit" shape="round" className="ion-margin-top" size="large">
                                    {authMode === 'login' ? 'Entrar' : 'Registrarse'}
                                </IonButton>
                            </form>
                        </IonCardContent>
                    </IonCard>
                </div>

                <IonLoading isOpen={loading} message={authMode === 'login' ? 'Entrando...' : 'Registrando...'} />
                <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} position="top" />
            </IonContent>
        </IonPage>
    );
};

export default AuthPage;
