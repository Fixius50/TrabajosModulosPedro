import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

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
    const lidRef = useRef<Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (lidRef.current) {
            const targetRotation = isOpen ? -Math.PI / 3 : 0;
            lidRef.current.rotation.x += (targetRotation - lidRef.current.rotation.x) * 0.1;
        }
    });

    return (
        <group
            position={position}
            scale={scale}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* Base */}
            <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[2, 0.6, 1.2]} />
                <meshStandardMaterial
                    color={hovered ? "#8B4513" : "#654321"}
                    metalness={0.3}
                    roughness={0.7}
                />
            </mesh>

            {/* Lid */}
            <mesh
                ref={lidRef}
                position={[0, 0.6, -0.6]}
                rotation={[0, 0, 0]}
            >
                <boxGeometry args={[2, 0.2, 1.2]} />
                <meshStandardMaterial
                    color={hovered ? "#8B4513" : "#654321"}
                    metalness={0.3}
                    roughness={0.7}
                />
            </mesh>

            {/* Gold trim */}
            <mesh position={[0, 0.3, 0.61]}>
                <boxGeometry args={[2.1, 0.1, 0.1]} />
                <meshStandardMaterial
                    color="#d4af37"
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Lock */}
            <mesh position={[0, 0.3, 0.65]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial
                    color="#FFD700"
                    metalness={1}
                    roughness={0}
                    emissive="#d4af37"
                    emissiveIntensity={isOpen ? 0 : 0.5}
                />
            </mesh>
        </group>
    );
};

export default TreasureChest;
