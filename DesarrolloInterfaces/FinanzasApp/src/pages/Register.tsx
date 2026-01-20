import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonLoading, IonToast } from '@ionic/react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        setLoading(false);
        if (error) {
            if (error.message.includes("User already registered")) {
                setToastMessage("Este email ya está registrado. Intenta iniciar sesión.");
            } else {
                setToastMessage(error.message);
            }
            setShowToast(true);
        } else {
            setToastMessage('¡Cuenta creada! Revisa tu email para confirmar antes de entrar.');
            setShowToast(true);
            setTimeout(() => navigate('/login'), 2000);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Registro</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <form onSubmit={handleRegister}>
                    <IonItem>
                        <IonLabel position="floating">Email</IonLabel>
                        <IonInput value={email} type="email" onIonChange={e => setEmail(e.detail.value!)} required />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Password</IonLabel>
                        <IonInput value={password} type="password" onIonChange={e => setPassword(e.detail.value!)} required />
                    </IonItem>
                    <IonButton expand="block" type="submit" className="ion-margin-top">
                        Registrarse
                    </IonButton>
                    <IonButton expand="block" fill="clear" routerLink="/login">
                        Ya tienes cuenta? Login
                    </IonButton>
                </form>
                <IonLoading isOpen={loading} message={'Creando cuenta...'} />
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

export default Register;
