import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Stars, useGLTF } from '@react-three/drei';
import { useSpring, config } from '@react-spring/three';
import * as THREE from 'three';

import {
    IonCard, IonCardContent, IonSegment, IonSegmentButton,
    IonLabel, IonItem, IonInput, IonButton, IonIcon
} from '@ionic/react';
import { lockClosedOutline, mailOutline } from 'ionicons/icons';
import { supabase } from '../ts/supabaseClient.ts';

type LoginState = 'idle' | 'authenticating' | 'success' | 'zooming' | 'spinning' | 'transitioning';

interface D20DiceWithLoginProps {
    onAnimationComplete: () => void;
}

// Componente del dado animado con modelo GLB
const AnimatedDice: React.FC<{
    loginState: LoginState;
    onZoomComplete: () => void;
    onSpinComplete: () => void;
}> = ({ loginState, onZoomComplete, onSpinComplete }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/models/d20.glb');
    const { camera } = useThree();

    // Rotación para centrar perfectamente una cara triangular (ajuste fino)
    const baseRotation = [0.6, 0.6, 0] as [number, number, number];

    // Calcular rotación objetivo aleatoria solo cuando empieza el spin
    const targetRotation = React.useMemo(() => {
        if (loginState === 'spinning') {
            // Generar dirección y velocidad aleatoria
            // Math.sign: Aleatorio +/- 1
            // Magnitud: Entre 4 y 8 vueltas completas (8PI a 16PI) para que se note rápido
            const randomSpin = () => (Math.random() > 0.5 ? 1 : -1) * (Math.PI * (8 + Math.random() * 8));
            return [randomSpin(), randomSpin(), Math.random() * Math.PI * 2] as [number, number, number];
        }
        return baseRotation;
    }, [loginState]);

    // Animación de rotación del dado (RÁPIDA y ALEATORIA)
    const { rotation } = useSpring({
        rotation: targetRotation,
        config: { ...config.default, duration: 2500 }, // 2.5s bastante rápido para tantas vueltas
        onRest: () => {
            if (loginState === 'spinning') {
                onSpinComplete();
            }
        }
    });

    // Animación de cámara (zoom out RÁPIDO, 1.5 segundos)
    const { cameraZ } = useSpring({
        cameraZ: loginState === 'zooming' || loginState === 'spinning' || loginState === 'transitioning' ? 12 : 2.2,
        config: { ...config.default, duration: 1500 },
        onRest: () => {
            if (loginState === 'zooming') {
                onZoomComplete();
            }
        }
    });

    // Actualizar posición de cámara
    useFrame(() => {
        camera.position.z = cameraZ.get();
    });

    // Aplicar rotación
    useFrame(() => {
        if (groupRef.current) {
            const [x, y, z] = rotation.get() as [number, number, number];
            groupRef.current.rotation.set(x, y, z);
        }
    });



    return (
        <group
            ref={groupRef}
            scale={2.5}
            position={[0, 0, 0]}
        >
            <primitive object={scene.clone()} />
        </group>
    );
};

