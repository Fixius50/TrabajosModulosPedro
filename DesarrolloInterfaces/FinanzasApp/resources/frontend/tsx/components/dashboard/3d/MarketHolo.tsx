import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line } from '@react-three/drei';
import * as THREE from 'three';

// Datos de gráfico simulados (puntos 3D)
const generateGraphPoints = () => {
    const points = [];
    let y = 0;
    for (let x = -5; x <= 5; x += 0.5) {
        y += (Math.random() - 0.4) * 2; // Random walk
        points.push(new THREE.Vector3(x, y, 0));
    }
    return points;
};

const points = generateGraphPoints();

const NeonGraph = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        // Oscilación suave de todo el gráfico
        groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3;
    });

    return (
        <group ref={groupRef}>
            {/* Línea principal */}
            <Line
                points={points}
                color="#38bdf8"
                lineWidth={3}
                opacity={0.8}
                transparent
            />
            {/* Sombra / Eco visual detrás */}
            <Line
                points={points}
                color="#ec4899"
                lineWidth={8}
                opacity={0.2}
                transparent
                position={[0, 0, -0.5]}
            />

            {/* Grid base */}
            <gridHelper args={[12, 12, 0x1e293b, 0x0f172a]} rotation={[Math.PI / 2, 0, 0]} position={[0, -3, 0]} />
        </group>
    );
};

const MarketHolo: React.FC = () => {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={0.5} />

                <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                    <NeonGraph />
                </Float>
            </Canvas>
        </div>
    );
};

export default MarketHolo;
