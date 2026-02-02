import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import { useDrag, useWheel } from '@use-gesture/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { IonIcon } from '@ionic/react';
import {
    homeOutline,
    walletOutline,
    statsChartOutline,
    briefcaseOutline
} from 'ionicons/icons';

// Mapping: Face Index -> Route & Label
const faces = [
    { id: 'dashboard', path: '/app/dashboard', label: 'DASHBOARD', rotationY: 0, icon: homeOutline, color: '#38bdf8' },
    { id: 'finances', path: '/app/finances', label: 'FINANZAS', rotationY: -Math.PI / 2, icon: walletOutline, color: '#c084fc' },
    { id: 'market', path: '/app/market', label: 'MERCADO', rotationY: -Math.PI, icon: statsChartOutline, color: '#facc15' },
    { id: 'inventory', path: '/app/inventory', label: 'ITEMS', rotationY: -Math.PI * 1.5, icon: briefcaseOutline, color: '#f87171' },
];

const DiceMesh = ({ navigate, currentPath }: { navigate: (p: string) => void, currentPath: string }) => {
    const meshRef = useRef<THREE.Group>(null);
    const [activeFace, setActiveFace] = useState(0);
    const [dragging, setDragging] = useState(false);

    // Critical fix: prevent useEffect snap-back during animation/drag
    const isPanning = useRef(false);

    const [{ rotationY, scale }, api] = useSpring(() => ({
        rotationY: 0,
        scale: 1,
        config: { mass: 1, tension: 150, friction: 25 }
    }));

    // Sync rotation with path only when NOT interacting
    useEffect(() => {
        const foundIndex = faces.findIndex(f => currentPath.includes(f.id));
        if (foundIndex !== -1 && !dragging && !isPanning.current) {
            setActiveFace(foundIndex);
            const targetRot = faces[foundIndex].rotationY;

            // Find shortest path to target
            const current = rotationY.get();
            const normalizedTarget = ((targetRot - current + Math.PI) % (Math.PI * 2)) - Math.PI;
            api.start({ rotationY: current + normalizedTarget, scale: 1 });
        }
    }, [currentPath, dragging, api, rotationY]);

    const handleSnap = (currentRot: number) => {
        isPanning.current = true;
        const step = Math.PI / 2;
        const snapIndexRaw = Math.round(-currentRot / step);

        let normalizedIndex = snapIndexRaw % 4;
        if (normalizedIndex < 0) normalizedIndex += 4;

        const targetRot = -snapIndexRaw * step;
        setActiveFace(normalizedIndex);

        api.start({
            rotationY: targetRot,
            scale: 1,
            config: { tension: 220, friction: 28 },
            onRest: () => {
                isPanning.current = false;
                navigate(faces[normalizedIndex].path);
            }
        });
    };

    // Drag support
    const bindDrag = useDrag(({ offset: [x], down }) => {
        setDragging(down);
        if (down) {
            isPanning.current = true;
            api.start({ rotationY: x / 150, scale: 1.1, immediate: true });
        } else {
            handleSnap(x / 150);
        }
    }, { from: () => [rotationY.get() * 150, 0] });

    // Wheel support
    const bindWheel = useWheel(({ movement: [x], active }) => {
        setDragging(active);
        const sensitivity = 0.002;
        const newRot = rotationY.get() - x * sensitivity;

        if (active) {
            isPanning.current = true;
            api.start({ rotationY: newRot, scale: 1.05, immediate: true });
        } else {
            handleSnap(newRot);
        }
    });

    return (
        <group {...bindDrag() as any} {...bindWheel() as any}>
            <a.group rotation-y={rotationY} scale={scale} ref={meshRef}>
                {/* Reverted to DICE shape (RoundedBox) */}
                <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.15} smoothness={4}>
                    <meshStandardMaterial
                        color="#0f172a"
                        metalness={0.9}
                        roughness={0.15}
                        emissive="#1e293b"
                        emissiveIntensity={0.5}
                    />

                    {/* FACES ICONS with Premium Glow */}
                    {faces.map((f, i) => {
                        // Determine face position based on ID
                        let position: [number, number, number] = [0, 0, 0.76];
                        let rotation: [number, number, number] = [0, 0, 0];

                        if (f.id === 'finances') { position = [0.76, 0, 0]; rotation = [0, Math.PI / 2, 0]; }
                        if (f.id === 'market') { position = [0, 0, -0.76]; rotation = [0, Math.PI, 0]; }
                        if (f.id === 'inventory') { position = [-0.76, 0, 0]; rotation = [0, -Math.PI / 2, 0]; }

                        return (
                            <Html
                                key={f.id}
                                position={position}
                                rotation={rotation}
                                transform
                                center
                                pointerEvents="none"
                            >
                                <div className={`flex flex-col items-center transition-all duration-500 ${activeFace === i ? 'scale-110' : 'scale-75 opacity-20'}`}>
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center border"
                                        style={{
                                            borderColor: `${f.color}44`,
                                            backgroundColor: activeFace === i ? `${f.color}33` : 'transparent',
                                            boxShadow: activeFace === i ? `0 0 15px ${f.color}66` : 'none'
                                        }}
                                    >
                                        <IonIcon icon={f.icon} style={{ color: f.color, fontSize: '28px' }} />
                                    </div>
                                </div>
                            </Html>
                        );
                    })}
                </RoundedBox>

                {/* Subtle outer glow orb (purely decorative) */}
                <mesh scale={1.2}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial color={faces[activeFace]?.color} transparent opacity={0.03} />
                </mesh>
            </a.group>

            {/* Dimensional HUD Label REMOVED as per user request (was overlapping) */}
        </group>
    );
};

const NavigationDice: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="fixed -bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 z-[1000] cursor-grab active:cursor-grabbing touch-none select-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 40 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#fff" />
                <pointLight position={[-10, -5, -10]} intensity={1} color={faces[0].color} />

                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
                    <DiceMesh navigate={navigate} currentPath={location.pathname} />
                </Float>
            </Canvas>
        </div>
    );
};

export default NavigationDice;
