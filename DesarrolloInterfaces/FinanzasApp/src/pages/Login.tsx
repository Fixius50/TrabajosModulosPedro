import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonLoading, IonToast } from '@ionic/react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);
        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                setToastMessage("Credenciales inválidas. ¿Has confirmado tu email?");
            } else {
                setToastMessage(error.message);
            }
            setShowToast(true);
        } else {
            navigate('/app/dashboard');
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <form onSubmit={handleLogin}>
                    <IonItem>
                        <IonLabel position="floating">Email</IonLabel>
                        <IonInput value={email} type="email" onIonChange={e => setEmail(e.detail.value!)} required />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Password</IonLabel>
                        <IonInput value={password} type="password" onIonChange={e => setPassword(e.detail.value!)} required />
                    </IonItem>
                    <IonButton expand="block" type="submit" className="ion-margin-top">
                        Login
                    </IonButton>
                    <IonButton expand="block" fill="clear" routerLink="/register">
                        No tienes cuenta? Regístrate
                    </IonButton>
                </form>
                <IonLoading isOpen={loading} message={'Iniciando sesión...'} />
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                />
            </IonContent>
        </IonPage>
    );
};

export default Login;
