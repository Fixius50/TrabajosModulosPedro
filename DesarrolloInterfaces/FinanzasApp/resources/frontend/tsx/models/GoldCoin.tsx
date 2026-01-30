import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface GoldCoinProps {
    position?: [number, number, number];
    scale?: number;
    rotationSpeed?: number;
}

const GoldCoin: React.FC<GoldCoinProps> = ({
    position = [0, 0, 0],
    scale = 1,
    rotationSpeed = 2
}) => {
    const meshRef = useRef<Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * rotationSpeed;
        }
    });

    return (
        <mesh ref={meshRef} position={position} scale={scale} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
            <meshStandardMaterial
                color="#FFD700"
                metalness={1}
                roughness={0.1}
                emissive="#d4af37"
                emissiveIntensity={0.3}
            />
        </mesh>
    );
};

export default GoldCoin;
