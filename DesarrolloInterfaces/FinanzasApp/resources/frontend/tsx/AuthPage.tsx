import React, { useState } from 'react';
import {
    IonContent, IonPage, IonCard, IonCardContent, IonSegment,
    IonSegmentButton, IonLabel, IonItem, IonInput, IonButton,
    IonLoading, IonToast, IonIcon
} from '@ionic/react';
import { lockClosedOutline, mailOutline } from 'ionicons/icons';
import { supabase } from '../ts/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
    onLoginSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const navigate = useNavigate();

    const triggerSuccessSequence = () => {
        if (onLoginSuccess) {
            onLoginSuccess(); // Triggers 3D Animation in App.tsx
            // Navigation is now handled by App.tsx changing state after timeout
        } else {
            navigate('/app/dashboard');
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (authMode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error("Login Result:", error);
                setToastMessage(error.message.includes("Invalid login") ? "Credenciales incorrectas." : (error.message || "Error al iniciar sesión"));
                setShowToast(true);
                setLoading(false); // Stop loading on error
            } else {
                console.log("Login Success - Starting Animation");
                // Do NOT stop loading here to keep UI "busy" or you can fade it out
                // We'll keep loading=true to show the spinner while animation happens?
                // Or maybe just let it fade. Let's trigger the sequence.
                triggerSuccessSequence();
            }
        } else {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                // Supabase sometimes requires options for email redirect
                options: {
                    emailRedirectTo: window.location.origin + '/login'
                }
            });
            if (error) {
                console.error("Signup Result:", error);
                setToastMessage(error.message.includes("already registered") ? "Usuario ya registrado." : error.message);
                setShowToast(true);
                setLoading(false);
            } else {
                console.log("Signup Success", data);
                // Check if session was created immediately (auto-confirm enabled?)
                if (data.session) {
                    setToastMessage('¡Cuenta creada y sesión iniciada!');
                    triggerSuccessSequence();
                } else {
                    setToastMessage('¡Cuenta creada! Verifica tu email.');
                    setTimeout(() => setAuthMode('login'), 2000);
                    setLoading(false);
                }
            }
        }
    };

    return (
        <IonPage className="auth-page">
            <style>
                {`
                    .auth-page ion-content {
                        --background: transparent;
                    }
                    .auth-page ion-content::part(background) {
                        background: transparent;
                    }
                    .auth-page ion-content::part(scroll) {
                        background: transparent;
                    }
                `}
            </style>
            <IonContent className="ion-padding" scrollY={false} style={{ '--background': '#0a0a0a' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    background: 'transparent' // Remove solid background
                }}>
                    <IonCard style={{
                        width: '100%',
                        maxWidth: '400px',
                        borderRadius: '20px',
                        // Glassmorphism Styles
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(212, 175, 55, 0.3)', // Subtle Gold Border
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                    }}>
                        <IonSegment value={authMode} onIonChange={e => setAuthMode(e.detail.value as any)} style={{ padding: '10px', background: 'transparent' }}>
                            <IonSegmentButton value="login" style={{ color: '#d4af37', '--indicator-color': '#d4af37' }}>
                                <IonLabel>Iniciar Sesión</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="register" style={{ color: '#d4af37', '--indicator-color': '#d4af37' }}>
                                <IonLabel>Registrarse</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>

                        <IonCardContent>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h1 style={{ fontWeight: 'bold', fontSize: '24px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                    {authMode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                                </h1>
                                <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    {authMode === 'login' ? 'Gestiona tus finanzas' : 'Empieza a controlar tus gastos'}
                                </p>
                            </div>

                            <form onSubmit={handleAuth}>
                                <IonItem className="ion-margin-bottom" lines="none" style={{
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '10px',
                                    '--background': 'rgba(0, 0, 0, 0.2)',
                                    '--color': 'white'
                                }}>
                                    <IonIcon icon={mailOutline} slot="start" style={{ marginLeft: '10px', color: '#d4af37' }} />
                                    <IonInput
                                        name="email"
                                        autocomplete="username"
                                        placeholder="Email"
                                        type="email"
                                        value={email}
                                        onIonInput={e => setEmail(e.detail.value!)}
                                        required
                                        style={{ '--placeholder-color': 'rgba(255,255,255,0.5)', '--color': 'white' }}
                                    />
                                </IonItem>

                                <IonItem className="ion-margin-bottom" lines="none" style={{
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '10px',
                                    '--background': 'rgba(0, 0, 0, 0.2)',
                                    '--color': 'white'
                                }}>
                                    <IonIcon icon={lockClosedOutline} slot="start" style={{ marginLeft: '10px', color: '#d4af37' }} />
                                    <IonInput
                                        name="password"
                                        autocomplete={authMode === 'login' ? 'current-password' : 'new-password'}
                                        placeholder="Contraseña"
                                        type="password"
                                        value={password}
                                        onIonInput={e => setPassword(e.detail.value!)}
                                        required
                                        style={{ '--placeholder-color': 'rgba(255,255,255,0.5)', '--color': 'white' }}
                                    />
                                </IonItem>

                                <IonButton expand="block" type="submit" shape="round" className="ion-margin-top" size="large" style={{
                                    '--background': '#d4af37',
                                    '--color': '#000000',
                                    '--box-shadow': '0 4px 15px rgba(212, 175, 55, 0.4)'
                                }}>
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
