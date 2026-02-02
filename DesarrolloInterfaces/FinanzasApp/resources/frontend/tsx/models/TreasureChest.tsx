import React, { useRef } from 'react';
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
    onClick
}) => {
    const groupRef = useRef<Group>(null);
    // const [hovered, setHovered] = useState(false); // Removed unused state

    // Attempt to load the model
    const { scene } = useGLTF('/models/chest.glb'); // Removed unused animations

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
        // onPointerOver={() => setHovered(true)} // Removed unused handlers
        // onPointerOut={() => setHovered(false)} // Removed unused handlers
        />
    );
};

// Preload
useGLTF.preload('/models/chest.glb');

export default TreasureChest;
