import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

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
    const groupRef = useRef<Group>(null);
    const { scene } = useGLTF('/models/d20.glb');

    useFrame((_, delta) => {
        if (groupRef.current && autoRotate) {
            groupRef.current.rotation.x += delta * 0.3;
            groupRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <primitive
            object={scene}
            ref={groupRef}
            position={position}
            rotation={rotation}
            scale={scale * 0.5}
        />
    );
};

// Pre-load the model
useGLTF.preload('/models/d20.glb');

export default D20Dice;
