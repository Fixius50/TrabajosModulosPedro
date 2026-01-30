import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { dndService } from '../../ts/dndService';
import type { DndFinancialState } from '../../ts/dndService';

interface TheVaultProps {
    isTransitioning?: boolean;
    isLoading?: boolean;
}

const TheVault: React.FC<TheVaultProps> = ({ isTransitioning = false, isLoading = false }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [financialState, setFinancialState] = useState<DndFinancialState | null>(null);

    const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');

    // Camera zoom effect reference logic
    // We calculate targetZ dynamically in useFrame based on phase

    useEffect(() => {
        if (isTransitioning) {
            setPhase('in');
            // Schedule 'Out' phase after 1s
            const timer = setTimeout(() => {
                setPhase('out');
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setPhase('idle');
        }
    }, [isTransitioning]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await dndService.getFinancialState();
            setFinancialState(data);
        };
        fetchData();
        // Poll every 30 seconds for updates
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            // Base rotation (Static/Idle by default)
            let spinSpeed = 0;
            let targetZ = 5;

            // Transition "Critical Hit" Effect (Login Success)
            if (isTransitioning) {
                spinSpeed = 30.0; // HYPER SPEED!

                if (phase === 'in') {
                    targetZ = 0.8; // Zoom VERY close
                } else {
                    targetZ = 20.0; // Zoom FAR away (Disappear logic)
                }

            }
            // Loading Effect (App Init)
            else if (isLoading) {
                // Fast, clean spin on Y axis
                spinSpeed = 5.0;
                targetZ = 5;

                // Minimal "breathing" float
                meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
            }
            else {
                // Idle State - Gentle rotation interaction or slow drift?
                spinSpeed = 0.5;
                targetZ = 5;

                // Slower, deeper breathing for idle
                meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.0) * 0.15;
            }

            // Apply fixed tilt (to show an edge/face nicely)
            meshRef.current.rotation.x = 0.5;
            meshRef.current.rotation.z = 0.2;

            // SINGLE AXIS SPIN (Y-AXIS)
            meshRef.current.rotation.y += spinSpeed * state.clock.getDelta();

            // Smooth Camera Zoom - Faster Lerp (0.08)
            state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.08);

            // Look slightly up during zoom for dramatic angle
            if (isTransitioning && phase === 'in') {
                state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0.5, 0.08);
            } else {
                state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0, 0.08);
            }
            state.camera.lookAt(0, 0, 0);
        }
    });

    const getVaultColor = (tier: string | undefined) => {
        switch (tier) {
            case 'Wood': return '#8B4513';
            case 'Iron': return '#A9A9A9';
            case 'Gold': return '#FFD700';
            case 'Diamond': return '#00FFFF';
            case 'Ethereal': return '#7f13ec';
            default: return '#7f13ec';
        }
    };

    const color = getVaultColor(financialState?.vaultTier);

    return (
        <group position={[0, 0, 0]}>
            {/* The Core Crystal */}
            <mesh ref={meshRef} scale={1.5}>
                <icosahedronGeometry args={[1, 0]} />
                {/* Rigid Material - No Distortion */}
                <meshPhysicalMaterial
                    color={color}
                    envMapIntensity={1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    metalness={0.5}
                    roughness={0.1}
                />
                {/* Wireframe Overlay for Spin Visibility */}
                <mesh scale={1.01}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial color="white" wireframe transparent opacity={0.3} />
                </mesh>
            </mesh>

            {/* Orbiting Elements (Placeholder for investments) */}
            <mesh position={[2, 1, -1]} scale={0.2}>
                <sphereGeometry />
                <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={2} />
            </mesh>

            <mesh position={[-2, -1, 1]} scale={0.3}>
                <sphereGeometry />
                <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={2} />
            </mesh>

            {/* 3D Text Label - Metaphor Logic */}
            <Html position={[0, -1.8, 0]} center transform sprite>
                <div className="text-center pointer-events-none select-none" style={{ width: 'max-content' }}>
                    <h1 className="font-[Cinzel] tracking-widest drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                        style={{
                            fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                            color: '#d4af37'
                        }}>
                        LA BÓVEDA
                    </h1>
                    <p className="font-[Manrope] uppercase tracking-[0.3em] mb-2"
                        style={{
                            fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
                            color: 'rgba(255, 255, 255, 0.5)'
                        }}>
                        Oro Total
                    </p>
                    {financialState ? (
                        <div className="font-[Cardo] drop-shadow-md"
                            style={{
                                fontSize: 'clamp(1.2rem, 4vw, 2rem)',
                                color: 'white'
                            }}>
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(financialState.currentGold)}
                            <span className="ml-1" style={{ fontSize: '0.6em', color: '#d4af37' }}>GP</span>
                        </div>
                    ) : (
                        <div className="animate-pulse"
                            style={{
                                fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                                color: 'rgba(255, 255, 255, 0.3)'
                            }}>
                            Consultando Oráculo...
                        </div>
                    )}
                </div>
            </Html>
        </group>
    );
};

export default TheVault;
