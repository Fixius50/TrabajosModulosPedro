import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

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
    const groupRef = useRef<Group>(null);
    const { scene } = useGLTF('/models/coin.glb');

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * rotationSpeed;
        }
    });

    return (
        <primitive
            object={scene}
            ref={groupRef}
            position={position}
            scale={scale}
        // Additional fallback rotation if needed, but primitive usually respects scene
        />
    );
};

// Preload
useGLTF.preload('/models/coin.glb');

export default GoldCoin;
