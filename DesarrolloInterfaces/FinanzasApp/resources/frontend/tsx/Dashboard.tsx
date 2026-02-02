import React, { Suspense } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import BankAccountManager from './BankAccountManager';
import EnergyWidget from './widgets/EnergyWidget';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import TreasureChest from './models/TreasureChest';

interface DashboardProps {
    onUnlock: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onUnlock }) => {
    return (
        <IonPage>
            <IonContent fullscreen style={{ '--background': '#0f0a0a' }}>
                <div className="relative min-h-screen bg-[#0f0a0a]">

                    {/* 3D Model Area - Wrap with internal Error Boundary or just keep it simple */}
                    <div className="relative w-full h-[40vh] z-0 flex items-center justify-center">
                        <Suspense fallback={<div className="text-[#c5a059] font-[Cinzel] animate-pulse">Abriendo el Tesoro...</div>}>
                            <Canvas
                                shadows
                                camera={{ position: [0, 2, 5], fov: 45 }}
                                style={{ pointerEvents: 'auto' }}
                            >
                                <ambientLight intensity={0.5} />
                                <pointLight position={[10, 10, 10]} intensity={1} color="#d4af37" />
                                <TreasureChest position={[0, -1, 0]} scale={0.7} />
                                <Environment preset="city" />
                                <OrbitControls enableZoom={false} autoRotate />
                            </Canvas>
                        </Suspense>
                    </div>

                    {/* UI Content */}
                    <div className="relative z-10 p-4 -mt-8">
                        <EnergyWidget />
                        <div className="mt-4">
                            <BankAccountManager onUnlock={onUnlock} />
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;