// Componente del formulario de login en 3D
const LoginForm3D: React.FC<{
    loginState: LoginState;
    onSubmit: (email: string, password: string, mode: 'login' | 'register') => void;
}> = ({ loginState, onSubmit }) => {
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(email, password, authMode);
    };

    // Ocultar formulario durante animaciones
    if (loginState !== 'idle' && loginState !== 'authenticating') {
        return null;
    }

    return (
        <Html
            transform
            distanceFactor={0.6}
            position={[0, 0, 1.25]}
            style={{
                width: '24rem',
                pointerEvents: loginState === 'idle' ? 'auto' : 'none',
                opacity: loginState === 'idle' ? 1 : 0,
                transition: 'opacity 0.3s'
            }}
        >
            <IonCard style={{
                width: '100%',
                borderRadius: '20px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 0.5rem 2rem 0 rgba(0, 0, 0, 0.5)'
            }}>
                <IonSegment
                    value={authMode}
                    onIonChange={e => setAuthMode(e.detail.value as any)}
                    style={{ padding: '0.6rem', background: 'transparent' }}
                >
                    <IonSegmentButton value="login" style={{ color: '#d4af37', '--indicator-color': '#d4af37' }}>
                        <IonLabel>Iniciar Sesión</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="register" style={{ color: '#d4af37', '--indicator-color': '#d4af37' }}>
                        <IonLabel>Registrarse</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                <IonCardContent>
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <h1 style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff', marginBottom: '2px', marginTop: '0' }}>
                            {authMode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
                        </h1>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '10px', margin: '0' }}>
                            {authMode === 'login' ? 'Gestiona tus finanzas' : 'Empieza ahora'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <IonItem className="ion-margin-bottom" lines="none" style={{
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            '--background': 'rgba(0, 0, 0, 0.3)',
                            '--color': 'white',
                            marginBottom: '6px',
                            minHeight: '28px'
                        }}>
                            <IonIcon icon={mailOutline} slot="start" style={{ marginLeft: '6px', color: '#d4af37', fontSize: '14px' }} />
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
                            borderRadius: '8px',
                            '--background': 'rgba(0, 0, 0, 0.3)',
                            '--color': 'white',
                            marginBottom: '10px',
                            minHeight: '28px'
                        }}>
                            <IonIcon icon={lockClosedOutline} slot="start" style={{ marginLeft: '6px', color: '#d4af37', fontSize: '14px' }} />
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

                        <IonButton
                            expand="block"
                            type="submit"
                            shape="round"
                            size="large"
                            disabled={loginState === 'authenticating'}
                            style={{
                                '--background': '#d4af37',
                                '--color': '#000000',
                                '--box-shadow': '0 2px 8px rgba(212, 175, 55, 0.4)',
                                fontSize: '14px',
                                height: '28px',
                                minHeight: '28px'
                            }}
                        >
                            {loginState === 'authenticating' ? 'Entrando...' : (authMode === 'login' ? 'Entrar' : 'Registrarse')}
                        </IonButton>
                    </form>
                </IonCardContent>
            </IonCard>
        </Html>
    );
};

// Componente principal
const D20DiceWithLogin: React.FC<D20DiceWithLoginProps> = ({ onAnimationComplete }) => {
    const [loginState, setLoginState] = useState<LoginState>('idle');
    const [error, setError] = useState('');

    const handleLogin = async (email: string, password: string, mode: 'login' | 'register') => {
        setLoginState('authenticating');
        setError('');

        let result;
        if (mode === 'login') {
            result = await supabase.auth.signInWithPassword({ email, password });
        } else {
            result = await supabase.auth.signUp({ email, password });
        }

        const { error: authError, data } = result;

        if (authError) {
            console.error('Auth error:', authError);
            setError(authError.message);
            setLoginState('idle');
        } else {
            // Check if registration requires email confirmation
            if (mode === 'register' && !data.session) {
                setError('Registro exitoso. Por favor verifica tu email.');
                setLoginState('idle');
                return;
            }

            console.log('Auth success - Starting animation sequence');
            setLoginState('success');
            // Delay antes de zoom (Rápido: 0.5s)
            setTimeout(() => setLoginState('zooming'), 500);
        }
    };

    const handleZoomComplete = () => {
        console.log('Zoom complete - Starting spin');
        setLoginState('spinning');
    };

    const handleSpinComplete = () => {
        console.log('Spin complete - Transitioning');
        setLoginState('transitioning');
        // Delay corto: 1.0s para admirar brevemente y vamonos
        setTimeout(() => {
            onAnimationComplete();
        }, 1000);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#0a0a0a'
        }}>
            {/* OPTIMIZACIÓN MÓVIL: dpr limitado a 2 para pantallas retina, evitar renderizar 4k innecesario */}
            <Canvas
                camera={{ position: [0, 0, 2.2], fov: 40 }}
                dpr={[1, 2]}
                gl={{ antialias: true, powerPreference: "high-performance" }}
            >
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#d4af37" />
                <pointLight position={[-10, -10, -10]} intensity={0.8} color="#8a1c1c" />
                <pointLight position={[0, 0, 5]} intensity={1} color="#ffffff" />

                <Suspense fallback={null}>
                    <AnimatedDice
                        loginState={loginState}
                        onZoomComplete={handleZoomComplete}
                        onSpinComplete={handleSpinComplete}
                    />
                    <LoginForm3D loginState={loginState} onSubmit={handleLogin} />
                    {/* Reducido conteo de estrellas para mejor performance en GPU móvil */}
                    <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
                </Suspense>
            </Canvas>

            {/* Error toast */}
            {error && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(220, 38, 38, 0.9)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    {error}
                </div>
            )}

            {/* Fade overlay durante transición */}
            {loginState === 'transitioning' && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'black',
                    animation: 'fadeIn 0.5s ease-in',
                    zIndex: 999
                }} />
            )}
        </div>
    );
};

export default D20DiceWithLogin;
