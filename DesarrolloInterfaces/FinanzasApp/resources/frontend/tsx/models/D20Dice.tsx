import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface D20DiceProps {
    position?: [number, number, number];
    scale?: number;
    rotation?: [number, number, number];
    autoRotate?: boolean;
}

const D20Dice: React.FC<D20DiceProps> = ({
    position = [0, 0, 0],
    scale = 1,
    rotation = [0, 0, 0],
    autoRotate = true
}) => {
    const meshRef = useRef<Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current && autoRotate) {
            meshRef.current.rotation.x += delta * 0.3;
            meshRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
                color="#d4af37"
                metalness={0.8}
                roughness={0.2}
                emissive="#c5a059"
                emissiveIntensity={0.2}
            />
        </mesh>
    );
};

export default D20Dice;
