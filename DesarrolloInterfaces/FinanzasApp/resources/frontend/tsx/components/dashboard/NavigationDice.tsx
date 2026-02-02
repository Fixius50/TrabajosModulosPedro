import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import { useDrag, useWheel } from '@use-gesture/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html, RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';

// Mapping: Face Index -> Route & Label (Standard Terminology)
const faces = [
    { id: 'dashboard', path: '/app/dashboard', label: 'DASHBOARD', rotationY: 0, icon: '🏠' },
    { id: 'finances', path: '/app/finances', label: 'FINANZAS', rotationY: -Math.PI / 2, icon: '💰' },
    { id: 'market', path: '/app/market', label: 'MERCADO', rotationY: -Math.PI, icon: '📈' },
    { id: 'inventory', path: '/app/inventory', label: 'ITEMS', rotationY: -Math.PI * 1.5, icon: '📦' },
];

const DiceMesh = ({ navigate, currentPath }: { navigate: (p: string) => void, currentPath: string }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [activeFace, setActiveFace] = useState(0);
    const [dragging, setDragging] = useState(false);

    const [{ rotationY }, api] = useSpring(() => ({
        rotationY: 0,
        config: { mass: 1, tension: 180, friction: 24 }
    }));

    // Initial rotation based on path
    useEffect(() => {
        const foundIndex = faces.findIndex(f => currentPath.includes(f.id));
        if (foundIndex !== -1 && !dragging) {
            setActiveFace(foundIndex);
            api.start({ rotationY: faces[foundIndex].rotationY });
        }
    }, [currentPath, dragging, api]);

    const handleSnap = (xOffset: number) => {
        const step = Math.PI / 2;
        const currentRot = xOffset / 100;
        const snapIndexRaw = Math.round(-currentRot / step);

        let normalizedIndex = snapIndexRaw % 4;
        if (normalizedIndex < 0) normalizedIndex += 4;

        const targetRot = -snapIndexRaw * step;
        setActiveFace(normalizedIndex);

        api.start({
            rotationY: targetRot,
            config: { tension: 200, friction: 20 },
            onRest: () => {
                navigate(faces[normalizedIndex].path);
            }
        });
    };

    // Drag support
    const bindDrag = useDrag(({ offset: [x], down }) => {
        setDragging(down);
        if (down) {
            api.start({ rotationY: x / 100, immediate: true });
        } else {
            handleSnap(x);
        }
    }, { from: () => [rotationY.get() * 100, 0] });

    // Wheel support
    const bindWheel = useWheel(({ offset: [x], active }) => {
        setDragging(active);
        if (active) {
            api.start({ rotationY: x / 100, immediate: true });
        } else {
            handleSnap(x);
        }
    }, {
        from: () => [rotationY.get() * 100, 0]
    });

    const iconStyle = {
        fontSize: '40px',
        color: 'white',
        textShadow: '0 0 15px rgba(56, 189, 248, 1), 0 0 30px rgba(56, 189, 248, 0.5)',
        userSelect: 'none' as const
    };

    return (
        <group {...bindDrag() as any} {...bindWheel() as any}>
            <a.group rotation-y={rotationY}>
                {/* Visual Cube */}
                <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.1} smoothness={4} ref={meshRef}>
                    <meshStandardMaterial
                        color="#0f172a"
                        roughness={0.1}
                        metalness={0.9}
                        emissive="#38bdf8"
                        emissiveIntensity={0.3}
                    />

                    {/* FACES ICONS */}
                    {/* Front (Dashboard) */}
                    <Html transform position={[0, 0, 0.76]} center pointerEvents="none">
                        <div style={iconStyle}>🏠</div>
                    </Html>

                    {/* Right (Finances) */}
                    <Html transform position={[0.76, 0, 0]} rotation={[0, Math.PI / 2, 0]} center pointerEvents="none">
                        <div style={iconStyle}>💰</div>
                    </Html>

                    {/* Back (Market) */}
                    <Html transform position={[0, 0, -0.76]} rotation={[0, Math.PI, 0]} center pointerEvents="none">
                        <div style={iconStyle}>📈</div>
                    </Html>

                    {/* Left (Inventory) */}
                    <Html transform position={[-0.76, 0, 0]} rotation={[0, -Math.PI / 2, 0]} center pointerEvents="none">
                        <div style={iconStyle}>📦</div>
                    </Html>
                </RoundedBox>
            </a.group>

            {/* Ghost Dialog (Floating Title) */}
            <Html position={[0, 1.8, 0]} center style={{ pointerEvents: 'none', width: '200px', textAlign: 'center' }}>
                <div style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 20px',
                    borderRadius: '24px',
                    border: '1px solid rgba(56, 189, 248, 0.5)',
                    color: '#fff',
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 700,
                    fontSize: '12px',
                    letterSpacing: '1.5px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.2)',
                    opacity: dragging ? 1 : 0.85,
                    transform: `scale(${dragging ? 1.1 : 1})`,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    textTransform: 'uppercase'
                }}>
                    <span style={{ fontSize: '10px', opacity: 0.7, marginRight: '4px' }}>VER</span> {faces[activeFace]?.label}
                </div>
            </Html>
        </group>
    );
};

const NavigationDice: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '150px',
            height: '150px',
            zIndex: 1000,
            cursor: 'grab',
            touchAction: 'none'
        }}>
            {/* Canvas Container */}
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ background: 'transparent' }}>
                <ambientLight intensity={0.7} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#38bdf8" />
                <pointLight position={[-10, -5, -10]} intensity={1.5} color="#d4af37" />

                <Float speed={2.5} rotationIntensity={0.15} floatIntensity={0.5}>
                    <DiceMesh navigate={navigate} currentPath={location.pathname} />
                </Float>
            </Canvas>
        </div>
    );
};

export default NavigationDice;
