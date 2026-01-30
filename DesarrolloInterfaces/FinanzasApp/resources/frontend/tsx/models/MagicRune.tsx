import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface MagicRuneProps {
    position?: [number, number, number];
    scale?: number;
    color?: string;
    glowIntensity?: number;
}

const MagicRune: React.FC<MagicRuneProps> = ({
    position = [0, 0, 0],
    scale = 1,
    color = "#9333ea",
    glowIntensity = 0.5
}) => {
    const groupRef = useRef<Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Outer ring */}
            <mesh>
                <torusGeometry args={[1, 0.1, 16, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={glowIntensity}
                    metalness={0.5}
                    roughness={0.2}
                />
            </mesh>

            {/* Inner symbols */}
            {[0, 1, 2, 3].map((i) => (
                <mesh
                    key={i}
                    position={[
                        Math.cos((i * Math.PI) / 2) * 0.7,
                        Math.sin((i * Math.PI) / 2) * 0.7,
                        0
                    ]}
                    rotation={[0, 0, (i * Math.PI) / 2]}
                >
                    <boxGeometry args={[0.3, 0.1, 0.1]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={glowIntensity * 1.5}
                    />
                </mesh>
            ))}

            {/* Center crystal */}
            <mesh>
                <octahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={glowIntensity * 2}
                    metalness={0.9}
                    roughness={0}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </group>
    );
};

export default MagicRune;
