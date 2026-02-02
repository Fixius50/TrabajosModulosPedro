import React from 'react';
import { IonPage } from '@ionic/react';
import D20DiceWithLogin from './D20DiceWithLogin.tsx';

interface AuthPageProps {
    onLoginSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
    const handleAnimationComplete = () => {
        console.log('Animation complete - triggering navigation');
        if (onLoginSuccess) {
            onLoginSuccess();
        }
    };

    return (
        <IonPage>
            <D20DiceWithLogin onAnimationComplete={handleAnimationComplete} />
        </IonPage>
    );
};

export default AuthPage;
