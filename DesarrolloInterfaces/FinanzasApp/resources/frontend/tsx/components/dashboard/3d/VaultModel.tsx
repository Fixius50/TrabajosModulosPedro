import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// El modelo 3D del objeto dorado
const GoldenArtifact = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hover, setHover] = useState(false);

    useFrame((_state, delta) => {
        if (!meshRef.current) return;

        // Rotación base suave
        meshRef.current.rotation.y += delta * 0.5;

        // Si hay hover, rotamos más rápido en X también
        if (hover) {
            meshRef.current.rotation.x += delta * 2;
            meshRef.current.rotation.y += delta * 2;
        }
    });

    return (
        <mesh
            ref={meshRef}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={hover ? 2.2 : 2}
        >
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
                color="#d4af37"
                metalness={1}
                roughness={0.1}
                emissive="#d4af37"
                emissiveIntensity={hover ? 0.4 : 0.1}
            />
        </mesh>
    );
};

const VaultModel: React.FC = () => {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} color="#d4af37" intensity={2} />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <GoldenArtifact />
                </Float>

                <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} color="#d4af37" />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};

export default VaultModel;
