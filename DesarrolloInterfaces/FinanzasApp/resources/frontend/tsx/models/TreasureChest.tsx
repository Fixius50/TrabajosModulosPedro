import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

interface TreasureChestProps {
    position?: [number, number, number];
    scale?: number;
    isOpen?: boolean;
    onClick?: () => void;
}

const TreasureChest: React.FC<TreasureChestProps> = ({
    position = [0, 0, 0],
    scale = 1,
    isOpen = false,
    onClick
}) => {
    const groupRef = useRef<Group>(null);
    const [hovered, setHovered] = useState(false);

    // Attempt to load the model
    const { scene, animations } = useGLTF('/models/chest.glb');

    useFrame(() => {
        // Optional: Add simple floating or animation logic here if needed
    });

    return (
        <primitive
            object={scene}
            ref={groupRef}
            position={position}
            scale={scale}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        // Simple visual feedback for hover/open state if the model supports it 
        // otherwise we rely on the component props/logic
        />
    );
};

// Preload
useGLTF.preload('/models/chest.glb');

export default TreasureChest;
